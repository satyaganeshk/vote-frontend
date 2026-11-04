import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/AuthContext';
import { useVoting } from '../context/VotingContext';
import { useSnackbar } from '../context/SnackbarContext';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  CANDIDATE: 'Candidate',
  VOTER: 'Voter',
};

export const AppLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { error } = useVoting();
  const { notify } = useSnackbar();
  const lastShownError = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== lastShownError.current) {
      lastShownError.current = error;
      notify(error, 'error');
    }
  }, [error, notify]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="default" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <HowToVoteOutlinedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }} noWrap>
            Election Portal
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }} noWrap>
            {user?.name} {role ? `· ${ROLE_LABEL[role] ?? role}` : ''}
          </Typography>

          <Button
            variant="text"
            color="inherit"
            size="small"
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            onClick={logout}
          >
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 4 } }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.75rem',
        }}
      >
        East Godavari District Election Commission
      </Box>
    </Box>
  );
};
