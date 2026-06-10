import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../api';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import EmailIcon from '@mui/icons-material/Email';
import { getApiErrorMessage } from '../../utils/errors';

export default function VerifyPending() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const bc = new BroadcastChannel('auth_verification');
    bc.onmessage = (event) => {
      if (event.data && event.data.status === 'verified' && event.data.email === email) {
        setIsVerified(true);
        setSuccess('Your email has been verified successfully! You can now log in.');
        setError('');
      }
    };
    return () => {
      bc.close();
    };
  }, [email]);

  const handleResend = async () => {
    if (!email) {
      setError('No email address provided.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/auth/resend-verification', { email });
      if (response.data.success) {
        setSuccess('Verification email resent successfully! Please check your inbox.');
      } else {
        setError(response.data.message || 'Failed to resend verification email.');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend verification email.'));
    } finally {
      setLoading(false);
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
          maxWidth: 460,
          width: '100%',
          p: 4,
          background: 'rgba(17, 24, 39, 0.7)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              background: isVerified
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            }}
          >
            <EmailIcon sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {isVerified ? 'Verification Successful' : 'Verify Your Email'}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          {isVerified
            ? 'Thank you for verifying your email. You can return to your original page or sign in below.'
            : `We have sent a verification link to ${email ? email : 'your registered email address'}. Please check your inbox and click the link to activate your account.`}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', textAlign: 'left' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px', textAlign: 'left' }}>{success}</Alert>}

        {!isVerified && (
          <Button
            onClick={handleResend}
            disabled={loading}
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              mt: 2,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              fontWeight: 700,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send verification link again'}
          </Button>
        )}

        <Box sx={{ mt: 3 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="text" sx={{ color: '#6366f1', fontWeight: 700 }}>
              {isVerified ? 'Go to Sign In' : 'Back to Login'}
            </Button>
          </Link>
        </Box>
      </Card>
    </Box>
  );
}
