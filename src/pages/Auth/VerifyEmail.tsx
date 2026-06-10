import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Button from '@mui/material/Button';
import { getApiErrorMessage } from '../../utils/errors';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!email) {
        setLoading(false);
        setMessage('Missing email address parameter.');
        return;
      }

      try {
        const response = await API.post('/auth/verify-email', { email, token });
        if (response.data.success) {
          setSuccess(true);
          setMessage(response.data.message || 'Email verified successfully!');

          // Send broadcast message to notify other tabs
          const bc = new BroadcastChannel('auth_verification');
          bc.postMessage({ status: 'verified', email });
          bc.close();
        } else {
          setSuccess(false);
          setMessage(response.data.message || 'Verification failed. The link may have expired.');
        }
      } catch (error: unknown) {
        setSuccess(false);
        setMessage(getApiErrorMessage(error, 'Verification failed. The link may have expired or is invalid.'));
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [email, token]);

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
        }}
      >
        {loading ? (
          <Box sx={{ py: 4 }}>
            <CircularProgress size={50} sx={{ color: '#6366f1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Verifying your email...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Please wait while we activate your account.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  background: success
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                }}
              >
                {success ? <CheckCircleIcon sx={{ fontSize: 36 }} /> : <ErrorIcon sx={{ fontSize: 36 }} />}
              </Avatar>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              {success ? 'Account Activated!' : 'Verification Failed'}
            </Typography>

            <Alert severity={success ? 'success' : 'error'} sx={{ mb: 3, borderRadius: '8px', textAlign: 'left' }}>
              {message}
            </Alert>

            {success ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Your email has been verified. You can now close this window and log in on your previous tab, or click the button below.
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                The verification token is invalid or has expired. Please log in to request a new verification link.
              </Typography>
            )}

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  py: 1.2,
                  px: 4,
                  borderRadius: '10px',
                  background: success
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  fontWeight: 700,
                }}
              >
                Go to Login
              </Button>
            </Link>
          </Box>
        )}
      </Card>
    </Box>
  );
}
