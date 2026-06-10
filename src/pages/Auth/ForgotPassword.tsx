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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await API.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 3000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to request reset. User not found.');
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
          Reset Password
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Enter your email and we'll send a code to reset your password.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            disabled={loading || !!message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !!message}
            sx={{ py: 1.5, mt: 3, fontSize: '0.95rem', borderRadius: '10px' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Code'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: 700, fontSize: '0.95rem' }}>
            Back to Sign In
          </Link>
        </Box>
      </Card>
    </Box>
  );
}
