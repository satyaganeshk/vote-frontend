import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Skeleton,
  Stack,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { ImageUploadField } from './ImageUploadField';
import type { Candidate, CandidateApprovalStatus } from '../models';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_COPY: Record<CandidateApprovalStatus, { label: string; color: 'warning' | 'success' | 'error'; detail: string }> = {
  PENDING: {
    label: 'Pending review',
    color: 'warning',
    detail: 'Your nomination is awaiting approval from the Election Commission. You can keep editing your profile.',
  },
  APPROVED: {
    label: 'Approved',
    color: 'success',
    detail: 'Your nomination is approved and visible on the ballot. Profile details are now locked.',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'error',
    detail: 'Your nomination was not approved. You may update your details for reconsideration.',
  },
};

export const CandidateProfile: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { notify } = useSnackbar();
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [manifesto, setManifesto] = useState('');
  const [symbolPhotoUrl, setSymbolPhotoUrl] = useState('');
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState('');
  const [partySymbol, setPartySymbol] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/candidate/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to load candidate profile.');

      const data: Candidate = await res.json();
      setProfile(data);
      setManifesto(data.manifesto || '');
      setSymbolPhotoUrl(data.symbolPhotoUrl || '');
      setCandidatePhotoUrl(data.candidatePhotoUrl || '');
      setPartySymbol(data.partySymbol || '');
    } catch (err: any) {
      notify(err.message || 'Error loading profile.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, logout, notify]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/candidate/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ manifesto, symbolPhotoUrl, candidatePhotoUrl, partySymbol }),
      });

      if (!res.ok) throw new Error('Failed to update candidate profile.');

      notify('Profile updated.', 'success');
      setEditing(false);
      await fetchProfile();
    } catch (err: any) {
      notify(err.message || 'Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rounded" height={340} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rounded" height={340} />
        </Grid>
      </Grid>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            No candidate profile found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This account ({user?.email}) is not linked to a candidate nomination.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const status = STATUS_COPY[profile.approvalStatus];
  const canEdit = profile.approvalStatus !== 'APPROVED';

  return (
    <Box>
      <Card sx={{ mb: 3, borderLeft: '4px solid', borderLeftColor: `${status.color}.main` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label={status.label} color={status.color} />
          <Typography variant="body2" color="text.secondary">
            {status.detail}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardMedia
              component="img"
              height="220"
              image={profile.candidatePhotoUrl || undefined}
              alt={profile.name}
              sx={{ borderRadius: 2, objectFit: 'cover', mb: 2, bgcolor: 'grey.100' }}
            />
            <Typography variant="h6" fontWeight={700}>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profile.partyName}
            </Typography>
            <Chip label={profile.constituency || 'East Godavari'} variant="outlined" size="small" sx={{ my: 1 }} />

            <Divider sx={{ my: 2 }} />

            <Stack alignItems="center" spacing={0.5}>
              <HowToVoteOutlinedIcon color="primary" />
              <Typography variant="caption" color="text.secondary">
                Confirmed votes
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {profile.voteCount || 0}
              </Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Candidate details
              </Typography>
              {canEdit &&
                (!editing ? (
                  <Button startIcon={<EditOutlinedIcon />} variant="outlined" size="small" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                ) : (
                  <Button
                    startIcon={<SaveOutlinedIcon />}
                    variant="contained"
                    size="small"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                ))}
            </Stack>

            <Stack spacing={3}>
              {editing ? (
                <TextField
                  label="Party symbol name"
                  value={partySymbol}
                  onChange={(e) => setPartySymbol(e.target.value)}
                  fullWidth
                  size="small"
                />
              ) : (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Party symbol
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {profile.partySymbol}
                  </Typography>
                </Box>
              )}

              {editing && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <ImageUploadField label="Candidate photo" value={candidatePhotoUrl} onChange={setCandidatePhotoUrl} />
                  <ImageUploadField label="Party logo" value={symbolPhotoUrl} onChange={setSymbolPhotoUrl} shape="circular" />
                </Stack>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Manifesto
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={manifesto}
                    onChange={(e) => setManifesto(e.target.value)}
                    placeholder="Describe your campaign pledges and vision…"
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                    {profile.manifesto || 'No manifesto published yet.'}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
