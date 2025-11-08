import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { logout as logoutService } from '../../services/authService.ts';
import { getInitials } from '../../utils/helpers.ts';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutService();
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#FFFFFF',
        color: '#1E293B',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NexusProcure
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: '#1E293B',
              }}
            >
              {user?.fullName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                color: '#64748B',
              }}
            >
              {user?.role}
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen}>
            <Avatar
              sx={{
                bgcolor: '#0056D2',
                width: 40,
                height: 40,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}
            >
              {user?.fullName ? getInitials(user.fullName || '') : 'U'}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <MenuItem onClick={handleProfile} sx={{ fontFamily: 'Poppins, sans-serif', gap: 1.5 }}>
            <AccountCircleIcon fontSize="small" />
            Profile
          </MenuItem>
          <MenuItem sx={{ fontFamily: 'Poppins, sans-serif', gap: 1.5 }}>
            <SettingsIcon fontSize="small" />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{ fontFamily: 'Poppins, sans-serif', gap: 1.5, color: '#E63946' }}
          >
            <LogoutIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};


