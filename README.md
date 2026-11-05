# Vote Frontend

React + TypeScript single-page app for the **East Godavari District Election Commission** demo — a secure, role-guarded voting portal with three completely different experiences depending on who is signed in: **Voter**, **Candidate**, or **Admin**.

Pairs with the [vote-backend](../vote-backend) Express/SQLite API.

## Tech stack

- **React 18** + **TypeScript**, bootstrapped with **Vite 5**
- **MUI (Material UI) 5** — `@mui/material`, `@mui/icons-material`, `@emotion/*` for styling
- React Context for state: `AuthContext` (session/JWT, stored in `sessionStorage`) and `VotingContext` (candidates, users, stats, vote actions)
- No router — a single role-guard switch (`VotingApp.tsx`) decides what to render

## What the UI actually looks like

The whole app sits on a custom MUI theme: a deep navy primary (`#0f3a6a`), an amber/bronze secondary (`#b45309`), a near-white page background (`#f8fafc`), and `Inter` as the font. Every logged-in screen shares the same dark-navy (`#0b2447`) app bar and footer:

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🗳️  ELECTION COMMISSION • EAST GODAVARI        [ROLE: Full Name]  [Sign Out] │
│     Secure Role-Guarded Democratic Voting System                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                     ← role-specific screen renders here →               │
│                                                                          │
├──────────────────────────────────────────────────────────────────────┤
│   Session Guard Active • Storage Isolated to sessionStorage • Secret   │
│                      Ballot Invariant Enforced                          │
└──────────────────────────────────────────────────────────────────────┘
```

The role badge in the top-right changes color per role: amber/"warning" for Admin, bronze/"secondary" for Candidate, blue/"info" for Voter.

### 1. Login screen (before authentication)

> **Note:** this mockup predates two changes — login is now routed per role (`/login`, `/login/admin`, `/login/candidate` in `LoginScreen.tsx`) rather than tabs on one screen, and **Voter sign-in no longer uses a PIN**. A voter enters only their Voter ID, gets emailed a one-time code, then enters that code to sign in — see [vote-backend/README.md](../vote-backend/README.md#domain-model--three-roles-three-different-logins).

A centered card on the plain background with a **3-tab** switcher — Voter / Admin / Candidate — each tab is its own form, so the same screen handles all three logins:

```
                 ┌───────────────┐
                 │   🗳️ (navy)   │
                 └───────────────┘
                  ELECTION PORTAL
      District Election Commission • East Godavari
┌────────────────────────────────────────────────────┐
│  [ 🗳️  Voter ]   [ 🛡️  Admin ]   [ 🪪  Candidate ]   │ ← full-width tabs
├────────────────────────────────────────────────────┤
│  Citizen Voter Authentication                        │
│  Enter your official Voter ID and secure 4-digit PIN. │
│                                                        │
│  Voter ID        [ e.g. eg-voter-101            ]     │
│  Security PIN    [ ••••                         ]     │
│                                                        │
│          [ 🗳️  Sign In as Voter ]                     │ ← full-width button
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ Demo Test Credentials:                        │    │
│  │ • eg-voter-101 / PIN 1234                      │    │
│  │ • eg-voter-102 / PIN 1234                      │    │
│  └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

Switching to the **Admin** or **Candidate** tab swaps the Voter-ID/PIN fields for an email + password form, swaps the button color (amber for Admin, bronze for Candidate), and shows its own demo-credential hint box. Invalid logins surface a red `Alert` banner above the form — always a generic "Invalid ..." message, never revealing which field was wrong.

### 2. Voter view — the ballot

What a signed-in **VOTER** sees is a status banner followed by a responsive grid of candidate cards:

```
┌──────────────────────────────────────────────────────────────────┐
│ Official Ballot • East Godavari District        [ 🔵 Eligible to Vote ] │
│ Voter ID: eg-voter-101 | Name: ... | Constituency: Kakinada City   │
└──────────────────────────────────────────────────────────────────┘

Official Candidates (East Godavari District)        [ 3 Approved Nominees ]
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ [ candidate photo]│  │ [ candidate photo]│  │ [ candidate photo]│
│ Konda Babu      🚲│  │ Chandrasekhar   🪭│  │ Pantham Nanaji  🥛│
│ Kakinada City      │  │ Kakinada City      │  │ Kakinada Rural     │
│ [ TDP ]            │  │ [ YSRCP ]          │  │ [ JSP ]            │
│ "Expansion of the  │  │ "Welfare disburse- │  │ "Youth tech hubs   │
│  Kakinada port..." │  │  ments for..."     │  │  along NH-16..."   │
│ ─────────────────  │  │ ─────────────────  │  │ ─────────────────  │
│ Symbol: 🚲  [ Vote]│  │ Symbol: 🪭  [ Vote]│  │ Symbol: 🥛  [ Vote]│
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

Cards lift slightly on hover. Clicking **Vote** opens a confirmation dialog ("Is this the candidate you want to vote for?") showing the candidate's avatar, name, and party, plus a red warning that the vote is permanent. Confirming calls the API; on success the whole screen is replaced by a **"Thank You For Voting!"** card with a large green checkmark, and the session auto-logs-out 5 seconds later. If a voter re-opens the ballot after already voting, they instead see a **"You Have Already Voted"** card with the same layout.

If the voter hasn't been approved by an Admin yet, the status chip turns amber/"Not Authorized by Admin", a warning `Alert` explains they need to contact the Election Commission, and every **Vote** button is disabled.

### 3. Candidate view — profile & nomination dashboard

```
┌───────────────────┐  ┌──────────────────────────────────────────┐
│  [ candidate photo]│  │ Electoral & Party Credentials   [ ✏️ Edit Profile ] │
│    (260px tall)     │  ├──────────────────────────────────────────┤
│  Konda Babu          │  │ Party Symbol: 🚲          Account Email: ...  │
│  Telugu Desam Party   │  │                                              │
│  [ Kakinada City ]    │  │ Electoral Manifesto                          │
│  ───────────────────  │  │ ┌──────────────────────────────────────┐   │
│  🗳️ Total Confirmed   │  │ │ Expansion of Kakinada deep-water port,│   │
│     Votes               │  │ │ modern cold-storage for aqua farmers, │   │
│     1420                │  │ │ and smart city infrastructure...      │   │
└───────────────────┘  │ └──────────────────────────────────────┘   │
                          └──────────────────────────────────────────┘
      Status chip (top-right of page): [ ✅ Status: APPROVED ]
