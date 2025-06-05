// src/components/refactoring/CodeQualityMetrics.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  LinearProgress,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  TrendingUp as ImprovedIcon,
  TrendingDown as DegradedIcon,
  TrendingFlat as UnchangedIcon
} from '@mui/icons-material';

/**
 * Component for displaying code quality metrics before and after refactoring
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Object containing before and after metrics
 * @returns {JSX.Element} - CodeQualityMetrics component
 */
const CodeQualityMetrics = ({ metrics }) => {
  if (!metrics || !metrics.before || !metrics.after) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No quality metrics available
        </Typography>
      </Box>
    );
  }
  
  // Helper to calculate improvement percentage
  const calculateImprovement = (before, after) => {
    if (before === 0) return 0;
    return ((after - before) / before) * 100;
  };
  
  // Helper to determine if metric improvement is positive or negative
  // For most metrics, a decrease is good (e.g., code smells, duplications)
  // For some metrics, an increase is good (e.g., maintainability index)
  const isPositiveImprovement = (metricName, improvement) => {
    // These metrics are better when they increase
    const increaseBetter = ['maintainability_index'];
    
    if (increaseBetter.includes(metricName)) {
      return improvement > 0;
    }
    
    // For all other metrics, a decrease is better
    return improvement < 0;
  };
  
  // Generate metrics rows
  const metricRows = Object.keys(metrics.before).map(metricName => {
    const beforeValue = metrics.before[metricName];
    const afterValue = metrics.after[metricName];
    const improvement = calculateImprovement(beforeValue, afterValue);
    const isPositive = isPositiveImprovement(metricName, improvement);
    
    return {
      name: metricName,
      before: beforeValue,
      after: afterValue,
      improvement,
      isPositive
    };
  });
  
  const formatMetricName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getImprovementIcon = (improvement, isPositive) => {
    if (Math.abs(improvement) < 1) {
      return <UnchangedIcon color="action" />;
    }
    
    return isPositive ? 
      <ImprovedIcon color="success" /> : 
      <DegradedIcon color="error" />;
  };
  
  const getImprovedColor = (improvement, isPositive) => {
    if (Math.abs(improvement) < 1) return 'text.secondary';
    return isPositive ? 'success.main' : 'error.main';
  };
  
  const getProgressValue = (current, max) => {
    return (current / max) * 100;
  };
  
  // Calculate max values for progress bars
  const maxValues = metricRows.reduce((acc, row) => {
    acc[row.name] = Math.max(row.before, row.after);
    return acc;
  }, {});
  
  return (
    <Box>
      <Grid container spacing={2}>
        {metricRows.map(metric => (
          <Grid item xs={12} key={metric.name}>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                  {formatMetricName(metric.name)}
                </Typography>
                <Box display="flex" alignItems="center">
                  {getImprovementIcon(metric.improvement, metric.isPositive)}
                  <Typography 
                    variant="body2" 
                    color={getImprovedColor(metric.improvement, metric.isPositive)}
                    sx={{ ml: 0.5 }}
                  >
                    {Math.abs(metric.improvement).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Before: {metric.before}
                  </Typography>
                  <Tooltip title={`Before: ${metric.before}`}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressValue(metric.before, maxValues[metric.name])}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="warning"
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    After: {metric.after}
                  </Typography>
                  <Tooltip title={`After: ${metric.after}`}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgressValue(metric.after, maxValues[metric.name])}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="success"
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
            <Divider />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CodeQualityMetrics;