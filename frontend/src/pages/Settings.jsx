// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  FormControlLabel,
  Switch,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
  Breadcrumbs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  CloudSync as SyncIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { toggleDarkMode, showToast } from '../redux/slices/uiSlice';
import { selectDarkMode } from '../redux/slices/uiSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkMode);
  
  // Stato locale per impostazioni
  const [settings, setSettings] = useState({
    language: 'it',
    notifications: {
      email: true,
      browser: true,
      mobileApp: false
    },
    scanFrequency: 'weekly',
    syncSettings: {
      githubSync: true,
      gitlabSync: false,
      bitbucketSync: false
    },
    dataRetention: 90
  });
  
  const [success, setSuccess] = useState(false);
  
  // Gestori di eventi
  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };
  
  const handleNotificationToggle = (type) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  };
  
  const handleSyncToggle = (type) => {
    setSettings({
      ...settings,
      syncSettings: {
        ...settings.syncSettings,
        [type]: !settings.syncSettings[type]
      }
    });
  };
  
  const handleLanguageChange = (event) => {
    setSettings({
      ...settings,
      language: event.target.value
    });
  };
  
  const handleScanFrequencyChange = (event) => {
    setSettings({
      ...settings,
      scanFrequency: event.target.value
    });
  };
  
  const handleDataRetentionChange = (event) => {
    setSettings({
      ...settings,
      dataRetention: event.target.value
    });
  };
  
  const handleSaveSettings = () => {
    // In un'app reale, salveresti le impostazioni nel backend
    // Simula il salvataggio
    setSuccess(true);
    
    // Mostra toast
    dispatch(showToast({
      message: 'Impostazioni salvate con successo',
      severity: 'success'
    }));
  };
  
  const handleCloseSuccess = () => {
    setSuccess(false);
  };
  
  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Impostazioni</Typography>
      </Breadcrumbs>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Impostazioni
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configura la tua esperienza con CodePhoenix
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Impostazioni Interfaccia */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Interfaccia
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Tema Scuro" 
                  secondary="Attiva/disattiva il tema scuro dell'interfaccia"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Lingua" 
                  secondary="Seleziona la lingua dell'interfaccia"
                />
                <ListItemSecondaryAction>
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <Select
                      value={settings.language}
                      onChange={handleLanguageChange}
                      displayEmpty
                    >
                      <MenuItem value="it">Italiano</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Español</MenuItem>
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="de">Deutsch</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Impostazioni Notifiche */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Notifiche
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Notifiche Email" 
                  secondary="Ricevi aggiornamenti via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationToggle('email')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Notifiche Browser" 
                  secondary="Ricevi notifiche nel browser"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.notifications.browser}
                    onChange={() => handleNotificationToggle('browser')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Notifiche App Mobile" 
                  secondary="Ricevi notifiche su dispositivi mobili"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.notifications.mobileApp}
                    onChange={() => handleNotificationToggle('mobileApp')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Impostazioni Analisi */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analisi e Scansioni
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Frequenza Predefinita di Analisi
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={settings.scanFrequency}
                  onChange={handleScanFrequencyChange}
                  size="small"
                >
                  <MenuItem value="hourly">Ogni ora</MenuItem>
                  <MenuItem value="daily">Giornaliera</MenuItem>
                  <MenuItem value="weekly">Settimanale</MenuItem>
                  <MenuItem value="monthly">Mensile</MenuItem>
                  <MenuItem value="manual">Solo manuale</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary">
                Questa impostazione sarà applicata ai nuovi repository aggiunti
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Conservazione Dati
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={settings.dataRetention}
                  onChange={handleDataRetentionChange}
                  size="small"
                >
                  <MenuItem value={30}>30 giorni</MenuItem>
                  <MenuItem value={60}>60 giorni</MenuItem>
                  <MenuItem value={90}>90 giorni</MenuItem>
                  <MenuItem value={180}>6 mesi</MenuItem>
                  <MenuItem value={365}>1 anno</MenuItem>
                  <MenuItem value={0}>Conserva tutto</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary">
                I dati di analisi più vecchi verranno eliminati automaticamente
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Impostazioni Integrazione */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integrazioni
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Sincronizzazione GitHub" 
                  secondary="Sincronizza automaticamente i repository GitHub"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.syncSettings.githubSync}
                    onChange={() => handleSyncToggle('githubSync')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Sincronizzazione GitLab" 
                  secondary="Sincronizza automaticamente i repository GitLab"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.syncSettings.gitlabSync}
                    onChange={() => handleSyncToggle('gitlabSync')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Sincronizzazione Bitbucket" 
                  secondary="Sincronizza automaticamente i repository Bitbucket"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.syncSettings.bitbucketSync}
                    onChange={() => handleSyncToggle('bitbucketSync')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Bottoni di azione */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ ml: 2 }}
            >
              Salva Impostazioni
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Snackbar di successo */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        message="Impostazioni salvate con successo"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSuccess}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default Settings;