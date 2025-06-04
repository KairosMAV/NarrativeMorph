// src/pages/Documentation.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Button, 
  Stepper, Step, StepLabel, TextField, MenuItem,
  CircularProgress, Alert, Divider, Chip, FormControlLabel, 
  Checkbox, Tabs, Tab
} from '@mui/material';
import {
  Description as DocIcon,
  PlayArrow as StartIcon,
  ArrowForward as NextIcon,
  ViewList as DocListIcon,
  Code as CodeIcon,
  DownloadOutlined as DownloadIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Componenti
import DocumentPreview from '../components/documentation/DocumentPreview';
import DocTypeSelector from '../components/documentation/DocTypeSelector';
import DiagramPreview from '../components/documentation/DiagramPreview';

// Redux
import { selectAllRepositories } from '../redux/slices/repositorySlice';
import { submitDocGeneration } from '../redux/thunks/documentationThunks';

const Documentation = () => {
  const dispatch = useDispatch();
  const repositories = useSelector(selectAllRepositories);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generationCompleted, setGenerationCompleted] = useState(false);
  const [generationResults, setGenerationResults] = useState(null);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    repositoryId: '',
    branch: 'main',
    docType: 'complete',
    outputFormat: 'markdown',
    includeCodeDocs: true,
    includeApiDocs: true,
    includeUserDocs: true,
    includeDiagrams: true,
    diagramTypes: {
      uml: true,
      flowchart: true,
      sequence: true,
      architecture: true
    },
    specificFiles: '',
    customTitle: '',
    customDescription: ''
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.startsWith('diagramTypes.')) {
      const diagramType = name.split('.')[1];
      setFormData({
        ...formData,
        diagramTypes: {
          ...formData.diagramTypes,
          [diagramType]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const handleRepositoryChange = (e) => {
    const repoId = e.target.value;
    const selectedRepo = repositories.find(repo => repo.id === repoId);
    
    setFormData({
      ...formData,
      repositoryId: repoId,
      branch: selectedRepo?.default_branch || 'main',
      customTitle: selectedRepo ? `${selectedRepo.name} Documentation` : ''
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Componi i dati per la generazione
      const docData = {
        repository_id: formData.repositoryId,
        branch: formData.branch,
        doc_type: formData.docType,
        output_format: formData.outputFormat,
        options: {
          include_code_docs: formData.includeCodeDocs,
          include_api_docs: formData.includeApiDocs,
          include_user_docs: formData.includeUserDocs,
          include_diagrams: formData.includeDiagrams,
          diagram_types: formData.diagramTypes,
          specific_files: formData.specificFiles ? formData.specificFiles.split(',').map(f => f.trim()) : [],
          custom_title: formData.customTitle,
          custom_description: formData.customDescription
        }
      };
      
      // Chiamata all'API di generazione documentazione
      const result = await dispatch(submitDocGeneration(docData)).unwrap();
      
      setGenerationResults(result);
      setGenerationCompleted(true);
      handleNext();
    } catch (err) {
      setError(err.message || 'Error submitting documentation generation');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps per lo stepper
  const steps = [
    'Select Repository',
    'Configure Documentation',
    'Results'
  ];
  
  // Per simulare i risultati nella demo standalone
  useEffect(() => {
    if (activeStep === 2 && !generationResults && process.env.NODE_ENV === 'development') {
      // Mock data per sviluppo frontend
      setTimeout(() => {
        setGenerationResults({
          job_id: 'doc_job_' + Date.now(),
          repository: repositories.find(r => r.id === formData.repositoryId)?.name || 'Unknown Repo',
          status: 'completed',
          output_format: formData.outputFormat,
          doc_url: 'https://example.com/docs/generated-doc.md',
          download_url: 'https://example.com/docs/download/generated-doc.zip',
          sections: [
            {
              title: 'Introduction',
              content: `# ${formData.customTitle || 'Project Documentation'}
              
${formData.customDescription || 'This documentation was automatically generated by CodePhoenix.'}

## Project Overview

This repository contains a web application built with React and Redux for the frontend and Node.js with Express for the backend. The application provides functionality for code analysis, security scanning, and automated testing.

### Key Features

- Code quality analysis
- Security vulnerability detection
- Automated test generation
- Documentation generation

### Technology Stack

- Frontend: React, Redux, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Testing: Jest, React Testing Library`
            },
            {
              title: 'Architecture',
              content: `# Architecture

The application follows a client-server architecture with the following components:

## Client (Frontend)

The frontend is built with React and uses Redux for state management. It follows a component-based architecture with reusable UI elements.

### Key Components

- **App**: The main application component
- **Dashboard**: Shows overview of repositories and analyses
- **RepositoryDetail**: Displays detailed information about a repository
- **AnalysisDetail**: Shows analysis results

## Server (Backend)

The backend is built with Node.js and Express, providing RESTful APIs for the frontend.

### Key Modules

- **AuthController**: Handles user authentication
- **RepositoryService**: Manages repository operations
- **AnalysisService**: Handles code analysis tasks`
            },
            {
              title: 'API Documentation',
              content: `# API Documentation

## Authentication

### POST /api/auth/login

Authenticates a user and returns a JWT token.

#### Request

\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

#### Response

\`\`\`json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
\`\`\`

## Repositories

### GET /api/repositories

Returns a list of repositories for the authenticated user.

#### Headers

\`\`\`
Authorization: Bearer {token}
\`\`\`

#### Response

\`\`\`json
[
  {
    "id": "string",
    "name": "string",
    "url": "string",
    "description": "string",
    "default_branch": "string",
    "created_at": "string"
  }
]
\`\`\``
            }
          ],
          diagrams: [
            {
              title: 'Component Architecture',
              type: 'architecture',
              content: `graph TD
    A[Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Repository Service]
    B --> E[Analysis Service]
    D --> F[(Database)]
    E --> F
    C --> F`
            },
            {
              title: 'Authentication Flow',
              type: 'sequence',
              content: `sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    
    U->>FE: Enter credentials
    FE->>BE: POST /auth/login
    BE->>DB: Validate credentials
    DB-->>BE: Return user data
    BE-->>FE: Return JWT token
    FE-->>U: Show dashboard`
            }
          ],
          stats: {
            total_files_analyzed: 45,
            total_lines_documented: 1250,
            api_endpoints_documented: 12,
            diagrams_generated: 6,
            code_examples: 24
          }
        });
      }, 2000);
    }
  }, [activeStep, formData.customDescription, formData.customTitle, formData.outputFormat, formData.repositoryId, generationResults, repositories]);
  
  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <DocIcon sx={{ mr: 1 }} />
          Documentation Generation
        </Typography>
        
        <Button 
          component={Link} 
          to="/documentation/history"
          variant="outlined"
          startIcon={<DocListIcon />}
        >
          Documentation History
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Select Repository"
                fullWidth
                value={formData.repositoryId}
                onChange={handleRepositoryChange}
                required
              >
                {repositories.map((repo) => (
                  <MenuItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch"
                fullWidth
                value={formData.branch}
                onChange={handleChange}
                name="branch"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.repositoryId}
                  endIcon={<NextIcon />}
                >
                  Next
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Documentation Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DocTypeSelector
                value={formData.docType}
                onChange={(value) => setFormData({...formData, docType: value})}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Output Format"
                fullWidth
                value={formData.outputFormat}
                onChange={handleChange}
                name="outputFormat"
              >
                <MenuItem value="markdown">Markdown</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="sphinx">Sphinx (ReadTheDocs)</MenuItem>
              </TextField>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Documentation Title"
                  fullWidth
                  value={formData.customTitle}
                  onChange={handleChange}
                  name="customTitle"
                  placeholder="e.g., Project Name Documentation"
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.customDescription}
                  onChange={handleChange}
                  name="customDescription"
                  placeholder="Brief description of the project"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Specific Files or Directories (optional, comma separated)"
                fullWidth
                value={formData.specificFiles}
                onChange={handleChange}
                name="specificFiles"
                placeholder="e.g., src/components, src/utils/helpers.js"
                helperText="Leave empty to document the entire repository"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Documentation Sections:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip 
                  label="Code Documentation" 
                  color={formData.includeCodeDocs ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    includeCodeDocs: !formData.includeCodeDocs
                  })}
                />
                <Chip 
                  label="API Documentation" 
                  color={formData.includeApiDocs ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    includeApiDocs: !formData.includeApiDocs
                  })}
                />
                <Chip 
                  label="User Documentation" 
                  color={formData.includeUserDocs ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    includeUserDocs: !formData.includeUserDocs
                  })}
                />
                <Chip 
                  label="Include Diagrams" 
                  color={formData.includeDiagrams ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    includeDiagrams: !formData.includeDiagrams
                  })}
                />
              </Box>
            </Grid>
            
            {formData.includeDiagrams && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Diagram Types:
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  <Chip 
                    label="UML Class Diagrams" 
                    color={formData.diagramTypes.uml ? "primary" : "default"}
                    onClick={() => setFormData({
                      ...formData,
                      diagramTypes: {
                        ...formData.diagramTypes,
                        uml: !formData.diagramTypes.uml
                      }
                    })}
                  />
                  <Chip 
                    label="Flowcharts" 
                    color={formData.diagramTypes.flowchart ? "primary" : "default"}
                    onClick={() => setFormData({
                      ...formData,
                      diagramTypes: {
                        ...formData.diagramTypes,
                        flowchart: !formData.diagramTypes.flowchart
                      }
                    })}
                  />
                  <Chip 
                    label="Sequence Diagrams" 
                    color={formData.diagramTypes.sequence ? "primary" : "default"}
                    onClick={() => setFormData({
                      ...formData,
                      diagramTypes: {
                        ...formData.diagramTypes,
                        sequence: !formData.diagramTypes.sequence
                      }
                    })}
                  />
                  <Chip 
                    label="Architecture Diagrams" 
                    color={formData.diagramTypes.architecture ? "primary" : "default"}
                    onClick={() => setFormData({
                      ...formData,
                      diagramTypes: {
                        ...formData.diagramTypes,
                        architecture: !formData.diagramTypes.architecture
                      }
                    })}
                  />
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <StartIcon />}
                >
                  Generate Documentation
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 2 && (
          <Grid container spacing={3}>
            {!generationResults ? (
              <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Generating documentation...
                </Typography>
              </Grid>
            ) : (
              <>
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      bgcolor: 'background.paper', 
                      p: 2, 
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h5">
                      Documentation for: {generationResults.repository}
                    </Typography>
                    <Chip 
                      label={generationResults.status} 
                      color={generationResults.status === 'completed' ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ mt: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                      <Tab label="Documentation Preview" icon={<PreviewIcon />} iconPosition="start" />
                      <Tab label="Generated Diagrams" icon={<CodeIcon />} iconPosition="start" />
                    </Tabs>
                    
                    <Box p={2}>
                      {activeTab === 0 && (
                        <DocumentPreview sections={generationResults.sections} format={generationResults.output_format} />
                      )}
                      
                      {activeTab === 1 && (
                        <DiagramPreview diagrams={generationResults.diagrams} />
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Documentation Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="primary.main">
                            {generationResults.stats.total_files_analyzed}
                          </Typography>
                          <Typography variant="body2">Files Analyzed</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="primary.main">
                            {generationResults.stats.total_lines_documented}
                          </Typography>
                          <Typography variant="body2">Lines Documented</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="primary.main">
                            {generationResults.stats.api_endpoints_documented}
                          </Typography>
                          <Typography variant="body2">API Endpoints</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="primary.main">
                            {generationResults.stats.diagrams_generated}
                          </Typography>
                          <Typography variant="body2">Diagrams</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="primary.main">
                            {generationResults.stats.code_examples}
                          </Typography>
                          <Typography variant="body2">Code Examples</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      component="a" 
                      href={generationResults.doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<PreviewIcon />}
                    >
                      View Online
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      component="a"
                      href={generationResults.download_url}
                      download
                      startIcon={<DownloadIcon />}
                    >
                      Download Documentation
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Documentation;