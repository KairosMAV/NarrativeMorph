// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Breadcrumbs
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  SettingsBackupRestore as TokenIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectAuthLoading } from '../redux/slices/authSlice';
import { updateProfile, changePassword } from '../redux/thunks/authThunks';
import { showToast } from '../redux/slices/uiSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  
  const [editMode, setEditMode] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);
  
  const handleEdit = () => {
    setEditMode(true);
    setError('');
    setSuccess('');
  };
  
  const handleCancel = () => {
    setEditMode(false);
    setChangingPassword(false);
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
    setPassword({
      current: '',
      new: '',
      confirm: ''
    });
    setError('');
    setSuccess('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError('');
      
      const result = await dispatch(updateProfile(editedUser)).unwrap();
      dispatch(showToast({ message: 'Profile updated successfully', severity: 'success' }));
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Error updating profile');
      dispatch(showToast({ message: err.message || 'Error updating profile', severity: 'error' }));
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleSavePassword = async () => {
    if (password.new !== password.confirm) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.new.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    try {
      setSaveLoading(true);
      setError('');
      
      await dispatch(changePassword(password)).unwrap();
      dispatch(showToast({ message: 'Password changed successfully', severity: 'success' }));
      setSuccess('Password changed successfully');
      setChangingPassword(false);
      setPassword({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (err) {
      setError(err.message || 'Error changing password');
      dispatch(showToast({ message: err.message || 'Error changing password', severity: 'error' }));
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleGitHubConnect = async () => {
    // Implementation for GitHub OAuth connection
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`;
  };
  
  const getAvatarLetter = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };
  
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Profilo</Typography>
      </Breadcrumbs>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Il mio profilo
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Scheda profilo */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  bgcolor: 'primary.main',
                  mb: 2
                }}
              >
                {getAvatarLetter()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user?.name || user?.username || 'Utente'}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {user?.role === 'admin' ? 'Amministratore' : 'Utente'}
              </Typography>
              
              <Chip
                icon={<GitHubIcon />}
                label={user?.github_username || 'Non collegato'}
                variant="outlined"
                color={user?.github_username ? 'primary' : 'default'}
                sx={{ mt: 1 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mt: 3 }}
                fullWidth
                disabled={editMode}
              >
                Modifica profilo
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<LockIcon />}
                onClick={() => setChangingPassword(true)}
                sx={{ mt: 2 }}
                fullWidth
                disabled={changingPassword}
              >
                Cambia password
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Dettagli profilo */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {changingPassword ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Cambia Password
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password attuale"
                      type="password"
                      name="current"
                      value={password.current}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nuova password"
                      type="password"
                      name="new"
                      value={password.new}
                      onChange={handlePasswordChange}
                      required
                      helperText="Almeno 8 caratteri"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Conferma password"
                      type="password"
                      name="confirm"
                      value={password.confirm}
                      onChange={handlePasswordChange}
                      required
                      error={password.new !== password.confirm && password.confirm !== ''}
                      helperText={
                        password.new !== password.confirm && password.confirm !== ''
                          ? 'Le password non corrispondono'
                          : ''
                      }
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ mr: 2 }}
                    startIcon={<CancelIcon />}
                    disabled={saveLoading}
                  >
                    Annulla
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSavePassword}
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={
                      saveLoading ||
                      !password.current ||
                      !password.new ||
                      !password.confirm ||
                      password.new !== password.confirm
                    }
                  >
                    Salva password
                  </Button>
                </Box>
              </>
            ) : editMode ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Modifica Profilo
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nome completo"
                      name="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefono"
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Località"
                      name="location"
                      value={editedUser.location}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ mr: 2 }}
                    startIcon={<CancelIcon />}
                    disabled={saveLoading}
                  >
                    Annulla
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saveLoading}
                  >
                    Salva profilo
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Informazioni Profilo</Typography>
                  <IconButton onClick={handleEdit} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {user?.email || 'Non specificata'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Telefono
                        </Typography>
                        <Typography variant="body1">
                          {user?.phone || 'Non specificato'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Località
                        </Typography>
                        <Typography variant="body1">
                          {user?.location || 'Non specificata'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Token API
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Il tuo token API personale
                    </Typography>
                    <Typography variant="body2">
                      ••••••••••••••••••••••••••••••••
                    </Typography>
                  </Box>
                  
                  <Tooltip title="Rigenera token">
                    <IconButton color="primary">
                      <TokenIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Integrazioni */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integrazioni
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GitHubIcon color="action" sx={{ mr: 2 }} />
                        <Typography variant="subtitle1">
                          GitHub
                        </Typography>
                      </Box>
                      
                      {user?.github_username ? (
                        <Chip 
                          label="Connesso" 
                          color="success" 
                          size="small" 
                          variant="outlined" 
                        />
                      ) : (
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleGitHubConnect}
                        >
                          Connetti
                        </Button>
                      )}
                    </Box>
                    
                    {user?.github_username && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Connesso come {user.github_username}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;