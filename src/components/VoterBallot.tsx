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
  DialogContentText,
  DialogActions,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  HowToVoteIcon,
  CheckCircleIcon,
  LockIcon,
  BlockIcon,
} from './icons';
import { useVoting } from '../context/VotingContext';
import type { Candidate } from '../models';

export const VoterBallot: React.FC = () => {
  const { currentUser, candidates, castVote } = useVoting();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
    setConfirmOpen(false);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setSelectedCandidate(null);
  };

  const canVote = currentUser && currentUser.role !== 'ADMIN' && currentUser.isApprovedVoter && !currentUser.hasVoted;

  return (
    <Box sx={{ py: 3 }}>
      {/* Voter Status Banner */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              East Godavari District Official Ballot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voter ID: <strong>{currentUser?.id}</strong> | Name: <strong>{currentUser?.name}</strong> | Constituency: <strong>{currentUser?.constituency || 'East Godavari'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            {currentUser?.hasVoted ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Vote Cast (Single-Vote Policy)"
                color="success"
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            ) : !currentUser?.isApprovedVoter ? (
              <Chip
                icon={<LockIcon />}
                label="Not Approved by Admin"
                color="warning"
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            ) : (
              <Chip
                icon={<HowToVoteIcon />}
                label="Eligible to Vote"
                color="primary"
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Grid>
        </Grid>

        {feedback && (
          <Alert severity={feedback.type} sx={{ mt: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        {currentUser?.hasVoted && (
          <Alert severity="info" icon={<LockIcon />} sx={{ mt: 2 }}>
            You have already cast your ballot. Under democratic tamper-proof policy, your vote cannot be altered, viewed by third parties, or re-cast.
          </Alert>
        )}
      </Box>

      {/* Candidate List */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600">
          Official Candidates (East Godavari District)
        </Typography>
        <Chip label={`${approvedCandidates.length} Approved Nominees`} color="primary" variant="outlined" size="small" />
      </Box>

      <Grid container spacing={3}>
        {approvedCandidates.map((candidate) => (
          <Grid item xs={12} md={4} key={candidate.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              }}
            >
              {candidate.candidatePhotoUrl && (
                <CardMedia
                  component="img"
                  height="220"
                  image={candidate.candidatePhotoUrl}
                  alt={candidate.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {candidate.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Constituency: {candidate.constituency || 'East Godavari'}
                    </Typography>
                  </Box>
                  <Avatar
                    src={candidate.symbolPhotoUrl}
                    sx={{ width: 44, height: 44, bgcolor: 'primary.light', fontSize: '1.2rem', flexShrink: 0 }}
                  >
                    {candidate.partySymbol.slice(0, 2)}
                  </Avatar>
                </Box>

                <Chip label={candidate.partyName} color="secondary" size="small" sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 45 }}>
                  {candidate.manifesto || 'No manifesto provided.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Symbol:
                    </Typography>
                    <Typography variant="body2" fontWeight="700">
                      {candidate.partySymbol}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={currentUser?.hasVoted ? <BlockIcon /> : <HowToVoteIcon />}
                    disabled={!canVote || submitting}
                    onClick={() => handleVoteClick(candidate)}
                  >
                    {currentUser?.hasVoted ? 'Already Voted' : 'Vote'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog: Strict Confirmation Only */}
      <Dialog open={confirmOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Confirm Ballot Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: 'text.primary' }}>
            Is this the candidate you want to vote for?
          </DialogContentText>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar src={selectedCandidate?.symbolPhotoUrl} sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}>
              {selectedCandidate?.partySymbol.slice(0, 2)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="700">
                {selectedCandidate?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCandidate?.partyName} ({selectedCandidate?.partySymbol})
              </Typography>
            </Box>
          </Box>
          <DialogContentText sx={{ mt: 2, fontSize: '0.85rem', color: 'error.main' }}>
            Note: Once confirmed, your vote is permanent. Strict policy forbids voting again or withdrawing this ballot.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmVote} variant="contained" color="primary" autoFocus disabled={submitting}>
            {submitting ? 'Submitting...' : 'Yes, Submit Vote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
