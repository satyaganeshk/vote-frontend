import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Skeleton,
  Stack,
} from '@mui/material';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useVoting } from '../context/VotingContext';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import type { Candidate } from '../models';

const CandidateCardSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton width="60%" height={28} />
      <Skeleton width="40%" />
      <Skeleton width="90%" sx={{ mt: 1 }} />
      <Skeleton width="80%" />
      <Skeleton width="100%" height={44} sx={{ mt: 2 }} />
    </CardContent>
  </Card>
);

export const VoterBallot: React.FC = () => {
  const { candidates, castVote, loading } = useVoting();
  const { user, logout } = useAuth();
  const { notify } = useSnackbar();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasVotedSuccess, setHasVotedSuccess] = useState(false);

  const approvedCandidates = candidates.filter((c) => c.approvalStatus === 'APPROVED');

  const handleVoteClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setConfirmOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    setSubmitting(true);
    const result = await castVote(selectedCandidate.id);
    setSubmitting(false);
    setConfirmOpen(false);
    if (result.success) {
      setHasVotedSuccess(true);
      setTimeout(() => logout(), 4000);
    } else {
      notify(result.message, 'error');
    }
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setSelectedCandidate(null);
  };

  if (user?.hasVoted || hasVotedSuccess) {
    return (
      <Box sx={{ py: { xs: 4, sm: 8 }, maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {hasVotedSuccess ? 'Thank you for voting' : 'You have already voted'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {hasVotedSuccess
            ? 'Your ballot has been recorded. You will be signed out shortly.'
            : 'Your ballot was already recorded. Each voter may cast one vote.'}
        </Typography>
        <Button variant="outlined" onClick={logout}>
          Return to sign in
        </Button>
      </Box>
    );
  }

  const canVote = user && user.role === 'VOTER' && user.isApprovedVoter && !user.hasVoted;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Cast your vote
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name} · {user?.constituency || 'East Godavari'}
          </Typography>
        </Box>
        {!user?.isApprovedVoter ? (
          <Chip icon={<LockOutlinedIcon />} label="Not yet authorized" color="warning" variant="outlined" />
        ) : (
          <Chip icon={<HowToVoteOutlinedIcon />} label="Eligible to vote" color="success" variant="outlined" />
        )}
      </Stack>

      {!user?.isApprovedVoter && (
        <Card sx={{ mb: 3, borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
          <CardContent>
            <Typography variant="body2">
              Your registration is awaiting authorization from the Election Commission. You will be
              able to vote once an administrator approves your account.
            </Typography>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <CandidateCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : approvedCandidates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              No candidates available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The ballot will appear here once candidates are approved by the Election Commission.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {approvedCandidates.map((candidate) => (
            <Grid item xs={12} sm={6} md={4} key={candidate.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={candidate.candidatePhotoUrl || undefined}
                  alt={candidate.name}
                  sx={{ objectFit: 'cover', bgcolor: 'grey.100' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar
                      src={candidate.symbolPhotoUrl || undefined}
                      variant="rounded"
                      sx={{ width: 36, height: 36, bgcolor: 'grey.100' }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {candidate.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {candidate.constituency || 'East Godavari'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip label={candidate.partyName} size="small" sx={{ alignSelf: 'flex-start', mb: 1.5 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {candidate.manifesto || 'No manifesto provided.'}
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={!canVote ? <BlockOutlinedIcon /> : <HowToVoteOutlinedIcon />}
                    disabled={!canVote || submitting}
                    onClick={() => handleVoteClick(candidate)}
                  >
                    Vote
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={confirmOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm your vote</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Vote for <strong>{selectedCandidate?.name}</strong> ({selectedCandidate?.partyName})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmVote} variant="contained" disabled={submitting} autoFocus>
            {submitting ? 'Submitting…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
