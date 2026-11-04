import React from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Avatar, Stack, Skeleton } from '@mui/material';
import { useVoting } from '../../context/VotingContext';

export const Results: React.FC = () => {
  const { candidates, stats, loading } = useVoting();
  const approved = candidates.filter((c) => c.approvalStatus === 'APPROVED');

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Results
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Aggregate counts only. Individual ballots are never linked to a voter.
      </Typography>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2].map((n) => (
            <Grid item xs={12} sm={6} key={n}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      ) : approved.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No approved candidates yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {approved.map((cand) => {
            const percentage = stats.totalVotesCast > 0 ? Math.round(((cand.voteCount || 0) / stats.totalVotesCast) * 100) : 0;
            return (
              <Grid item xs={12} sm={6} key={cand.id}>
                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar src={cand.symbolPhotoUrl || undefined} variant="rounded" />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {cand.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {cand.partyName}
                          </Typography>
                        </Box>
                      </Stack>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" fontWeight={800}>
                          {cand.voteCount || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {percentage}%
                        </Typography>
                      </Box>
                    </Stack>
                    <LinearProgress variant="determinate" value={percentage} sx={{ height: 8, borderRadius: 4 }} />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
