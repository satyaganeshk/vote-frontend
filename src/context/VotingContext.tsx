import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Candidate, ElectionStats } from '../models';

interface VotingContextType {
  currentUser: User | null;
  users: User[];
  candidates: Candidate[];
  stats: ElectionStats;
  switchUser: (userId: string) => void;
  castVote: (candidateId: string) => { success: boolean; message: string };
  approveVoter: (userId: string, isApproved: boolean) => void;
  reviewCandidate: (candidateId: string, status: 'APPROVED' | 'REJECTED') => void;
  registerCandidate: (candidate: Omit<Candidate, 'id' | 'approvalStatus' | 'voteCount'>) => void;
}

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-1',
    name: 'Eleanor Vance (Election Commissioner)',
    email: 'admin@elections.gov',
    role: 'ADMIN',
    isApprovedVoter: false,
    hasVoted: false,
  },
  {
    id: 'u-voter-1',
    name: 'Satya K.',
    email: 'satya@example.com',
    role: 'VOTER',
    isApprovedVoter: true,
    hasVoted: false,
  },
  {
    id: 'u-voter-2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'VOTER',
    isApprovedVoter: true,
    hasVoted: false,
  },
  {
    id: 'u-voter-3',
    name: 'Marcus Brody',
    email: 'marcus@example.com',
    role: 'VOTER',
    isApprovedVoter: false,
    hasVoted: false,
  },
  {
    id: 'u-cand-1',
    name: 'Dr. Jane Cooper',
    email: 'jane@greenfuture.org',
    role: 'CANDIDATE',
    isApprovedVoter: true,
    hasVoted: false,
  },
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Dr. Jane Cooper',
    partyName: 'Green Future Alliance',
    partySymbol: '🌱',
    symbolPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=160&auto=format&fit=crop&q=80',
    candidatePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    manifesto: 'Clean tech transition, public health modernization, and fair citizen dividend.',
    approvalStatus: 'APPROVED',
    voteCount: 12,
  },
  {
    id: 'cand-2',
    name: 'Alexandria Sterling',
    partyName: 'Innovation & Tech Coalition',
    partySymbol: '⚡',
    symbolPhotoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&auto=format&fit=crop&q=80',
    candidatePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    manifesto: 'High-speed nationwide infrastructure, AI education in public schools, and tax credits for startups.',
    approvalStatus: 'APPROVED',
    voteCount: 19,
  },
  {
    id: 'cand-3',
    name: 'Robert Hayes',
    partyName: 'Heritage & Unity Party',
    partySymbol: '🏛️',
    symbolPhotoUrl: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=160&auto=format&fit=crop&q=80',
    candidatePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    manifesto: 'Strengthening community governance, family security support, and cultural preservation funds.',
    approvalStatus: 'PENDING',
    voteCount: 0,
  },
];

const VotingContext = createContext<VotingContextType | null>(null);

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('voting_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('voting_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('voting_current_user_id') || INITIAL_USERS[1].id;
  });

  useEffect(() => {
    localStorage.setItem('voting_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('voting_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('voting_current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  // RBAC Voting Logic:
  // 1. Must be authenticated
  // 2. Must be approved voter
  // 3. User cannot vote twice (strict policy: once voted, hasVoted = true, no undo/delete)
  // 4. Candidate must be APPROVED by admin
  const castVote = (candidateId: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'No active session.' };
    }
    if (currentUser.role === 'ADMIN') {
      return { success: false, message: 'Administrators are strictly neutral and prohibited from voting.' };
    }
    if (!currentUser.isApprovedVoter) {
      return { success: false, message: 'You are not approved by the election administrator to cast a vote.' };
    }
    if (currentUser.hasVoted) {
      return { success: false, message: 'Vote already recorded. Strict policy: Multiple or modified votes are prohibited.' };
    }

    const targetCandidate = candidates.find((c) => c.id === candidateId && c.approvalStatus === 'APPROVED');
    if (!targetCandidate) {
      return { success: false, message: 'Selected candidate is not approved for election.' };
    }

    // Mark current user as having voted (irreversible)
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, hasVoted: true } : u))
    );

    // Increment aggregate candidate vote count (voter identity remains anonymous & decoupled)
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, voteCount: (c.voteCount || 0) + 1 } : c))
    );

    return { success: true, message: 'Your ballot has been officially and permanently submitted.' };
  };

  // Admin action: Grant or revoke voter approval
  const approveVoter = (userId: string, isApproved: boolean) => {
    if (currentUser.role !== 'ADMIN') return;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isApprovedVoter: isApproved } : u))
    );
  };

  // Admin action: Approve or reject candidate nomination
  const reviewCandidate = (candidateId: string, status: 'APPROVED' | 'REJECTED') => {
    if (currentUser.role !== 'ADMIN') return;
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, approvalStatus: status } : c))
    );
  };

  // Register candidate application (defaults to PENDING until Admin approves)
  const registerCandidate = (newCand: Omit<Candidate, 'id' | 'approvalStatus' | 'voteCount'>) => {
    const created: Candidate = {
      ...newCand,
      id: `cand-${Date.now()}`,
      approvalStatus: 'PENDING',
      voteCount: 0,
    };
    setCandidates((prev) => [...prev, created]);
  };

  const totalRegisteredUsers = users.length;
  const totalApprovedVoters = users.filter((u) => u.isApprovedVoter).length;
  const totalVotesCast = candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
  const votingPercentage =
    totalApprovedVoters > 0 ? Math.round((totalVotesCast / totalApprovedVoters) * 100) : 0;

  const stats: ElectionStats = {
    totalRegisteredUsers,
    totalApprovedVoters,
    totalVotesCast,
    votingPercentage,
  };

  return (
    <VotingContext.Provider
      value={{
        currentUser,
        users,
        candidates,
        stats,
        switchUser,
        castVote,
        approveVoter,
        reviewCandidate,
        registerCandidate,
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
