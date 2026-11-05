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
    subtitle: 'Enter your Voter ID — we’ll email you a one-time code.',
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

const OTP_RESEND_COOLDOWN_SECONDS = 30;

export const LoginScreen: React.FC<{ variant: LoginVariant }> = ({ variant }) => {
  const { requestVoterOtp, verifyVoterOtp, loginCredential, isAuthenticated } = useAuth();
  const { notify } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterId.trim()) return;
    setLoading(true);
    const result = await requestVoterOtp(voterId.trim());
    setLoading(false);
    if (result.success) {
      setOtpSentTo(result.message);
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    } else {
      notify(result.message, 'error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    const result = await verifyVoterOtp(voterId.trim(), otp.trim());
    setLoading(false);
    if (!result.success) {
      notify(result.error || 'Sign-in failed. Please try again.', 'error');
    }
  };

  const handleChangeVoterId = () => {
    setOtpSentTo(null);
    setOtp('');
    setCooldown(0);
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || !voterId.trim()) return;
    setLoading(true);
    const result = await requestVoterOtp(voterId.trim());
    setLoading(false);
    if (result.success) {
      setOtpSentTo(result.message);
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    } else {
      notify(result.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginCredential({ email: email.trim(), password: password.trim(), role: variant as 'ADMIN' | 'CANDIDATE' });
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

            {variant === 'VOTER' ? (
              otpSentTo ? (
                <form onSubmit={handleVerifyOtp}>
                  <Stack spacing={2}>
                    <Typography variant="body2" color="success.main">
                      {otpSentTo}
                    </Typography>
                    <TextField
                      label="One-time code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      autoFocus
                      fullWidth
                      required
                      inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                    >
                      {loading ? 'Verifying…' : 'Verify & sign in'}
                    </Button>
                    <Stack direction="row" justifyContent="space-between">
                      <Link component="button" type="button" variant="body2" onClick={handleChangeVoterId}>
                        Change Voter ID
                      </Link>
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={handleResendOtp}
                        sx={{ color: cooldown > 0 ? 'text.disabled' : undefined, pointerEvents: cooldown > 0 ? 'none' : undefined }}
                      >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                      </Link>
                    </Stack>
                  </Stack>
                </form>
              ) : (
                <form onSubmit={handleRequestOtp}>
                  <Stack spacing={2}>
                    <TextField
                      label="Voter ID"
                      value={voterId}
                      onChange={(e) => setVoterId(e.target.value)}
                      disabled={loading}
                      autoFocus
                      fullWidth
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
                    >
                      {loading ? 'Sending…' : 'Send one-time code'}
                    </Button>
                  </Stack>
                </form>
              )
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
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
            )}
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
