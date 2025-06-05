import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Code as GitLabIcon,
  Storage as DatabaseIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { createRepository } from '../services/apiService';

const NewRepository = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Repository data
  const [formData, setFormData] = useState({
    repositoryType: 'github',
    url: '',
    name: '',
    description: '',
    defaultBranch: 'main',
    auth: 'none',
    username: '',
    password: '',
    token: '',
    scanFrequency: 'manual'
  });
  
  // Validation states
  const [urlValidation, setUrlValidation] = useState({
    isValid: true,
    message: ''
  });
  
  // Steps definition
  const steps = ['Repository Details', 'Authentication', 'Configuration'];
  
  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate URL if that field is being changed
    if (name === 'url') {
      validateUrl(value);
    }
  };
  
  // URL validation
  const validateUrl = (url) => {
    if (!url) {
      setUrlValidation({
        isValid: false,
        message: 'Repository URL is required'
      });
      return false;
    }
    
    if (formData.repositoryType === 'github' && !url.includes('github.com')) {
      setUrlValidation({
        isValid: false,
        message: 'Must be a valid GitHub URL'
      });
      return false;
    }
    
    if (formData.repositoryType === 'gitlab' && !url.includes('gitlab.com')) {
      setUrlValidation({
        isValid: false,
        message: 'Must be a valid GitLab URL'
      });
      return false;
    }
    
    setUrlValidation({
      isValid: true,
      message: ''
    });
    return true;
  };
  
  // Validate current step
  const validateStep = () => {
    switch (activeStep) {
      case 0:
        // Validate repository details
        if (!formData.url || !urlValidation.isValid) {
          validateUrl(formData.url);
          return false;
        }
        return true;
      
      case 1:
        // Validate authentication (if needed)
        if (formData.auth === 'basic' && (!formData.username || !formData.password)) {
          setError('Username and password are required for basic authentication');
          return false;
        }
        
        if (formData.auth === 'token' && !formData.token) {
          setError('Access token is required for token authentication');
          return false;
        }
        
        setError('');
        return true;
      
      case 2:
        // Configuration validation (all optional)
        return true;
      
      default:
        return true;
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Submit repository data
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare data for API
      const repositoryData = {
        url: formData.url,
        name: formData.name || extractNameFromUrl(formData.url),
        description: formData.description,
        default_branch: formData.defaultBranch,
        auth_type: formData.auth,
        ...(formData.auth === 'basic' && {
          username: formData.username,
          password: formData.password  // In a real app, handle credentials securely
        }),
        ...(formData.auth === 'token' && {
          access_token: formData.token
        }),
        scan_frequency: formData.scanFrequency
      };
      
      const response = await createRepository(repositoryData);
      
      // Set success
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(`/repositories/${response.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating repository:', error);
      setError(error.response?.data?.message || 'Failed to create repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Extract repository name from URL
  const extractNameFromUrl = (url) => {
    if (!url) return '';
    
    // Try to extract the repository name from the URL
    const urlParts = url.trim().split('/');
    return urlParts[urlParts.length - 1] || 
           urlParts[urlParts.length - 2] || 
           '';
  };
  
  // Get icon based on repository type
  const getRepositoryIcon = () => {
    switch (formData.repositoryType) {
      case 'github':
        return <GitHubIcon />;
      case 'gitlab':
        return <GitLabIcon />;
      default:
        return <DatabaseIcon />;
    }
  };
  
  // Render form step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Repository Type</FormLabel>
                <RadioGroup
                  row
                  name="repositoryType"
                  value={formData.repositoryType}
                  onChange={handleChange}
                >
                  <FormControlLabel 
                    value="github" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GitHubIcon sx={{ mr: 1 }} />
                        GitHub
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="gitlab" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GitLabIcon sx={{ mr: 1 }} />
                        GitLab
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="other" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DatabaseIcon sx={{ mr: 1 }} />
                        Other Git
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Repository URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder={
                  formData.repositoryType === 'github' 
                    ? 'https://github.com/username/repository' 
                    : formData.repositoryType === 'gitlab'
                      ? 'https://gitlab.com/username/repository'
                      : 'https://example.com/git/repository'
                }
                error={!urlValidation.isValid}
                helperText={urlValidation.message}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: 'action.active', mr: 1, my: 0.5 }}>
                      {getRepositoryIcon()}
                    </Box>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Repository Name (Optional)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="If left empty, we'll extract it from the URL"
                helperText="A friendly name to identify this repository"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Describe this repository for your team"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Branch"
                name="defaultBranch"
                value={formData.defaultBranch}
                onChange={handleChange}
                helperText="The main branch to analyze by default"
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Authentication Method</FormLabel>
                <RadioGroup
                  row
                  name="auth"
                  value={formData.auth}
                  onChange={handleChange}
                >
                  <FormControlLabel value="none" control={<Radio />} label="Public Repository (No Auth)" />
                  <FormControlLabel value="basic" control={<Radio />} label="Username & Password" />
                  <FormControlLabel value="token" control={<Radio />} label="Access Token" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {formData.auth === 'basic' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    For security reasons, we recommend using access tokens instead of passwords.
                  </Alert>
                </Grid>
              </>
            )}
            
            {formData.auth === 'token' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Access Token"
                    name="token"
                    value={formData.token}
                    onChange={handleChange}
                    helperText={
                      formData.repositoryType === 'github'
                        ? 'GitHub Personal Access Token with repo scope'
                        : formData.repositoryType === 'gitlab'
                          ? 'GitLab Personal Access Token with read_repository scope'
                          : 'Access token for your Git provider'
                    }
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    {formData.repositoryType === 'github' ? (
                      <span>
                        Create a Personal Access Token in your{' '}
                        <Link href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                          GitHub Settings
                        </Link>
                      </span>
                    ) : formData.repositoryType === 'gitlab' ? (
                      <span>
                        Create a Personal Access Token in your{' '}
                        <Link href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank" rel="noopener noreferrer">
                          GitLab Settings
                        </Link>
                      </span>
                    ) : (
                      'Create an access token from your Git provider'
                    )}
                  </Alert>
                </Grid>
              </>
            )}
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Scan Frequency</InputLabel>
                <Select
                  name="scanFrequency"
                  value={formData.scanFrequency}
                  label="Scan Frequency"
                  onChange={handleChange}
                >
                  <MenuItem value="manual">Manual Scans Only</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="on_commit">On Commit (via Webhook)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.scanFrequency === 'on_commit' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  After creating the repository, you'll need to set up a webhook in your Git provider to trigger scans on new commits.
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Repository Summary
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Repository Type:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getRepositoryIcon()}
                      <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {formData.repositoryType}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      URL:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {formData.url}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {formData.name || extractNameFromUrl(formData.url) || 'Auto-generated from URL'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Authentication:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {formData.auth === 'none' ? 'None (Public)' : formData.auth}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Scan Frequency:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {formData.scanFrequency.replace('_', ' ')}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton
          edge="start"
          onClick={() => navigate('/repositories')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" component="h1">
          Add New Repository
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {success ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Repository Added Successfully
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Redirecting you to the repository page...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </Box>
        ) : (
          <React.Fragment>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                >
                  Back
                </Button>
                
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Add Repository'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={loading}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </React.Fragment>
        )}
      </Paper>
    </Container>
  );
};

export default NewRepository;