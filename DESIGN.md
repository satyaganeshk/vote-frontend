# Design notes

Redesign of the voting portal UI. Logic, API calls, and contexts are unchanged — see the
"API / backend" section at the end for the one workaround that was needed to add image
uploads without touching the backend.

## Theme tokens (`src/theme.ts`)

| Token | Value | Use |
| --- | --- | --- |
| `primary` (navy) | `#0b3d66` | Brand, primary actions, focus ring |
| `secondary` / accent (teal) | `#0f766e` | Used sparingly: active nav state, a few highlights |
| Neutral grey scale | `#f7f8fa` → `#16181d` (10 steps) | Backgrounds, borders, secondary text |
| `shape.borderRadius` | `12px` | Cards, buttons, inputs, chips (chips use 8px) |
| Spacing grid | MUI default `8px` unit | All `sx` spacing props |
| Typography | `Inter` (400/500/600/700/800), loaded via Google Fonts in `index.html` | `h4`–`h6` bold/tight tracking, `button` weight 600, no uppercase text |
| Shadows | Two custom tokens: `subtleShadow` (cards, app bar) and `raisedShadow` (reserved for raised/hover states) | Flat, low-contrast — no default MUI elevation blur |
| Tap targets | `MuiButton`/`MuiIconButton` min-height 44px | Mobile accessibility |
| Focus states | `:focus-visible` outline in `index.css` + MUI default focus rings left intact | AA-visible keyboard focus |

No emoji anywhere in the UI — all icons are MUI `@mui/icons-material` "Outlined" variants, swapped in for the previous hand-drawn SVG icon set (`components/icons.tsx`, now removed as dead code) and the emoji party symbols (`🚲`, `🪭`, `🥛`) that used to stand in for party logos.

## Layout rules

- **Mobile-first.** Every screen is built at the `xs` breakpoint first; `sm`/`md` only add columns or switch a stacked layout to a side-by-side one.
- **App bar** is reduced to exactly: app name (left) + current user's name & role + "Sign out" (right). The old subtitle, colored role chip, and technical footer banner are gone.
- **Footer** is one neutral line, no technical/session copy.
- **Admin navigation** is a sticky left sidebar at `sm`+ and a fixed `BottomNavigation` on mobile — same four destinations (`Overview`, `Voters`, `Candidates`, `Results`), each a real route.
- **Forms that used to be modals** (nominate/add candidate) are now right-side `Drawer`s; the candidate approval flow opens a review `Drawer` instead of acting directly from the table row.
- **Feedback** — all success/error messages go through a single global `Snackbar` (`SnackbarContext` + `useSnackbar()`), replacing the old per-screen inline `Alert` banners. Persistent *state* banners (e.g. "pending authorization", nomination status) stay inline since they aren't transient feedback.
- **Loading** — every data-bearing screen renders MUI `Skeleton` placeholders shaped like the real content while its context's `loading` flag is true, instead of a blank screen or spinner-only state.
- **Empty states** — "no candidates yet", "no voters match your search", "nothing waiting on review", etc. are explicit, calm messages rather than an empty table/grid.
- **Confirmation** is reserved for destructive-looking actions only: revoking a voter's authorization and rejecting a candidate nomination each show a confirm dialog. Approving a voter/candidate and casting a vote (a plain "Vote for X (Party)?" confirm, no warning copy) do not need a second destructive-style confirmation.

## Routing (`react-router-dom`)

```
/login                 Voter sign-in (default)
/login/admin            Admin sign-in
/login/candidate        Candidate sign-in

/                        → redirects to the signed-in user's home route
/vote                    Voter ballot                    (VOTER only)
/candidate               Candidate profile                (CANDIDATE only)
/admin                   Admin → Overview                 (ADMIN only)
/admin/voters            Admin → Voters
/admin/candidates        Admin → Candidates
/admin/results           Admin → Results
```

`RequireAuth` and `RequireRole` (`src/components/RouteGuards.tsx`) guard every authenticated route; an unauthenticated visit redirects to `/login`, and a role mismatch redirects to `/` (which then resolves to that user's own home page).

## Component list

New files:

- `src/theme.ts` — the MUI theme described above.
- `src/context/SnackbarContext.tsx` — global toast provider/hook.
- `src/components/RouteGuards.tsx` — `RequireAuth`, `RequireRole`, `RoleHome`.
- `src/components/ImageUploadField.tsx` — file picker + live preview, used for candidate/party photos.
- `src/pages/admin/AdminLayout.tsx` — sidebar (desktop) / bottom nav (mobile) shell for the admin section.
- `src/pages/admin/Overview.tsx`, `Voters.tsx`, `Candidates.tsx`, `Results.tsx` — the four admin pages (previously one tabbed `AdminDashboard.tsx`).

Rewritten in place (same responsibility, redesigned UI, same context/API calls):

- `src/App.tsx` — now sets up the router, theme, and providers.
- `src/pages/VotingApp.tsx` — repurposed as `AppLayout` (app bar + footer + `<Outlet/>`).
- `src/components/LoginScreen.tsx` — one form per route instead of tabs; no demo-credential box.
- `src/components/VoterBallot.tsx`, `src/components/CandidateProfile.tsx` — redesigned per the UI spec.

Removed (fully superseded, no longer imported anywhere):

- `src/components/AdminDashboard.tsx` → replaced by `pages/admin/*`.
- `src/components/icons.tsx` → replaced by `@mui/icons-material` imports.

Unchanged: `src/context/AuthContext.tsx`, `src/context/VotingContext.tsx`, `src/models/index.ts` — same endpoints, same state shape.

## API / backend changes needed

**None required** — the backend was not touched, and the app still only calls the endpoints documented in `vote-backend/README.md`.

One workaround, worth knowing about: the design asks for image **upload with preview** for candidate photos and party logos, but the backend only has `symbolPhotoUrl` / `candidatePhotoUrl` as plain `TEXT` columns (no file storage or upload endpoint). `ImageUploadField` reads the chosen file with `FileReader` and encodes it as a base64 `data:` URL, which is then sent as the value of those same string fields — so it works against the existing API unchanged. This is fine for a demo, but a base64 image is stored directly in SQLite and sent over the wire on every fetch; a real deployment would want a dedicated upload endpoint (e.g. `POST /api/uploads`) that returns a CDN/object-storage URL instead.
