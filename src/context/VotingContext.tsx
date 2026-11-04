import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Candidate, ElectionStats } from '../models';

interface VotingContextType {
  currentUser: User | null;
  users: User[];
  candidates: Candidate[];
  stats: ElectionStats;
  loading: boolean;
  error: string | null;
  switchUser: (userId: string) => void;
  castVote: (candidateId: string) => Promise<{ success: boolean; message: string }>;
  approveVoter: (userId: string, isApproved: boolean) => Promise<void>;
  reviewCandidate: (candidateId: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  registerCandidate: (candidate: Omit<Candidate, 'id' | 'approvalStatus' | 'voteCount'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VotingContext = createContext<VotingContextType | null>(null);

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<ElectionStats>({
    totalRegisteredUsers: 0,
    totalApprovedVoters: 0,
    totalVotesCast: 0,
    votingPercentage: 0,
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('voting_current_user_id') || '';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;

  // Headers helper with dynamic role session header
  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (currentUser?.id) {
      headers['X-User-Id'] = currentUser.id;
    }
    return headers;
  }, [currentUser?.id]);

  // Fetch all live data from backend API
  const refreshData = useCallback(async () => {
    try {
      setError(null);

      // 1. Fetch Users
      const usersRes = await fetch(`${API_BASE}/users`);
      if (!usersRes.ok) throw new Error('Failed to fetch voter registry.');
      const usersData: User[] = await usersRes.json();
      setUsers(usersData);

      // Auto-select initial user if none set
      if (!currentUserId && usersData.length > 1) {
        const defaultVoter = usersData.find((u) => u.role === 'VOTER') || usersData[0];
        setCurrentUserId(defaultVoter.id);
        localStorage.setItem('voting_current_user_id', defaultVoter.id);
      }

      // Determine active role
      const activeUser = usersData.find((u) => u.id === (currentUserId || usersData[0]?.id));
      const isAdmin = activeUser?.role === 'ADMIN';

      // 2. Fetch Candidates (Admin endpoint gets counts and pending candidates; public gets approved)
      const candUrl = isAdmin && activeUser?.id ? `${API_BASE}/admin/candidates` : `${API_BASE}/candidates`;
      const candHeaders = activeUser?.id ? { 'X-User-Id': activeUser.id } : {};

      const candRes = await fetch(candUrl, { headers: candHeaders });
      if (candRes.ok) {
        const candData: Candidate[] = await candRes.json();
        setCandidates(candData);
      }

      // 3. Fetch Admin Election Stats
      if (isAdmin && activeUser?.id) {
        const statsRes = await fetch(`${API_BASE}/admin/stats`, {
          headers: { 'X-User-Id': activeUser.id },
        });
        if (statsRes.ok) {
          const statsData: ElectionStats = await statsRes.json();
          setStats(statsData);
        }
      } else {
        const totalRegistered = usersData.filter((u) => u.role !== 'ADMIN').length;
        const totalApproved = usersData.filter((u) => u.role !== 'ADMIN' && u.isApprovedVoter).length;
        const totalVoted = usersData.filter((u) => u.role !== 'ADMIN' && u.hasVoted).length;
        setStats({
          totalRegisteredUsers: totalRegistered,
          totalApprovedVoters: totalApproved,
          totalVotesCast: totalVoted,
          votingPercentage: totalApproved > 0 ? Math.round((totalVoted / totalApproved) * 100) : 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to election backend.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('voting_current_user_id', userId);
  };

  // Cast vote via real API endpoint
  const castVote = async (candidateId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'No active session.' };

    try {
      const res = await fetch(`${API_BASE}/vote`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to submit vote.' };
      }
      await refreshData();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while casting vote.' };
    }
  };

  // Admin action: approve/revoke voter authorization
  const approveVoter = async (userId: string, isApproved: boolean): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/admin/voters/${userId}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to update voter approval status', err);
    }
  };

  // Admin action: review candidate nomination
  const reviewCandidate = async (candidateId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/admin/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to review candidate status', err);
    }
  };

  // Candidate Nomination submission to real API
  const registerCandidate = async (
    newCand: Omit<Candidate, 'id' | 'approvalStatus' | 'voteCount'>
  ): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/candidates/nominate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCand),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to register candidate', err);
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
        switchUser,
        castVote,
        approveVoter,
        reviewCandidate,
        registerCandidate,
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
