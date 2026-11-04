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
  Avatar,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useVoting } from '../../context/VotingContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { ImageUploadField } from '../../components/ImageUploadField';
import type { Candidate, CandidateApprovalStatus } from '../../models';

type StatusFilter = 'ALL' | CandidateApprovalStatus;

const STATUS_COLOR: Record<CandidateApprovalStatus, 'success' | 'warning' | 'error'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
};

export const Candidates: React.FC = () => {
  const { candidates, loading, reviewCandidate, registerCandidate } = useVoting();
  const { notify } = useSnackbar();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [preview, setPreview] = useState<Candidate | null>(null);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    partyName: '',
    partySymbol: '',
    constituency: 'East Godavari',
    manifesto: '',
    symbolPhotoUrl: '',
    candidatePhotoUrl: '',
  });

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (status !== 'ALL' && c.approvalStatus !== status) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return c.name.toLowerCase().includes(q) || c.partyName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [candidates, status, search]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleApprove = async (candidate: Candidate) => {
    setBusy(true);
    await reviewCandidate(candidate.id, 'APPROVED');
    setBusy(false);
    notify(`${candidate.name} approved.`, 'success');
    setPreview(null);
  };

  const handleReject = async () => {
    if (!preview) return;
    setBusy(true);
    await reviewCandidate(preview.id, 'REJECTED');
    setBusy(false);
    notify(`${preview.name} rejected.`, 'success');
    setRejectConfirmOpen(false);
    setPreview(null);
  };

  const resetForm = () =>
    setForm({
      name: '',
      partyName: '',
      partySymbol: '',
      constituency: 'East Godavari',
      manifesto: '',
      symbolPhotoUrl: '',
      candidatePhotoUrl: '',
    });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.partyName || !form.partySymbol) return;
    setBusy(true);
    await registerCandidate(form);
    setBusy(false);
    notify('Candidate nominated.', 'success');
    setAddOpen(false);
    resetForm();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Candidates
        </Typography>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setAddOpen(true)}>
          Add candidate
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name or party"
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
          <MenuItem value="ALL">All statuses</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </Select>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Constituency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paged.map((cand) => (
                  <TableRow key={cand.id} hover sx={{ cursor: 'pointer' }} onClick={() => setPreview(cand)}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={cand.candidatePhotoUrl || undefined} />
                        <Typography variant="body2" fontWeight={600}>
                          {cand.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{cand.partyName}</TableCell>
                    <TableCell>{cand.constituency || 'East Godavari'}</TableCell>
                    <TableCell>
                      <Chip label={cand.approvalStatus} color={STATUS_COLOR[cand.approvalStatus]} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={(e) => { e.stopPropagation(); setPreview(cand); }}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No candidates match your search.
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

      {/* Preview drawer */}
      <Drawer anchor="right" open={Boolean(preview)} onClose={() => setPreview(null)}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Candidate review
            </Typography>
            <IconButton onClick={() => setPreview(null)}>
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>

          {preview && (
            <Stack spacing={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar src={preview.candidatePhotoUrl || undefined} sx={{ width: 96, height: 96, mx: 'auto', mb: 1.5 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  {preview.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {preview.partyName}
                </Typography>
                <Chip
                  label={preview.approvalStatus}
                  color={STATUS_COLOR[preview.approvalStatus]}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Constituency
                </Typography>
                <Typography variant="body2">{preview.constituency || 'East Godavari'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Party logo
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Avatar src={preview.symbolPhotoUrl || undefined} variant="rounded" />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Manifesto
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {preview.manifesto || 'No manifesto provided.'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Confirmed votes
                </Typography>
                <Typography variant="body2">{preview.voteCount ?? 0}</Typography>
              </Box>

              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                {preview.approvalStatus !== 'APPROVED' && (
                  <Button variant="contained" fullWidth disabled={busy} onClick={() => handleApprove(preview)}>
                    Approve
                  </Button>
                )}
                {preview.approvalStatus !== 'REJECTED' && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={busy}
                    onClick={() => setRejectConfirmOpen(true)}
                  >
                    Reject
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </Box>
      </Drawer>

      <Dialog open={rejectConfirmOpen} onClose={() => setRejectConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject this nomination?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {preview?.name} will be removed from the ballot and marked as rejected.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRejectConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add candidate drawer */}
      <Drawer anchor="right" open={addOpen} onClose={() => setAddOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Add candidate
            </Typography>
            <IconButton onClick={() => setAddOpen(false)}>
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>

          <form onSubmit={handleAddSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Candidate full name"
                required
                fullWidth
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <TextField
                label="Party name"
                required
                fullWidth
                value={form.partyName}
                onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))}
              />
              <TextField
                label="Party symbol name"
                required
                fullWidth
                value={form.partySymbol}
                onChange={(e) => setForm((f) => ({ ...f, partySymbol: e.target.value }))}
              />
              <TextField
                label="Constituency"
                required
                fullWidth
                value={form.constituency}
                onChange={(e) => setForm((f) => ({ ...f, constituency: e.target.value }))}
              />
              <ImageUploadField
                label="Candidate photo"
                value={form.candidatePhotoUrl}
                onChange={(v) => setForm((f) => ({ ...f, candidatePhotoUrl: v }))}
              />
              <ImageUploadField
                label="Party logo"
                value={form.symbolPhotoUrl}
                onChange={(v) => setForm((f) => ({ ...f, symbolPhotoUrl: v }))}
                shape="circular"
              />
              <TextField
                label="Manifesto"
                multiline
                rows={4}
                fullWidth
                value={form.manifesto}
                onChange={(e) => setForm((f) => ({ ...f, manifesto: e.target.value }))}
              />

              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                <Button fullWidth color="inherit" onClick={() => setAddOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" fullWidth disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Drawer>
    </Box>
  );
};
