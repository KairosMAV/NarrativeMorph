// src/components/documentation/DocTypeSelector.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea, 
  Grid,
  Divider
} from '@mui/material';
import {
  Description as DocIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  Person as UserIcon,
  AppShortcut as ModuleIcon,
  Architecture as ArchitectureIcon
} from '@mui/icons-material';

/**
 * Component for selecting the type of documentation to generate
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected documentation type
 * @param {Function} props.onChange - Function to call when selection changes
 * @returns {JSX.Element} - DocTypeSelector component
 */
const DocTypeSelector = ({ value, onChange }) => {
  const docTypes = [
    {
      id: 'complete',
      title: 'Complete Documentation',
      description: 'Generate comprehensive documentation including code, API, and user guides',
      icon: <DocIcon fontSize="large" />
    },
    {
      id: 'code',
      title: 'Code Documentation',
      description: 'Document code structure, classes, and functions with inline examples',
      icon: <CodeIcon fontSize="large" />
    },
    {
      id: 'api',
      title: 'API Documentation',
      description: 'Generate API reference with endpoints, parameters, and examples',
      icon: <ApiIcon fontSize="large" />
    },
    {
      id: 'user',
      title: 'User Documentation',
      description: 'Create user guides and how-to documentation for end users',
      icon: <UserIcon fontSize="large" />
    },
    {
      id: 'architecture',
      title: 'Architecture Documentation',
      description: 'Document system architecture with diagrams and component relationships',
      icon: <ArchitectureIcon fontSize="large" />
    },
    {
      id: 'module',
      title: 'Module Documentation',
      description: 'Targeted documentation for specific modules or components',
      icon: <ModuleIcon fontSize="large" />
    }
  ];
  
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Documentation Type
      </Typography>
      <Grid container spacing={2}>
        {docTypes.map((type) => (
          <Grid item xs={12} sm={6} key={type.id}>
            <Card 
              variant={value === type.id ? "elevation" : "outlined"}
              elevation={value === type.id ? 4 : 0}
              sx={{ 
                borderColor: value === type.id ? 'primary.main' : 'divider',
                height: '100%'
              }}
            >
              <CardActionArea 
                onClick={() => onChange(type.id)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box color={value === type.id ? 'primary.main' : 'text.secondary'} mr={1}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {type.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DocTypeSelector;