import { createTheme } from '@mui/material/styles';
import type { ThemeMode } from '../types/theme';

const getDesignTokens = (mode: ThemeMode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#4f46e5' : '#6366f1', // Indigo accents
      light: '#818cf8',
      dark: '#3730a3',
    },
    secondary: {
      main: mode === 'light' ? '#0ea5e9' : '#38bdf8', // Sky blue highlights
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#090d16', // Dark space default
      paper: mode === 'light' ? '#ffffff' : '#111827', // Dark paper cards
      card: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(17, 24, 39, 0.7)',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#475569' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#1f2937',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2937',
          boxShadow: mode === 'light'
            ? '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            : '0 4px 20px -2px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: ThemeMode) => createTheme(getDesignTokens(mode));
