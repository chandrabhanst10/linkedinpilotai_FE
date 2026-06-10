import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Divider, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import type { OAuthProvider } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Social OAuth Dialog / Redirection State
  const [socialLoading, setSocialLoading] = useState(false);
  const [mockDialogOpen, setMockDialogOpen] = useState(false);
  const [mockProvider, setMockProvider] = useState('google');
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName] = useState('');

  const handleOAuthClick = async (provider: OAuthProvider) => {
    setSocialLoading(true);
    setError('');
    try {
      const response = await API.get('/auth/oauth-urls');
      const { googleUrl, linkedinUrl, isGoogleMock, isLinkedinMock } = response.data;

      if (provider === 'google') {
        if (isGoogleMock) {
          setMockProvider('google');
          setMockEmail('mockgoogle@linkpilot.ai');
          setMockName('Google Mock User');
          setMockDialogOpen(true);
        } else {
          window.location.href = googleUrl;
        }
      } else if (provider === 'linkedin') {
        if (isLinkedinMock) {
          setMockProvider('linkedin');
          setMockEmail('mocklinkedin@linkpilot.ai');
          setMockName('LinkedIn Mock User');
          setMockDialogOpen(true);
        } else {
          window.location.href = linkedinUrl;
        }
      }
    } catch (err) {
      setError('Failed to fetch social sign-up configuration.');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleMockAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockEmail || !mockName) return;
    setMockDialogOpen(false);

    const code = `mock_${mockProvider}_code_${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/auth/${mockProvider}/callback?code=${code}&email=${encodeURIComponent(mockEmail)}&name=${encodeURIComponent(mockName)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all details');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const res = await signup(name, email, password);
    setLoading(false);

    if (res.success) {
      if (res.isVerified === false) {
        navigate(`/verify-pending?email=${encodeURIComponent(email)}`);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #090d16 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 4,
          background: 'rgba(17, 24, 39, 0.7)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            LP
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            LinkPilot <span style={{ color: '#6366f1' }}>AI</span>
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Create Account
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Get started with LinkPilot AI and automate your LinkedIn schedule.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />

          <TextField
            fullWidth
            label="Password (min 6 characters)"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ py: 1.5, mt: 3, fontSize: '0.95rem', borderRadius: '10px' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Started'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Box>

        {/* Social Sign Up Options */}
        <Divider sx={{ my: 3 }}><Typography variant="caption" sx={{ color: 'text.secondary' }}>OR SIGN UP WITH</Typography></Divider>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthClick('google')}
              disabled={socialLoading}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                borderRadius: '10px',
                py: 1.2,
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': {
                  borderColor: '#ea4335',
                  background: 'rgba(234, 67, 53, 0.05)',
                }
              }}
            >
              Google
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LinkedInIcon />}
              onClick={() => handleOAuthClick('linkedin')}
              disabled={socialLoading}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                borderRadius: '10px',
                py: 1.2,
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': {
                  borderColor: '#0a66c2',
                  background: 'rgba(10, 102, 194, 0.05)',
                }
              }}
            >
              LinkedIn
            </Button>
          </Grid>
        </Grid>

        {/* Mock Social Sign Up Dialog */}
        <Dialog open={mockDialogOpen} onClose={() => setMockDialogOpen(false)} maxWidth="xs" fullWidth>
          <form onSubmit={handleMockAuthenticate}>
            <DialogTitle sx={{ fontWeight: 800 }}>
              Simulate {mockProvider === 'google' ? 'Google' : 'LinkedIn'} Registration
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Real social login is not configured in `.env`. Simulate this flow by providing your target email and name:
              </Typography>

              <TextField
                fullWidth
                label="Mock Name"
                required
                value={mockName}
                onChange={(e) => setMockName(e.target.value)}
                placeholder="e.g. Alex Smith"
              />

              <TextField
                fullWidth
                label="Mock Email"
                type="email"
                required
                value={mockEmail}
                onChange={(e) => setMockEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMockDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Authenticate
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Card>
    </Box>
  );
}
