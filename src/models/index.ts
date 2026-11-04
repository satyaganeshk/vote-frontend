export type Role = 'ADMIN' | 'VOTER' | 'CANDIDATE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApprovedVoter: boolean;
  hasVoted: boolean;
}

export type CandidateApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Candidate {
  id: string;
  name: string;
  partyName: string;
  partySymbol: string;      // Emoji or icon/symbol identifier
  symbolPhotoUrl?: string;  // Image URL for party logo/symbol
  candidatePhotoUrl?: string; // Image URL for candidate photo
  manifesto?: string;
  approvalStatus: CandidateApprovalStatus;
  voteCount?: number;       // Admin aggregate count only
}

export interface ElectionStats {
  totalRegisteredUsers: number;
  totalApprovedVoters: number;
  totalVotesCast: number;
  votingPercentage: number;
}
