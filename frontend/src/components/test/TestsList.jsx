// src/components/test/TestsList.jsx
import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Box,
  Paper
} from '@mui/material';
import {
  CheckCircle as PassedIcon,
  Cancel as FailedIcon,
  Code as UnitIcon,
  Integration as IntegrationIcon,
  ScreenshotMonitor as E2EIcon,
  TrendingUp as ContributionIcon
} from '@mui/icons-material';

/**
 * Component to display a list of generated tests
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tests - Array of test objects
 * @param {Function} props.onSelectTest - Function to call when a test is selected
 * @param {string} props.selectedTestId - ID of the currently selected test
 * @returns {JSX.Element} - TestsList component
 */
const TestsList = ({ tests, onSelectTest, selectedTestId }) => {
  if (!tests || tests.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No tests available
        </Typography>
      </Box>
    );
  }
  
  const getTestIcon = (test) => {
    // First by status
    if (test.status === 'passed') {
      return <PassedIcon color="success" />;
    } else if (test.status === 'failed') {
      return <FailedIcon color="error" />;
    }
    
    // Then by type
    switch (test.type?.toLowerCase()) {
      case 'unit':
        return <UnitIcon color="primary" />;
      case 'integration':
        return <IntegrationIcon color="secondary" />;
      case 'e2e':
        return <E2EIcon color="info" />;
      default:
        return <UnitIcon color="primary" />;
    }
  };
  
  const getTestTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'unit':
        return 'primary';
      case 'integration':
        return 'secondary';
      case 'e2e':
        return 'info';
      default:
        return 'default';
    }
  };
  
  return (
    <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto' }}>
      <List disablePadding>
        {tests.map((test, index) => (
          <React.Fragment key={test.id}>
            <ListItemButton 
              selected={selectedTestId === test.id}
              onClick={() => onSelectTest(test)}
            >
              <ListItemIcon>
                {getTestIcon(test)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" noWrap>
                    {test.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {test.file}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <ContributionIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="primary">
                        {test.coverage_contribution}% coverage
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Chip 
                  label={test.type} 
                  size="small"
                  color={getTestTypeColor(test.type)}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip 
                  label={test.status} 
                  size="small"
                  color={test.status === 'passed' ? 'success' : 'error'}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </ListItemButton>
            {index < tests.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TestsList;