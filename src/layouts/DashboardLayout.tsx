import { useState, type MouseEvent } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useThemeMode } from '../context/ThemeContext';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CircleIcon from '@mui/icons-material/Circle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const drawerWidth = 260;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useSocket();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchor(null);
  };

  const handleNotificationOpen = (event: MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Compose Post', icon: <CreateIcon />, path: '/compose' },
    { text: 'Scheduler & Queue', icon: <CalendarMonthIcon />, path: '/scheduler' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'LinkedIn Profiles', icon: <LinkIcon />, path: '/accounts' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({
      text: 'Admin Panel',
      icon: <AdminPanelSettingsIcon />,
      path: '/admin',
    });
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 38,
            height: 38,
            fontWeight: 800,
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          }}
        >
          LP
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            LinkPilot <span style={{ color: '#6366f1' }}>AI</span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            v1.0.0
          </Typography>
        </Box>
      </Box>
      
      <Divider />

      {/* Workspace Selector */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            justifyContent: 'space-between',
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            px: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Personal Workspace
            </Typography>
          </Box>
        </Button>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Navigation List */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? '#ffffff' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.main' : 'action.hover',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#ffffff' : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Sidebar Footer User profile */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src="" sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
            {user?.email}
          </Typography>
        </Box>
        {user?.role === 'admin' && (
          <Chip label="Admin" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top App bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ px: 2, display: 'flex', justifyContent: 'space-between' }}>
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="body1" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              Welcome back, <span style={{ fontWeight: 700 }}>{user?.name || 'Pilot'}</span>! 👋
            </Typography>
          </Box>

          {/* Right section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme toggle */}
            <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
              <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle theme">
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>

            {/* Notifications badge */}
            <IconButton onClick={handleNotificationOpen} color="inherit" aria-label="Open notifications">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User menu avatar */}
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }} aria-label="Open profile menu">
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.9rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 450, borderRadius: '12px', mt: 1.5, display: 'flex', flexDirection: 'column' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllRead} sx={{ fontSize: '0.75rem', p: 0 }}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0, overflowY: 'auto', flexGrow: 1 }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlignment: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                All caught up! No notifications.
              </Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <MenuItem
                key={n._id}
                onClick={() => markRead(n._id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  whiteSpace: 'normal',
                  bgcolor: n.isRead ? 'transparent' : 'action.hover',
                  borderLeft: '4px solid',
                  borderLeftColor: n.type === 'error' ? 'error.main' : n.type === 'success' ? 'success.main' : 'primary.main',
                }}
              >
                <CircleIcon
                  sx={{
                    fontSize: 8,
                    mt: 0.8,
                    color: n.isRead ? 'transparent' : n.type === 'error' ? 'error.main' : n.type === 'success' ? 'success.main' : 'primary.main',
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 600 : 700, fontSize: '0.85rem' }}>
                    {n.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.2 }}>
                    {n.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </List>
      </Popover>

      {/* User profile dropdown Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 180, mt: 1.5, borderRadius: '10px' } }}
      >
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings?tab=billing')}>
          <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
          Billing & Plans
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Navigation Drawers */}
      {/* Mobile Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Workspace Frame */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // toolbar offset
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
