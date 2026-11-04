import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Select,
  MenuItem,
  Chip,
  Container,
  FormControl,
  InputLabel,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  HowToVoteIcon,
  AdminPanelSettingsIcon,
  PersonIcon,
} from '../components/icons';
import { useVoting } from '../context/VotingContext';
import { VoterBallot } from '../components/VoterBallot';
import { AdminDashboard } from '../components/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Deep navy
    },
    secondary: {
      main: '#0284c7', // Sky blue
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
});

export const VotingApp: React.FC = () => {
  const { currentUser, users, switchUser } = useVoting();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Bar */}
        <AppBar position="sticky" elevation={2} sx={{ bgcolor: '#0f172a' }}>
          <Toolbar>
            <HowToVoteIcon sx={{ mr: 1.5, fontSize: 32, color: '#38bdf8' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 0.5 }}>
                VOTE SPHERE
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.400' }}>
                Secure Role-Based Democratic Electronic Voting
              </Typography>
            </Box>

            {/* Current Role Indicator */}
            <Chip
              icon={currentUser?.role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
              label={`Role: ${currentUser?.role || 'GUEST'}`}
              color={currentUser?.role === 'ADMIN' ? 'warning' : 'info'}
              sx={{ mr: 2, fontWeight: 'bold' }}
            />

            {/* User Switcher (For demo and testing RBAC behavior) */}
            <FormControl size="small" sx={{ minWidth: 260, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
              <InputLabel id="user-select-label" sx={{ color: 'grey.300' }}>
                Simulate Account
              </InputLabel>
              <Select
                labelId="user-select-label"
                value={currentUser?.id || ''}
                label="Simulate Account"
                onChange={(e) => switchUser(e.target.value)}
                sx={{
                  color: '#fff',
                  '.MuiSvgIcon-root': { color: '#fff' },
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} ({u.role}{u.role === 'VOTER' && (u.isApprovedVoter ? ' - Approved' : ' - Restricted')})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>

        {/* Dynamic RBAC Main Container */}
        <Container maxWidth="lg" sx={{ flexGrow: 1, my: 4 }}>
          {currentUser?.role === 'ADMIN' ? (
            <AdminDashboard />
          ) : (
            <VoterBallot />
          )}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            bgcolor: '#0f172a',
            color: 'grey.400',
            textAlign: 'center',
            fontSize: '0.875rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Secure Single-Vote RBAC Architecture • Ballots are Immutable & Anonymously Tallied
        </Box>
      </Box>
    </ThemeProvider>
  );
};
