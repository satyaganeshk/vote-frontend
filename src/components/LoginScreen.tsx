import React, { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Container,
  Stack,
  Link,
} from '@mui/material';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

type LoginVariant = 'VOTER' | 'ADMIN' | 'CANDIDATE';

const COPY: Record<LoginVariant, { title: string; subtitle: string }> = {
  VOTER: {
    title: 'Sign in to vote',
    subtitle: 'Enter your Voter ID and PIN.',
  },
  ADMIN: {
    title: 'Admin sign in',
    subtitle: 'Election administration access.',
  },
  CANDIDATE: {
    title: 'Candidate sign in',
    subtitle: 'Manage your nomination and profile.',
  },
};

export const LoginScreen: React.FC<{ variant: LoginVariant }> = ({ variant }) => {
  const { loginVoter, loginCredential, isAuthenticated } = useAuth();
  const { notify } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [voterId, setVoterId] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result =
      variant === 'VOTER'
        ? await loginVoter({ voterId: voterId.trim(), pin: pin.trim() })
        : await loginCredential({ email: email.trim(), password: password.trim(), role: variant });

    setLoading(false);
    if (!result.success) {
      notify(result.error || 'Sign-in failed. Please try again.', 'error');
    }
  };

  const { title, subtitle } = COPY[variant];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <HowToVoteOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight={800}>
            Election Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            East Godavari District
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {variant === 'VOTER' ? (
                  <>
                    <TextField
                      label="Voter ID"
                      value={voterId}
                      onChange={(e) => setVoterId(e.target.value)}
                      disabled={loading}
                      autoFocus
                      fullWidth
                      required
                    />
                    <TextField
                      label="PIN"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={loading}
                      inputProps={{ maxLength: 8 }}
                      fullWidth
                      required
                    />
                  </>
                ) : (
                  <>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoFocus
                      fullWidth
                      required
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      fullWidth
                      required
                    />
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          {variant === 'VOTER' ? (
            <>
              <Link component={RouterLink} to="/login/admin" variant="body2" underline="hover">
                Admin sign in
              </Link>
              <Link component={RouterLink} to="/login/candidate" variant="body2" underline="hover">
                Candidate sign in
              </Link>
            </>
          ) : (
            <Link component={RouterLink} to="/login" variant="body2" underline="hover">
              Back to voter sign in
            </Link>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
