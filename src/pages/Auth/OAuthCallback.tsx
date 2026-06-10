import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

// Icons
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from '../../context/AuthContext';

import type { OAuthProvider } from '../../types/auth';
import { getApiErrorMessage } from '../../utils/errors';

interface OAuthCallbackProps {
  provider: OAuthProvider;
}

export default function OAuthCallback({ provider }: OAuthCallbackProps) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code') || '';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const handleCallback = async () => {
      if (!code) {
        setLoading(false);
        setError('Authorization code is missing from redirect parameters.');
        return;
      }

      try {
        const endpoint = provider === 'google' ? '/auth/google' : '/auth/linkedin';
        const response = await API.post(endpoint, { code, email, name });

        if (response.data.success) {
          const { user } = response.data;

          // Update Auth state
          setUser(user);

          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setError(response.data.message || 'OAuth authentication failed.');
          setLoading(false);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'A network error occurred during social login.'));
        setLoading(false);
      }
    };

    handleCallback();
  }, [code, email, name, provider, setUser, navigate]);

  const providerName = provider === 'google' ? 'Google' : 'LinkedIn';
  const ProviderIcon = provider === 'google' ? GoogleIcon : LinkedInIcon;
  const iconColor = provider === 'google' ? '#ea4335' : '#0a66c2';

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
          maxWidth: 440,
          width: '100%',
          p: 4,
          background: 'rgba(17, 24, 39, 0.7)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {loading ? (
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, position: 'relative' }}>
              <CircularProgress size={64} sx={{ color: '#6366f1' }} />
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'transparent',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <ProviderIcon sx={{ color: iconColor, fontSize: 24 }} />
              </Avatar>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em' }}>
              Authenticating with {providerName}...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Please wait while we establish a secure session.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                }}
              >
                <LockOpenIcon sx={{ fontSize: 32, color: '#ffffff' }} />
              </Avatar>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Authentication Error
            </Typography>

            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', textAlign: 'left' }}>
              {error}
            </Alert>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              fullWidth
              sx={{
                py: 1.2,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Back to Login
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}
