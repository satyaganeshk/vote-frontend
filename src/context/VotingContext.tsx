import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Candidate, ElectionStats } from '../models';
import { useAuth } from './AuthContext';

interface VotingContextType {
  currentUser: User | null;
  users: User[];
  candidates: Candidate[];
  stats: ElectionStats;
  loading: boolean;
  error: string | null;
  castVote: (candidateId: string) => Promise<{ success: boolean; message: string }>;
  approveVoter: (userId: string, isApproved: boolean) => Promise<void>;
  reviewCandidate: (candidateId: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  registerCandidate: (candidate: Omit<Candidate, 'id' | 'approvalStatus' | 'voteCount'>) => Promise<void>;
  registerVoter: (voter: { name: string; voterId: string; email: string; constituency?: string }) => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VotingContext = createContext<VotingContextType | null>(null);

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: currentUser, token, logout, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<ElectionStats>({
    totalRegisteredUsers: 0,
    totalApprovedVoters: 0,
    totalVotesCast: 0,
    votingPercentage: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const refreshData = useCallback(async () => {
    if (!token || !currentUser) {
      setUsers([]);
      setCandidates([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Public / Voter candidate list
      if (currentUser.role === 'VOTER') {
        const candRes = await fetch(`${API_BASE}/candidates`, { headers: getHeaders() });
        if (candRes.status === 401) {
          logout();
          return;
        }
        if (candRes.ok) {
          const candData: Candidate[] = await candRes.json();
          setCandidates(candData);
        }
      }

      // Admin views
      if (currentUser.role === 'ADMIN') {
        const [votersRes, candRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/admin/voters`, { headers: getHeaders() }),
          fetch(`${API_BASE}/admin/candidates`, { headers: getHeaders() }),
          fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() }),
        ]);

        if (votersRes.status === 401 || candRes.status === 401 || statsRes.status === 401) {
          logout();
          return;
        }

        if (votersRes.ok) {
          const votersData: User[] = await votersRes.json();
          setUsers(votersData);
        }

        if (candRes.ok) {
          const candData: Candidate[] = await candRes.json();
          setCandidates(candData);
        }

        if (statsRes.ok) {
          const statsData: ElectionStats = await statsRes.json();
          setStats(statsData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with election server.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, token, getHeaders, logout]);

  useEffect(() => {
    if (token && currentUser) {
      refreshData();
    }
  }, [token, currentUser, refreshData]);

  // Admin view shows aggregate counts that change whenever any voter casts a
  // ballot elsewhere, so poll the backend instead of relying on stale state.
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'ADMIN') return;
    const intervalId = window.setInterval(() => {
      refreshData();
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [token, currentUser, refreshData]);

  const castVote = async (candidateId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !token) return { success: false, message: 'No active voter session.' };

    try {
      const res = await fetch(`${API_BASE}/vote`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          logout();
        }
        return { success: false, message: data.error || 'Failed to submit vote.' };
      }
      await refreshUser();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while casting vote.' };
    }
  };

  const approveVoter = async (userId: string, isApproved: boolean): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/admin/voters/${userId}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isApproved }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to update voter approval status', err);
    }
  };

  const reviewCandidate = async (candidateId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/admin/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to review candidate status', err);
    }
  };

  const registerCandidate = async (
    newCand: Omit<Candidate, 'id' | 'approvalStatus' | 'voteCount'>
  ): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/candidates/nominate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newCand),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to register candidate', err);
    }
  };

  const registerVoter = async (voter: {
    name: string;
    voterId: string;
    email: string;
    constituency?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/admin/voters`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(voter),
      });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        return { success: false, message: 'Session expired.' };
      }
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to register voter.' };
      }
      await refreshData();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while registering voter.' };
    }
  };

  return (
    <VotingContext.Provider
      value={{
        currentUser,
        users,
        candidates,
        stats,
        loading,
        error,
        castVote,
        approveVoter,
        reviewCandidate,
        registerCandidate,
        registerVoter,
        refreshData,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
