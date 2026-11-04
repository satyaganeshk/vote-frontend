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
  Alert,
  CircularProgress,
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
      main: '#0f3a6a', // AP Election Commission blue
    },
    secondary: {
      main: '#b45309', // Amber
    },
    background: {
      default: '#f1f5f9',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
});

export const VotingApp: React.FC = () => {
  const { currentUser, users, switchUser, loading, error } = useVoting();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Bar */}
        <AppBar position="sticky" elevation={2} sx={{ bgcolor: '#0b2447' }}>
          <Toolbar>
            <HowToVoteIcon sx={{ mr: 1.5, fontSize: 32, color: '#38bdf8' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 0.5 }}>
                ELECTION COMMISSION • EAST GODAVARI
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.300', display: 'block' }}>
                Democratic Single-Vote RBAC Platform • Andhra Pradesh Assembly Constituencies
              </Typography>
            </Box>

            {/* Current Role Badge */}
            <Chip
              icon={currentUser?.role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
              label={`Role: ${currentUser?.role || 'GUEST'}`}
              color={currentUser?.role === 'ADMIN' ? 'warning' : 'info'}
              sx={{ mr: 2, fontWeight: 'bold' }}
            />

            {/* Simulated Session Switcher */}
            <FormControl size="small" sx={{ minWidth: 280, bgcolor: 'rgba(255, 255, 255, 0.12)', borderRadius: 1 }}>
              <InputLabel id="user-select-label" sx={{ color: 'grey.300' }}>
                Active Electoral Account
              </InputLabel>
              <Select
                labelId="user-select-label"
                value={currentUser?.id || ''}
                label="Active Electoral Account"
                onChange={(e) => switchUser(e.target.value)}
                sx={{
                  color: '#fff',
                  '.MuiSvgIcon-root': { color: '#fff' },
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
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

        {/* Global Loading / Error Notifications */}
        <Container maxWidth="lg" sx={{ flexGrow: 1, my: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error} - Make sure the backend server is running (`http://localhost:5000`).
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading election data from backend...</Typography>
            </Box>
          ) : currentUser?.role === 'ADMIN' ? (
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
            bgcolor: '#0b2447',
            color: 'grey.400',
            textAlign: 'center',
            fontSize: '0.875rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          East Godavari District Election Portal • Strictly Restricted Secret Ballot Protocol
        </Box>
      </Box>
    </ThemeProvider>
  );
};
