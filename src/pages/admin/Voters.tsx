import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useVoting } from '../../context/VotingContext';
import { useSnackbar } from '../../context/SnackbarContext';
import type { User } from '../../models';

type StatusFilter = 'ALL' | 'APPROVED' | 'PENDING';

export const Voters: React.FC = () => {
  const { users, loading, approveVoter } = useVoting();
  const { notify } = useSnackbar();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [revokeTarget, setRevokeTarget] = useState<User | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const voters = useMemo(() => users.filter((u) => u.role === 'VOTER'), [users]);

  const filtered = useMemo(() => {
    return voters.filter((v) => {
      if (status === 'APPROVED' && !v.isApprovedVoter) return false;
      if (status === 'PENDING' && v.isApprovedVoter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [voters, status, search]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleApprove = async (voter: User) => {
    setBusyId(voter.id);
    await approveVoter(voter.id, true);
    setBusyId(null);
    notify(`${voter.name} approved to vote.`, 'success');
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setBusyId(revokeTarget.id);
    await approveVoter(revokeTarget.id, false);
    setBusyId(null);
    notify(`Authorization revoked for ${revokeTarget.name}.`, 'success');
    setRevokeTarget(null);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Voters
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name, email or ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(0);
          }}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="ALL">All voters</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="PENDING">Pending approval</MenuItem>
        </Select>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Constituency</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ballot</TableCell>
              <TableCell>Authorization</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paged.map((voter) => (
                  <TableRow key={voter.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {voter.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {voter.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{voter.constituency || 'East Godavari'}</TableCell>
                    <TableCell>{voter.email}</TableCell>
                    <TableCell>
                      {voter.hasVoted ? (
                        <Chip label="Voted" color="success" size="small" variant="outlined" />
                      ) : (
                        <Chip label="Not voted" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      {voter.isApprovedVoter ? (
                        <Chip label="Approved" color="primary" size="small" />
                      ) : (
                        <Chip label="Pending" color="warning" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {voter.isApprovedVoter ? (
                        <Button
                          size="small"
                          color="error"
                          disabled={voter.hasVoted || busyId === voter.id}
                          onClick={() => setRevokeTarget(voter)}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={busyId === voter.id}
                          onClick={() => handleApprove(voter)}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No voters match your search.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={Boolean(revokeTarget)} onClose={() => setRevokeTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Revoke voting authorization?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {revokeTarget?.name} will no longer be able to vote until re-approved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRevokeTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRevoke} variant="contained" color="error">
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
