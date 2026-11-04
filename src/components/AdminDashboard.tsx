import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Avatar,
  Tab,
  Tabs,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  CheckCircleIcon,
  CancelIcon,
  PeopleIcon,
  HowToVoteIcon,
  VerifiedUserIcon,
  AddCircleOutlineIcon,
  AssessmentIcon,
} from './icons';
import { useVoting } from '../context/VotingContext';

export const AdminDashboard: React.FC = () => {
  const { users, candidates, stats, approveVoter, reviewCandidate, registerCandidate } = useVoting();
  const [activeTab, setActiveTab] = useState(0);

  // Modal for nominating candidate
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partySymbol, setPartySymbol] = useState('');
  const [symbolPhotoUrl, setSymbolPhotoUrl] = useState('');
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState('');
  const [constituency, setConstituency] = useState('Kakinada City');
  const [manifesto, setManifesto] = useState('');

  const voters = users.filter((u) => u.role !== 'ADMIN');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !partyName || !partySymbol) return;
    await registerCandidate({
      name,
      partyName,
      partySymbol,
      symbolPhotoUrl: symbolPhotoUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Telugu_Desam_Party_flag.svg/240px-Telugu_Desam_Party_flag.svg.png',
      candidatePhotoUrl: candidatePhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      constituency,
      manifesto,
    });
    setOpenModal(false);
    setName('');
    setPartyName('');
    setPartySymbol('');
    setSymbolPhotoUrl('');
    setCandidatePhotoUrl('');
    setManifesto('');
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Header & Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700">
              East Godavari Election Administration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Official Returning Officer Panel • Andhra Pradesh Legislative Assembly Monitoring
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpenModal(true)}
          >
            Nominate Candidate
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      REGISTERED VOTERS
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalRegisteredUsers}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      AUTHORIZED VOTERS
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalApprovedVoters}
                    </Typography>
                  </Box>
                  <VerifiedUserIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      BALLOTS RECORDED
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalVotesCast}
                    </Typography>
                  </Box>
                  <HowToVoteIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'secondary.main', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      VOTER TURNOUT
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.votingPercentage}%
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Voter Authorization" />
          <Tab label="Candidate Approvals" />
          <Tab label="Election Results & Tallies" />
        </Tabs>
      </Box>

      {/* Tab 0: Voter Management */}
      {activeTab === 0 && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Citizen / Voter Name</strong></TableCell>
                <TableCell><strong>Constituency</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Ballot Status</strong></TableCell>
                <TableCell><strong>Authorization</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voters.map((voter) => (
                <TableRow key={voter.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      {voter.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {voter.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{voter.constituency || 'East Godavari'}</TableCell>
                  <TableCell>{voter.email}</TableCell>
                  <TableCell>
                    {voter.hasVoted ? (
                      <Chip label="Voted" color="success" size="small" icon={<CheckCircleIcon />} />
                    ) : (
                      <Chip label="Not Voted Yet" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {voter.isApprovedVoter ? (
                      <Chip label="Approved to Vote" color="primary" size="small" />
                    ) : (
                      <Chip label="Restricted / Not Approved" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {/* Admin can authorize or revoke vote eligibility before vote is cast */}
                    {voter.isApprovedVoter ? (
                      <Button
                        size="small"
                        color="error"
                        disabled={voter.hasVoted}
                        onClick={() => approveVoter(voter.id, false)}
                      >
                        Revoke Approval
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => approveVoter(voter.id, true)}
                      >
                        Approve Voter
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 1: Candidate Approval List */}
      {activeTab === 1 && (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Candidate</strong></TableCell>
                <TableCell><strong>Party & Symbol</strong></TableCell>
                <TableCell><strong>Constituency</strong></TableCell>
                <TableCell><strong>Manifesto</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Admin Decision</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((cand) => (
                <TableRow key={cand.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={cand.candidatePhotoUrl}
                        alt={cand.name}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700">
                          {cand.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {cand.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={cand.symbolPhotoUrl}
                        sx={{ width: 34, height: 34, bgcolor: 'secondary.light', fontSize: '1rem' }}
                      >
                        {cand.partySymbol.slice(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {cand.partyName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Symbol: {cand.partySymbol}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{cand.constituency || 'East Godavari'}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" noWrap title={cand.manifesto}>
                      {cand.manifesto || 'No manifesto'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cand.approvalStatus}
                      color={
                        cand.approvalStatus === 'APPROVED'
                          ? 'success'
                          : cand.approvalStatus === 'PENDING'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {cand.approvalStatus !== 'APPROVED' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => reviewCandidate(cand.id, 'APPROVED')}
                        >
                          Approve
                        </Button>
                      )}
                      {cand.approvalStatus !== 'REJECTED' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => reviewCandidate(cand.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2: Results & Aggregate Tallies (Strictly Anonymous) */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Under democratic secrecy policy, individual ballots are decoupled from voters. Only aggregated participant counts are revealed.
          </Typography>

          <Grid container spacing={3}>
            {candidates
              .filter((c) => c.approvalStatus === 'APPROVED')
              .map((cand) => {
                const percentage =
                  stats.totalVotesCast > 0
                    ? Math.round(((cand.voteCount || 0) / stats.totalVotesCast) * 100)
                    : 0;

                return (
                  <Grid item xs={12} md={6} key={cand.id}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={cand.symbolPhotoUrl}
                            sx={{ width: 44, height: 44, bgcolor: 'primary.light', fontSize: '1.2rem' }}
                          >
                            {cand.partySymbol.slice(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="700">
                              {cand.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {cand.partyName} ({cand.partySymbol}) • {cand.constituency}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {cand.voteCount || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            votes ({percentage}%)
                          </Typography>
                        </Box>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      )}

      {/* Nominate Candidate Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Nominate Candidate (East Godavari)</DialogTitle>
        <Divider />
        <form onSubmit={handleRegisterSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Candidate Full Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Party Name"
              required
              fullWidth
              value={partyName}
              placeholder="e.g. Telugu Desam Party (TDP)"
              onChange={(e) => setPartyName(e.target.value)}
            />
            <TextField
              label="Party Symbol"
              required
              fullWidth
              value={partySymbol}
              placeholder="e.g. 🚲 Bicycle, 🪭 Fan, 🥛 Glass Tumbler"
              onChange={(e) => setPartySymbol(e.target.value)}
            />
            <TextField
              label="Constituency"
              required
              fullWidth
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
            />
            <TextField
              label="Party Logo / Symbol Image URL"
              fullWidth
              value={symbolPhotoUrl}
              placeholder="https://example.com/logo.png"
              onChange={(e) => setSymbolPhotoUrl(e.target.value)}
            />
            <TextField
              label="Candidate Photo URL"
              fullWidth
              value={candidatePhotoUrl}
              placeholder="https://example.com/candidate.jpg"
              onChange={(e) => setCandidatePhotoUrl(e.target.value)}
            />
            <TextField
              label="Election Manifesto / Pledges"
              multiline
              rows={3}
              fullWidth
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit Nomination
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
