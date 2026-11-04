import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Skeleton,
  Stack,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useVoting } from '../../context/VotingContext';

const KPI = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export const Overview: React.FC = () => {
  const { users, candidates, stats, loading } = useVoting();
  const navigate = useNavigate();

  const pendingVoters = users.filter((u) => u.role === 'VOTER' && !u.isApprovedVoter && !u.hasVoted);
  const pendingCandidates = candidates.filter((c) => c.approvalStatus === 'PENDING');

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((n) => (
          <Grid item xs={12} sm={4} key={n}>
            <Skeleton variant="rounded" height={88} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <KPI icon={<PeopleOutlineIcon />} label="Registered voters" value={stats.totalRegisteredUsers} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI icon={<HowToVoteOutlinedIcon />} label="Votes cast" value={stats.totalVotesCast} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI icon={<TrendingUpOutlinedIcon />} label="Turnout" value={`${stats.votingPercentage}%`} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Pending approvals
          </Typography>

          {pendingVoters.length === 0 && pendingCandidates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              Nothing waiting on review.
            </Typography>
          ) : (
            <List disablePadding>
              {pendingVoters.map((v) => (
                <ListItem
                  key={v.id}
                  divider
                  secondaryAction={
                    <Button size="small" onClick={() => navigate('/admin/voters')}>
                      Review
                    </Button>
                  }
                >
                  <ListItemText
                    primary={v.name}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" component="span">
                        <Chip label="Voter" size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {v.constituency || 'East Godavari'}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
              {pendingCandidates.map((c) => (
                <ListItem
                  key={c.id}
                  divider
                  secondaryAction={
                    <Button size="small" onClick={() => navigate('/admin/candidates')}>
                      Review
                    </Button>
                  }
                >
                  <ListItemText
                    primary={c.name}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" component="span">
                        <Chip label="Candidate" size="small" variant="outlined" color="secondary" />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {c.partyName}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
