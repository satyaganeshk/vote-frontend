import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { VotingProvider } from './context/VotingContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { RequireAuth, RequireRole, RoleHome } from './components/RouteGuards';
import { LoginScreen } from './components/LoginScreen';
import { AppLayout } from './pages/VotingApp';
import { VoterBallot } from './components/VoterBallot';
import { CandidateProfile } from './components/CandidateProfile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Overview } from './pages/admin/Overview';
import { Voters } from './pages/admin/Voters';
import { Candidates } from './pages/admin/Candidates';
import { Results } from './pages/admin/Results';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <AuthProvider>
          <VotingProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginScreen variant="VOTER" />} />
                <Route path="/login/admin" element={<LoginScreen variant="ADMIN" />} />
                <Route path="/login/candidate" element={<LoginScreen variant="CANDIDATE" />} />

                <Route element={<RequireAuth />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<RoleHome />} />

                    <Route element={<RequireRole allow={['VOTER']} />}>
                      <Route path="vote" element={<VoterBallot />} />
                    </Route>

                    <Route element={<RequireRole allow={['CANDIDATE']} />}>
                      <Route path="candidate" element={<CandidateProfile />} />
                    </Route>

                    <Route element={<RequireRole allow={['ADMIN']} />}>
                      <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<Overview />} />
                        <Route path="voters" element={<Voters />} />
                        <Route path="candidates" element={<Candidates />} />
                        <Route path="results" element={<Results />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<RoleHome />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </VotingProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
