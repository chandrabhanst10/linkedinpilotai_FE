import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

import type { BillingInfo, LinkedInProfileSettings } from '../../types/settings';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(tabParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Billing Details State
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);

  // LinkedIn Integration State
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinProfile, setLinkedinProfile] = useState<LinkedInProfileSettings | null>(null);
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const fetchLinkedinStatus = async () => {
    setLinkedinLoading(true);
    try {
      const res = await API.get('/linkedin/status');
      if (res.data.success) {
        setLinkedinConnected(res.data.connected);
        setLinkedinProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load LinkedIn connection status:', err);
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleConnectLinkedin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    window.location.href = `${apiUrl}/linkedin/auth`;
  };

  const handleDisconnectLinkedin = async () => {
    const confirm = window.confirm('Are you sure you want to disconnect your LinkedIn account?');
    if (!confirm) return;

    setLinkedinLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await API.delete('/linkedin/disconnect');
      if (res.data.success) {
        setSuccess('LinkedIn account disconnected successfully.');
        setLinkedinConnected(false);
        setLinkedinProfile(null);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to disconnect LinkedIn account.');
    } finally {
      setLinkedinLoading(false);
    }
  };

  const fetchBilling = async () => {
    try {
      const res = await API.get('/settings/billing');
      if (res.data.success) {
        setBilling(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load billing details:', err);
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBilling();
    } else if (activeTab === 'linkedin') {
      fetchLinkedinStatus();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLinkedinStatus();
  }, []);

  useEffect(() => {
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    if (successParam === 'connected') {
      setSuccess('LinkedIn account connected successfully!');
      fetchLinkedinStatus();
    } else if (errorParam) {
      setError(`Failed to connect LinkedIn: ${decodeURIComponent(errorParam)}`);
    }
  }, [searchParams]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.put('/settings/profile', { name, email });
      if (res.data.success) {
        setUser(res.data.user);
        setSuccess('Profile updated successfully.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.put('/settings/password', { currentPassword, newPassword });
      if (res.data.success) {
        setSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpgrade = async (planName: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.put('/settings/billing', { plan: planName });
      if (res.data.success) {
        setSuccess(`Subscription plan upgraded to ${planName.toUpperCase()}!`);
        fetchBilling();
      }
    } catch (err) {
      setError('Failed to update subscription.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { name: 'free', price: '$0', desc: 'Best for solopreneurs getting started', features: ['1 LinkedIn Profile', '30 Posts / mo', 'Standard Composer'] },
    { name: 'pro', price: '$29/mo', desc: 'Best for professional creators', features: ['10 LinkedIn Profiles', '500 Posts / mo', 'Full AI Assistant', 'Queue Automations'] },
    { name: 'agency', price: '$79/mo', desc: 'Best for brand marketing squads', features: ['Unlimited Profiles', '10,000 Posts / mo', 'Priority queue processing', 'Team Workspace collabs'] }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure profile details, change passwords, and choose billing plans.
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
        >
          <Tab label="Profile Settings" value="profile" />
          <Tab label="Password & Security" value="password" />
          <Tab label="Billing & Plan" value="billing" />
          <Tab label="LinkedIn Integration" value="linkedin" />
        </Tabs>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <Card sx={{ p: 4, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Personal Details
          </Typography>
          <form onSubmit={handleProfileUpdate}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <Card sx={{ p: 4, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Update Password
          </Typography>
          <form onSubmit={handlePasswordUpdate}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Password'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      )}

      {/* Billing Panel */}
      {activeTab === 'billing' && (
        <Box>
          {billingLoading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={4}>
              {/* Left Side: Current Limits */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Active Subscription
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'primary.main' }}>
                      {billing?.plan}
                    </Typography>
                    <Chip label={billing?.status.toUpperCase()} color="success" size="small" sx={{ borderRadius: '6px', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Renewal/Expiration: {billing?.expiresAt ? new Date(billing.expiresAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Usage Limits
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">LinkedIn Accounts</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Limit: {billing?.limits.accountsLimit}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Monthly Posts Limit</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Limit: {billing?.limits.postsPerMonth}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Right Side: Available upgrades plans */}
              <Grid item xs={12} lg={8}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Choose Plan Tier
                </Typography>
                <Grid container spacing={3}>
                  {plans.map((p) => {
                    const isCurrent = billing?.plan === p.name;
                    return (
                      <Grid item xs={12} sm={4} key={p.name}>
                        <Card
                          sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderColor: isCurrent ? 'primary.main' : 'divider',
                            borderWidth: isCurrent ? 2 : 1,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', color: isCurrent ? 'primary.main' : 'text.primary' }}>
                              {p.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, my: 1.5 }}>
                              <Typography variant="h4" sx={{ fontWeight: 800 }}>{p.price}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 2.5 }}>
                              {p.desc}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                              {p.features.map((feat) => (
                                <Box key={feat} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                  <Typography variant="caption" color="text.secondary">{feat}</Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          
                          <Button
                            fullWidth
                            variant={isCurrent ? 'contained' : 'outlined'}
                            color="primary"
                            disabled={loading || isCurrent}
                            onClick={() => handlePlanUpgrade(p.name)}
                          >
                            {isCurrent ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* LinkedIn Integration */}
      {activeTab === 'linkedin' && (
        <Card sx={{ p: 4, maxWidth: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <LinkedInIcon sx={{ fontSize: 40, color: '#0a66c2' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              LinkedIn Integration
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {linkedinLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : linkedinConnected ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
                Your LinkedIn account is connected and ready to publish posts.
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#0a66c2', color: '#ffffff' }}>
                    {linkedinProfile?.name?.charAt(0) || 'L'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {linkedinProfile?.name}
                    </Typography>
                    {linkedinProfile?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {linkedinProfile.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Chip label="Connected" color="success" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDisconnectLinkedin}
                fullWidth
              >
                Disconnect Account
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Link your personal LinkedIn profile to schedule and publish updates directly from your dashboard.
              </Typography>
              <Button
                variant="contained"
                onClick={handleConnectLinkedin}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #0a66c2 0%, #0077b5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0077b5 0%, #005983 100%)',
                  },
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                }}
              >
                Connect LinkedIn
              </Button>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
