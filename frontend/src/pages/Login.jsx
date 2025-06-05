// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Lock as LockIcon,
  GitHub as GitHubIcon,
  Code as GitLabIcon
} from '@mui/icons-material';
import authService from '../services/authService';
import { showToast } from '../redux/slices/uiSlice';
import config from '../config';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('username'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Controlla se stiamo ricevendo un code dall'OAuth
  const queryParams = new URLSearchParams(location.search);
  const oauthCode = queryParams.get('code');
  const oauthProvider = queryParams.get('provider');
  const sessionExpired = queryParams.get('session') === 'expired';

  // Controlla se l'utente è già autenticato
  useEffect(() => {
    if (authService.isAuthenticated() && !sessionExpired) {
      navigate('/dashboard');
    }
    
    // Mostra messaggio se la sessione è scaduta
    if (sessionExpired) {
      setError('La tua sessione è scaduta. Accedi nuovamente.');
    }
  }, [navigate, sessionExpired]);

  // Gestisce il callback OAuth se presente
  useEffect(() => {
    const handleOAuth = async () => {
      if (!oauthCode || !oauthProvider) return;
      
      setLoading(true);
      setError('');
      
      try {
        const redirectUri = window.location.origin + '/login';
        let response;
        
        if (oauthProvider === 'github') {
          response = await authService.authorizeWithGitHub(oauthCode, redirectUri);
        } else if (oauthProvider === 'gitlab') {
          response = await authService.authorizeWithGitLab(oauthCode, redirectUri);
        }
        
        if (response && response.token) {
          // Mostra messaggio di successo
          dispatch(showToast({
            message: 'Accesso effettuato con successo!',
            severity: 'success'
          }));
          
          // Reindirizza alla Dashboard o alla pagina originale
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from);
        }
      } catch (err) {
        console.error('OAuth login error:', err);
        setError('Autenticazione fallita. Riprova.');
      } finally {
        setLoading(false);
      }
    };
    
    handleOAuth();
  }, [oauthCode, oauthProvider, navigate, location.state, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Inserisci sia username che password.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Development mode bypass
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: bypassing authentication');
        
        // Simulate successful login
        const token = 'fake-dev-token-' + Date.now();
        const user = {
          id: 1,
          username: username,
          name: username === 'admin' ? 'Admin User' : 'Development User',
          role: username === 'admin' ? 'admin' : 'user',
          email: `${username}@example.com`
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update Redux state through auth service
        await authService.setAuthState(true, user, token);
        
        // Show success message
        dispatch(showToast({
          message: 'Accesso effettuato con successo! (Development Mode)',
          severity: 'success'
        }));
        
        // Ensure we have a small delay to let Redux state update
        setTimeout(() => {
          // Force redirect to dashboard
          navigate('/dashboard', { replace: true });
        }, 100);
        
        return;
      }

      // Production mode - real authentication
      await authService.login(username, password);
      
      if (rememberMe) {
        localStorage.setItem('username', username);
      } else {
        localStorage.removeItem('username');
      }
      
      dispatch(showToast({
        message: 'Accesso effettuato con successo!',
        severity: 'success'
      }));
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err) {
      console.error('Login error:', err);
      setError('Username o password non validi. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    const clientId = config.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/login?provider=github`);
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email,repo`;
    window.location.href = githubUrl;
  };

  const handleGitLabLogin = () => {
    const clientId = config.GITLAB_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/login?provider=gitlab`);
    const gitlabUrl = `https://gitlab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read_user`;
    window.location.href = gitlabUrl;
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              mb: 3
            }}
          >
            <LockIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography component="h1" variant="h5">
              Accedi a CodePhoenix
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Ricordami"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Accedi'}
            </Button>
            
            <Divider sx={{ my: 2 }}>oppure</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              sx={{ mb: 2 }}
              onClick={handleGitHubLogin}
              disabled={loading}
            >
              Accedi con GitHub
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitLabIcon />}
              onClick={handleGitLabLogin}
              disabled={loading}
            >
              Accedi con GitLab
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="#" variant="body2">
                Password dimenticata?
              </Link>
            </Box>
            
            {/* Solo per sviluppo/demo */}
            {process.env.NODE_ENV === 'development' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Credenziali di test: <br />
                  Username: <strong>admin</strong> o <strong>demo</strong><br />
                  Password: <strong>password</strong>
                </Typography>
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;