# Frontend Architecture & Implementation Specification

## Overview
This document specifies the technical architecture, models, role-based access control (RBAC) rules, and strict democratic electoral guarantees implemented in the `vote-frontend` repository. This file serves as the handover specification for the backend service implementation.

---

## 1. Directory Structure

The frontend is intentionally compact and structured to avoid unnecessary folder depth while maintaining clean separation of concerns:

```text
vote-frontend/
├── src/
│   ├── models/
│   │   └── index.ts               # Core domain interfaces, types & enums (User, Candidate, Role, etc.)
│   ├── context/
│   │   └── VotingContext.tsx      # State management, local persistence & election actions
│   ├── components/
│   │   ├── icons.tsx              # Compact Material Design SVG icon primitives
│   │   ├── VoterBallot.tsx        # Citizen voting ballot, candidate cards & confirmation dialog
│   │   └── AdminDashboard.tsx     # Administrator election commission dashboard (approvals & tally)
│   ├── pages/
│   │   └── VotingApp.tsx          # Main role-switched view container & simulation top bar
│   ├── App.tsx                    # Root provider wrapper
│   └── main.tsx                   # React 18 DOM mount point
├── package.json
└── tsconfig.app.json
```

---

## 2. Domain Models & Types (`src/models/index.ts`)

### `Role`
```typescript
export type Role = 'ADMIN' | 'VOTER' | 'CANDIDATE';
```

### `User`
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApprovedVoter: boolean;
  hasVoted: boolean;
}
```

### `CandidateApprovalStatus` & `Candidate`
```typescript
export type CandidateApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Candidate {
  id: string;
  name: string;
  partyName: string;
  partySymbol: string;        // Text / Emoji symbol (e.g., 🌱, ⚡, 🏛️)
  symbolPhotoUrl?: string;    // Party emblem / logo URL
  candidatePhotoUrl?: string; // Nominee portrait photo URL
  manifesto?: string;         // Policy pledges and manifesto
  approvalStatus: CandidateApprovalStatus;
  voteCount?: number;         // Aggregate tally (visible to Admin only; anonymous)
}
```

### `ElectionStats`
```typescript
export interface ElectionStats {
  totalRegisteredUsers: number;
  totalApprovedVoters: number;
  totalVotesCast: number;
  votingPercentage: number;
}
```

---

## 3. Strict Electoral Security & RBAC Invariants

1. **Strict Single-Vote Guarantee**:
   - A voter can vote **only once**.
   - No warnings or second chances; once a vote is confirmed, `hasVoted = true`.
   - Modifying, deleting, or retracting a cast vote is strictly prohibited.
2. **Anonymous Ballot Separation (Anti-Coercion)**:
   - When a ballot is cast, the candidate's `voteCount` is incremented in aggregate.
   - The user's record is marked `hasVoted = true` without storing candidate choice on the user record.
   - **Even Administrators CANNOT see who voted for whom.** The Admin only sees aggregate vote counts per approved candidate.
3. **Admin Voter Authorization Gate**:
   - Administrators decide who is approved to vote (`isApprovedVoter = true`).
   - Unapproved citizens cannot vote.
   - Once a citizen has cast their vote, an Admin cannot revoke or delete that vote.
4. **Candidate Nomination & Approval**:
   - Candidates register with their party name, party symbol, emblem image URL, portrait photo URL, and manifesto.
   - New candidates default to `PENDING` approval.
   - Only `APPROVED` candidates appear on the active voting ballot.
   - Admin cannot vote (strictly neutral).

---

## 4. UI Components & Interaction Flow

- **Single Confirmation Dialog**:
  - Voters click "Vote" on an approved candidate card.
  - A modal appears: *"Confirm Ballot Submission: Is this the candidate you want to vote for?"*
  - Clicking *"Yes, Submit Vote"* permanently commits the ballot.
- **Admin Dashboard**:
  - **Tab 1: Voter Authorization**: List of all citizens with approval toggle (`Approve Voter` / `Revoke Approval` if unvoted).
  - **Tab 2: Candidate Approvals**: List of nominees with Approve/Reject actions and preview of symbol/portrait.
  - **Tab 3: Election Results & Tallies**: Real-time progress bars showing aggregate candidate votes and percentage of turnout.
