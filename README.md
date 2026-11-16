# Vote Frontend (`vote-frontend`)

A secure, role-based democratic electronic voting frontend built with **React 18**, **TypeScript**, **Material UI (MUI)**, and **Vite**.

Designed specifically for the Andhra Pradesh Legislative Assembly Constituencies in the **East Godavari District** (Kakinada City, Kakinada Rural, Rajahmundry City, Rajahmundry Rural, Pithapuram, Amalapuram).

---

## 📸 Visual UI Walkthrough & Layouts

### 1. Unified Authentication Portal
A tabbed, credential-safe login interface with generic error masking:
```text
+---------------------------------------------------------------------------------+
|                       ELECTION COMMISSION - EAST GODAVARI                       |
|                             OFFICIAL VOTING PORTAL                              |
|                                                                                 |
|       [ (V) Voter Portal ]       [ (A) Returning Officer ]      [ (C) Candidate ]|
|  +---------------------------------------------------------------------------+  |
|  | Citizen Voter Authentication                                              |  |
|  | Enter your official Voter ID and secure 4-digit PIN                       |  |
|  |                                                                           |  |
|  | Voter ID:    [ eg-voter-101                                           ]   |  |
|  | Security PIN [ ****                                                   ]   |  |
|  |                                                                           |  |
|  | [                   SIGN IN AS CITIZEN VOTER                          ]   |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

### 2. Citizen Voter Ballot Screen (`role: 'VOTER'`)
Once authenticated, eligible voters see approved candidates with symbols, manifestos, and portraits:
```text
+---------------------------------------------------------------------------------+
| [Icon] ELECTION COMMISSION - EAST GODAVARI        [Role: VOTER] [ Sign Out ]    |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Official Ballot - East Godavari District           [ Status: Eligible to Vote ] |
| Voter ID: eg-voter-101 | Name: Chundru Venkata Satyanarayana Murthy             |
| Constituency: Kakinada City                                                     |
|                                                                                 |
| ------------------------------------------------------------------------------- |
| Approved Election Candidates (4 Nominees)                                       |
|                                                                                 |
| +-------------------------+ +-------------------------+ +---------------------+ |
| | [ Candidate Portrait ]  | | [ Candidate Portrait ]  | | [ Candidate Photo ] | |
| | Vanamadi Venkateswara   | | Dwarampudi Chandrasekhar| | Pantham Nanaji      | |
| | Rao (Konda Babu)        | | Reddy                   | |                     | |
| | [TDP]         (🚲) Logo | | [YSRCP]       (🪭) Logo | | [JSP]     (🥛) Logo | |
| | Port expansion & cold   | | Welfare disbursements   | | Youth tech hubs &   | |
| | storage modernization   | | & harbor hospital fund  | | flood embankments   | |
| |                         | |                         | |                     | |
| | Symbol: 🚲 Bicycle      | | Symbol: 🪭 Fan          | | Symbol: 🥛 Glass    | |
| | [       VOTE          ] | | [       VOTE          ] | | [       VOTE      ] | |
| +-------------------------+ +-------------------------+ +---------------------+ |
+---------------------------------------------------------------------------------+
```

### 3. Strict Confirmation Modal
Clicking "Vote" immediately triggers a confirmation dialog:
```text
+--------------------------------------------------------+
| Confirm Ballot Submission                              |
| ------------------------------------------------------ |
| Is this the candidate you want to vote for?            |
|                                                        |
|   (🚲) Vanamadi Venkateswara Rao (Konda Babu)          |
|        Telugu Desam Party (TDP) - 🚲 Bicycle           |
|                                                        |
| [!] Strict policy: Once submitted, your vote is        |
|     permanent and cannot be retracted, edited, or      |
|     re-voted.                                          |
|                                                        |
|               [ Cancel ]    [ Yes, Submit Vote ]       |
+--------------------------------------------------------+
```

### 4. Post-Vote Thank-You & Session Isolation Screen
After submitting, the session token is destroyed in `sessionStorage` and a permanent lock screen appears:
```text
+---------------------------------------------------------------------------------+
|                                                                                 |
|                            (✓) CheckCircle                                      |
|                       Thank You For Voting!                                     |
|                                                                                 |
|   Your secret ballot has been permanently cast in the East Godavari election.   |
|   Your session has been securely closed to protect your ballot privacy.         |
|                                                                                 |
|   [i] Voter ID: eg-voter-101 • Constituency: Kakinada City                     |
|       Ballot status: Permanent & Immutable                                      |
|                                                                                 |
|                          [ Return to Login ]                                    |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

