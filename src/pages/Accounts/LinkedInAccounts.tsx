import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAccountsThunk,
  connectAccountThunk,
  disconnectAccountThunk,
} from '../../store/accountsSlice';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

interface IntegrationStatus {
  name: string;
  configured: boolean;
  ready: boolean;
  message: string;
}

export default function LinkedInAccounts() {
  const dispatch = useAppDispatch();
  const { accounts, loading, error } = useAppSelector((state) => state.accounts);
  const [connectOpen, setConnectOpen] = useState(false);
  const [mockEnabled, setMockEnabled] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAccountsThunk());
  }, [dispatch]);

  useEffect(() => {
    fetch(`${API_ORIGIN}/integrations`)
      .then((res) => res.json())
      .then((payload: { data?: IntegrationStatus[] }) => {
        const mock = payload.data?.find((item) => item.name === 'mock_integrations');
        setMockEnabled(mock?.ready === true);
      })
      .catch(() => setMockEnabled(false));
  }, []);

  const handleConnectClick = () => {
    if (mockEnabled) {
      setConnectOpen(true);
      return;
    }
    window.location.href = `${API_ORIGIN}/api/linkedin/auth`;
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return;

    setConnectLoading(true);
    try {
      const resultAction = await dispatch(
        connectAccountThunk({ name: profileName, avatar: avatarUrl || undefined })
      );
      if (connectAccountThunk.fulfilled.match(resultAction)) {
        setConnectOpen(false);
        setProfileName('');
        setAvatarUrl('');
      }
    } catch (err) {
      console.error('Failed to connect mock profile:', err);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to disconnect this LinkedIn profile? This will cancel any pending scheduled posts.');
    if (!confirm) return;

    try {
      dispatch(disconnectAccountThunk(id));
    } catch (err) {
      console.error('Failed to disconnect account:', err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Connected LinkedIn Profiles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mockEnabled
              ? 'Development mode: mock connect available, or use LinkedIn OAuth.'
              : 'Connect your profile securely via LinkedIn OAuth.'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleConnectClick}
          sx={{ py: 1.2, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
        >
          Link LinkedIn Profile
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : accounts.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
          <LinkedInIcon sx={{ fontSize: 64, color: '#0077b5', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No LinkedIn Accounts Linked
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            LinkPilot AI needs a connected LinkedIn profile to publish updates. Link your channel to schedule your first post.
          </Typography>
          <Button
            variant="contained"
            onClick={handleConnectClick}
            sx={{ py: 1.2, px: 3, borderRadius: '10px' }}
          >
            Connect My Profile
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((acc) => (
            <Grid item xs={12} sm={6} md={4} key={acc._id}>
              <Card sx={{ p: 3, position: 'relative' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                  <Avatar src={acc.avatar} sx={{ width: 56, height: 56, border: '2px solid #0077b5' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {acc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      ID: {acc.linkedinId}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Status:
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                    label={acc.status.toUpperCase()}
                    size="small"
                    color="success"
                    sx={{ borderRadius: '6px', fontWeight: 700 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Token Expires:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {acc.expiresAt ? new Date(acc.expiresAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LinkOffIcon />}
                  onClick={() => handleDisconnect(acc._id)}
                >
                  Disconnect Profile
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {mockEnabled && (
        <Dialog open={connectOpen} onClose={() => setConnectOpen(false)} maxWidth="xs" fullWidth>
          <form onSubmit={handleConnect}>
            <DialogTitle sx={{ fontWeight: 800 }}>Connect Profile (Development Mock)</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Mock connect is enabled for local development. For production, use LinkedIn OAuth instead.
              </Typography>

              <Button variant="outlined" onClick={() => { window.location.href = `${API_ORIGIN}/api/linkedin/auth`; }}>
                Use Real LinkedIn OAuth
              </Button>

              <TextField
                fullWidth
                label="Profile Name"
                required
                placeholder="e.g. Jane Miller"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />

              <TextField
                fullWidth
                label="Avatar URL (Optional)"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConnectOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={connectLoading || !profileName}>
                {connectLoading ? <CircularProgress size={20} color="inherit" /> : 'Connect mock profile'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
}