```

Clicking **Edit Profile** turns the read-only fields into text inputs (party symbol, candidate photo URL, party symbol/logo URL, a multi-line manifesto box) and swaps the button to **Save Changes**. A success/error `Alert` confirms the result after saving.

### 4. Admin view — election administration dashboard

The richest screen: four color-coded KPI cards up top, then a 3-tab management console.

```
East Godavari Election Administration                [ + Nominate Candidate ]
Official Returning Officer Panel • AP Legislative Assembly Monitoring

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│REGISTERED │ │AUTHORIZED │ │ BALLOTS   │ │  VOTER    │
│ VOTERS     │ │ VOTERS     │ │ RECORDED  │ │ TURNOUT   │
│    7   👥  │ │    5   ✅  │ │   5   🗳️  │ │  71%  📊  │
│ (blue)      │ │ (cyan)      │ │ (green)    │ │ (bronze)   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

[ Voter Authorization ] [ Candidate Approvals ] [ Election Results & Tallies ]
```

- **Voter Authorization tab** — a table of every voter/candidate account: name + ID, constituency, email, a "Voted / Not Voted Yet" chip, an "Approved to Vote / Restricted" chip, and an **Approve Voter** / **Revoke Approval** action button per row (revoke is disabled once that person has already voted).
- **Candidate Approvals tab** — a table with the candidate's photo + name, party logo + name + symbol, constituency, a truncated manifesto, a status chip (`PENDING` amber / `APPROVED` green / `REJECTED` red), and **Approve** / **Reject** buttons.
- **Election Results & Tallies tab** — one card per approved candidate with their symbol avatar, name/party/constituency, a live vote count + percentage, and a horizontal progress bar — explicitly labeled as anonymized, aggregate-only data ("individual ballots are decoupled from voters").

**+ Nominate Candidate** opens a modal form (name, party name, party symbol/emoji, constituency, logo URL, candidate photo URL, manifesto) so an Admin can register a candidate directly — submitted nominations still require a separate Approve action in the Candidate Approvals tab.

## Demo credentials

| Role      | Identifier                   | Secret          |
| --------- | ------------------------------ | ----------------- |
| Admin     | `admin@elections.ap.gov.in`    | `admin@123`        |
| Candidate | `kondababu.tdp@gmail.com`       | `candidate@123`     |
| Voter (approved)     | `eg-voter-101`   | OTP emailed on sign-in (seeded voter emails are placeholder addresses — register a real voter via the admin dashboard to actually test this) |
| Voter (not approved) | `eg-voter-105`   | OTP emailed on sign-in |

## Getting started

```bash
cd vote-frontend
npm install
npm run dev       # http://localhost:5173
```

Make sure the [vote-backend](../vote-backend) is running too (`npm run dev` in that folder, default `http://localhost:5000`). If the API isn't on `localhost:5000`, point the frontend at it with a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

Other scripts:

```bash
npm run build      # tsc -b && vite build -> dist/
npm run preview    # preview the production build locally
```

## Project structure

```
vote-frontend/
└─ src/
   ├─ App.tsx                     # Wraps the app in AuthProvider + VotingProvider
   ├─ pages/VotingApp.tsx          # App bar, footer, role-guard router (Voter/Candidate/Admin/Login)
   ├─ components/
   │  ├─ LoginScreen.tsx           # 3-tab login (Voter / Admin / Candidate)
   │  ├─ VoterBallot.tsx           # Candidate grid, vote confirmation dialog, voted/thank-you states
   │  ├─ AdminDashboard.tsx        # KPI cards, voter/candidate/results tabs, nominate-candidate modal
   │  ├─ CandidateProfile.tsx      # Own profile view/edit + live vote count
   │  └─ icons.tsx                  # Re-exported MUI icon set used across the app
   ├─ context/
   │  ├─ AuthContext.tsx            # JWT/session storage, auto-logout on token expiry
   │  └─ VotingContext.tsx          # Candidates/users/stats fetching + vote/approve/review actions
   └─ models/index.ts               # Shared TypeScript types (mirrors the backend's models)
```

## Session & security behavior worth knowing

- Auth state lives in `sessionStorage` (cleared on tab close), not `localStorage`.
- The JWT's `exp` claim is decoded client-side to schedule an automatic logout the moment the token expires.
- After a successful vote, the session is force-logged-out after 5 seconds to prevent any further interaction with that ballot.
- Every write action (`castVote`, `approveVoter`, `reviewCandidate`, `registerCandidate`) re-fetches fresh state from the API afterward rather than trusting optimistic local updates.
