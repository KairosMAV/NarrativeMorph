import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  BugReport as BugIcon,
  Storage as StorageIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const MetricsOverview = ({ metrics }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center">
            <Box 
              bgcolor="primary.main" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              borderRadius="50%"
              width={56}
              height={56}
              mr={2}
            >
              <StorageIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" component="div">
                {metrics.totalRepositories}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Repositories
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center">
            <Box 
              bgcolor="success.main" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              borderRadius="50%"
              width={56}
              height={56}
              mr={2}
            >
              <AssessmentIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" component="div">
                {metrics.totalAnalyses}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Analyses
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center">
            <Box 
              bgcolor="error.main" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              borderRadius="50%"
              width={56}
              height={56}
              mr={2}
            >
              <BugIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" component="div">
                {metrics.issuesFound}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Issues Found
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center">
            <Box 
              bgcolor="warning.main" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              borderRadius="50%"
              width={56}
              height={56}
              mr={2}
            >
              <SpeedIcon sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" component="div">
                {metrics.averageQualityScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Avg. Quality Score
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MetricsOverview;