// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Badge, 
  Menu, 
  MenuItem, 
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import { logoutUser } from '../../redux/thunks/authThunks';
import { showToast } from '../../redux/slices/uiSlice';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const userMenuOpen = Boolean(anchorEl);
  const notificationMenuOpen = Boolean(notificationMenuAnchor);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Usa il servizio auth per recuperare il profilo
        const user = authService.getUser();
        setUserProfile(user);
        
        // Se il profilo non è in cache, provare a ottenerlo dal server
        if (!user) {
          const profileFromServer = await authService.getUserProfile();
          setUserProfile(profileFromServer);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
    
    // Mock notification count - in a real app, this would come from a websocket or polling
    setNotificationCount(3);
  }, []);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
    // Mark as read when opening
    setNotificationCount(0);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };
  
  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logoutUser());
    
    // Mostra messaggio di conferma
    dispatch(showToast({
      message: 'Logout effettuato con successo',
      severity: 'success'
    }));
    
    // Redirect to login
    handleMenuClose();
    navigate('/login');
  };
  
  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };
  
  const handleSettingsClick = () => {
    handleMenuClose();
    navigate('/settings');
  };
  
  const handleHelpClick = () => {
    handleMenuClose();
    navigate('/help');
  };
  
  // Mock notifications - in a real app, these would come from the API
  const notifications = [
    { id: 1, message: 'Nuova vulnerabilità di sicurezza rilevata', time: '5 min fa', read: false },
    { id: 2, message: 'Analisi del codice completata', time: '1 ora fa', read: false },
    { id: 3, message: 'Nuova documentazione generata', time: '3 ore fa', read: false }
  ];
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CodePhoenix
        </Typography>
        
        {/* Notifications */}
        <Box sx={{ mr: 2 }}>
          <Tooltip title="Notifiche">
            <IconButton 
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationMenuAnchor}
            open={notificationMenuOpen}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              sx: { width: 350, maxHeight: 500 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Notifiche</Typography>
            </Box>
            <Divider />
            
            {notifications.length === 0 ? (
              <MenuItem>
                <Typography variant="body2" color="textSecondary">
                  Nessuna nuova notifica
                </Typography>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem key={notification.id} sx={{ py: 1.5 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" component="div">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
            
            <Divider />
            <MenuItem onClick={handleNotificationMenuClose} sx={{ justifyContent: 'center' }}>
              <Typography variant="body2" color="primary">
                Visualizza tutte le notifiche
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
        
        {/* User menu */}
        <Box>
          <Tooltip title="Impostazioni account">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}
              >
                {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { width: 220 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1">
                {userProfile?.username || 'Utente'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {userProfile?.email || 'user@example.com'}
              </Typography>
            </Box>
            <Divider />
            
            <MenuItem onClick={handleProfileClick}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Profilo
            </MenuItem>
            
            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Impostazioni
            </MenuItem>
            
            <MenuItem onClick={handleHelpClick}>
              <HelpIcon fontSize="small" sx={{ mr: 1 }} />
              Aiuto
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;