### 5. Returning Officer Admin Dashboard (`role: 'ADMIN'`)
Admins approve voters, review nominations, and view tally statistics without seeing who voted for whom:
```text
+---------------------------------------------------------------------------------+
| [Icon] ELECTION COMMISSION - EAST GODAVARI        [Role: ADMIN] [ Sign Out ]    |
+---------------------------------------------------------------------------------+
| [ TOTAL VOTERS: 7 ]  [ AUTHORIZED: 5 ]  [ BALLOTS RECORDED: 4 ]  [ TURNOUT: 80% ]|
| ------------------------------------------------------------------------------- |
| [ Voter Authorization ]      [ Candidate Approvals ]      [ Results & Tallies ] |
|                                                                                 |
| Citizen Name         | Constituency   | Ballot Status | Authorization | Action  |
| ---------------------|----------------|---------------|---------------|-------- |
| C.V. Satyanarayana   | Kakinada City  | [ Voted ]     | [ Authorized ]| Locked  |
| A. Sita Lakshmi Devi | Rajahmundry    | [ Not Voted ] | [ Authorized ]| [Revoke]|
| M. Surya Narayana    | Pithapuram     | [ Not Voted ] | [ Restricted ]| [Approve|
+---------------------------------------------------------------------------------+
```

### 6. Candidate Profile & Nomination View (`role: 'CANDIDATE'`)
Nominees view their campaign manifesto, symbol logo, and live vote counter:
```text
+---------------------------------------------------------------------------------+
| Candidate Profile & Nomination Dashboard                    [ Status: APPROVED ]|
| ------------------------------------------------------------------------------- |
| +-----------------------+  +--------------------------------------------------+ |
| | [ Candidate Photo ]   |  | Electoral & Party Credentials        [Edit Profile]| |
| | Vanamadi Venkateswara |  | Party Symbol: 🚲 Bicycle                           | |
| | Rao (Konda Babu)      |  | Account: kondababu.tdp@gmail.com                   | |
| | Constituency: Kakinada|  |                                                    | |
| |                       |  | Electoral Manifesto:                               | |
| | [ Total Votes: 1420 ] |  | Expansion of Kakinada deep-water port, modern cold | |
| +-----------------------+  | storage facilities for coastal aqua farmers...     | |
|                            +--------------------------------------------------+ |
+---------------------------------------------------------------------------------+
```

---

## 🛡️ Core Electoral Rules & Invariants

1. **Role-Based Guards (RBAC)**:
   - `VOTER`: Allowed only on the ballot screen. If `hasVoted === true`, immediately blocked with "You have already voted".
   - `CANDIDATE`: Restricted to their own candidate profile (`/api/candidate/me`).
   - `ADMIN`: Restricted to voter management, candidate approvals, and turnout tallies.
   - Wrong routes automatically redirect users to their designated role home.
2. **Session Security**:
   - Authentication tokens are kept in **`sessionStorage`** (never `localStorage`), ensuring credentials are automatically purged upon tab or browser close.
   - Built-in timer automatically logs the user out when the JWT expires.
3. **Generic Error Messages**:
   - Bad login requests return a uniform error (`"Invalid voter ID or PIN."` or `"Invalid email or password."`), preventing username enumeration or credential leaking.
4. **Secret Ballot Guarantee**:
   - Even administrators cannot see which candidate a voter chose. Only aggregate candidate totals are displayed.

---

## 🚀 Setup & Execution

### 1. Environment Configuration
Create `.env` in `vote-frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install & Start
```bash
cd vote-frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

| Role | Identifier / Email | PIN / Password | Details |
|---|---|---|---|
| **Voter** | `eg-voter-101` | `1234` | Approved voter (Kakinada City) |
| **Voter** | `eg-voter-102` | `1234` | Approved voter (Rajahmundry City) |
| **Voter** | `eg-voter-105` | `1234` | Pending authorization voter |
| **Admin** | `admin@elections.ap.gov.in` | `admin@123` | District Election Officer |
| **Candidate** | `kondababu.tdp@gmail.com` | `candidate@123` | TDP Nominee (Kakinada City) |
