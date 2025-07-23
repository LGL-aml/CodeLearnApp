import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  Settings,
  Topic as TopicIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { getUserInfo, logout } from '../utils/auth';

const Header = ({ userName }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [userInfo, setUserInfo] = useState(getUserInfo());
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      // Update the user info from the event data
      const updatedInfo = event.detail;
      setUserInfo(prevInfo => ({
        ...prevInfo,
        fullName: updatedInfo.fullName || prevInfo?.fullName,
        avatar: updatedInfo.avatar || prevInfo?.avatar
      }));
    };
    
    // Add event listener
    document.addEventListener('user-profile-updated', handleProfileUpdate);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      
      // Use the logout utility function with new API format
      logout(() => {
        // Redirect to login page after logout completes
        navigate('/login');
      });
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const menuItems = [
    { text: 'Người Dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Chủ Đề', icon: <TopicIcon />, path: '/admin/topics' }
  ];

  // Lấy chữ cái đầu tiên của tên người dùng để hiển thị trong Avatar nếu không có avatar
  const getAvatarText = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 0, mr: 4 }}>
          <Box component="img" src="/favicon.svg" alt="Logo" sx={{ width: 32, height: 32, mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white' }}>
            CodeLearn Management
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {userName || 'Admin'}
          </Typography>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            {userInfo?.avatar ? (
              <Avatar 
                sx={{ width: 32, height: 32 }} 
                src={userInfo.avatar}
                alt={userName || 'Admin'}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#1565c0' }}>{getAvatarText()}</Avatar>
            )}
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate('/admin/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/admin/change-password')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Đổi mật khẩu
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} disabled={loggingOut}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 