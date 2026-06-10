import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import type { OAuthProvider } from '../../types/auth';
import { getApiErrorMessage } from '../../utils/errors';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GoogleIcon from '@mui/icons-material/Google';
import { Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  useEffect(() => {
    const bc = new BroadcastChannel('auth_verification');
    bc.onmessage = (event) => {
      if (event.data && event.data.status === 'verified') {
        setVerificationSuccess(`Email ${event.data.email} verified successfully! You can now sign in.`);
        setError('');
        setUnverifiedEmail('');
      }
    };
    return () => {
      bc.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationSuccess('');
    setResendSuccess('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      if (res.isVerified === false) {
        setUnverifiedEmail(res.email || email);
        setError(res.message || 'Please verify your email first.');
      } else {
        setError(res.message || 'Login failed. Invalid credentials.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    setResendSuccess('');
    setError('');
    try {
      const response = await API.post('/auth/resend-verification', { email: unverifiedEmail });
      if (response.data.success) {
        setResendSuccess('Verification email resent successfully! Please check your inbox.');
      } else {
        setError(response.data.message || 'Failed to resend verification email.');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend verification email.'));
    } finally {
      setResendLoading(false);
    }
  };

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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
      setError('Failed to fetch social sign-in configuration.');
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

  const handleSocialMockLogin = async () => {
    setEmail('john@linkpilot.ai');
    setPassword('johnpilot123');
    setError('');
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#090d16' }}>
      {/* Left side panel (Brand visuals) */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #090d16 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          p: 6,
          position: 'relative',
        }}
      >
        <Box sx={{ maxWidth: 500 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.02em' }}>
            Elevate Your LinkedIn Brand With <span style={{ color: '#818cf8' }}>AI Automation</span>.
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, fontWeight: 400 }}>
            Generate highly-engaging posts, schedule queue blocks, and run automated Playwright publishing. Your personal scheduler operating 24/7.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#818cf8' }}>⚡ Fast Composer</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Compose and preview live LinkedIn desktop layouts.</Typography>
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0ea5e9' }}>🤖 AI Assistant</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Instantly generate tone-adjusted hooks & hashtags.</Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Right side panel (Login Form card) */}
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Card
          sx={{
            maxWidth: 420,
            width: '100%',
            p: 4,
            background: 'background.card',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
          }}
        >
          {/* Logo header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
              LP
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              LinkPilot <span style={{ color: '#6366f1' }}>AI</span>
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Sign In
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Welcome back! Select a quick autofill or sign in with your credentials.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
          {verificationSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{verificationSuccess}</Alert>}
          {resendSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{resendSuccess}</Alert>}

          {unverifiedEmail && !resendSuccess && (
            <Button
              variant="outlined"
              color="warning"
              onClick={handleResendVerification}
              disabled={resendLoading}
              fullWidth
              sx={{ mb: 2, borderRadius: '10px', textTransform: 'none' }}
            >
              {resendLoading ? <CircularProgress size={20} color="inherit" /> : 'Send verification link again'}
            </Button>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#6366f1', fontSize: '0.85rem', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ py: 1.5, fontSize: '0.95rem', borderRadius: '10px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>


          {/* Social Sign In Options */}
          <Divider sx={{ my: 3 }}><Typography variant="caption" sx={{ color: 'text.secondary' }}>OR CONTINUE WITH</Typography></Divider>

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
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="text"
                color="secondary"
                onClick={handleSocialMockLogin}
                sx={{ textTransform: 'none', fontSize: '0.8rem', opacity: 0.7 }}
              >
                Use Quick Autofill (Demo Account)
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: 700 }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Mock Social Sign In Dialog */}
      <Dialog open={mockDialogOpen} onClose={() => setMockDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleMockAuthenticate}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Simulate {mockProvider === 'google' ? 'Google' : 'LinkedIn'} Login
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
    </Grid>
  );
}
