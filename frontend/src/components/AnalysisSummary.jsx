// src/components/AnalysisSummary.jsx
import React from 'react';
import { 
  Box, Typography, Chip, Grid, Divider, 
  Paper, Link, LinearProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon, 
  HourglassEmpty as PendingIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { formatTimeAgo, formatDate, getScoreColor } from '../utils/formatters';

/**
 * Componente che mostra un riepilogo di un'analisi
 * @param {Object} props - Proprietà del componente
 * @param {Object} props.analysis - Dati dell'analisi
 * @returns {JSX.Element} - Componente di riepilogo
 */
const AnalysisSummary = ({ analysis }) => {
  if (!analysis) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No analysis selected
        </Typography>
      </Box>
    );
  }

  // Determina l'icona di stato
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'in_progress':
        return <PendingIcon color="primary" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  // Formatta la durata in minuti
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end - start;
    const diffInMinutes = Math.round(diffInMs / 60000);
    
    if (diffInMinutes < 1) {
      const diffInSeconds = Math.round(diffInMs / 1000);
      return `${diffInSeconds} seconds`;
    }
    
    return `${diffInMinutes} minutes`;
  };

  // Calcola i dati per il sommario dimensionale
  const dimensionalScores = analysis.result?.dimension_scores || {
    reliability: 0,
    security: 0,
    maintainability: 0,
    performance: 0
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon(analysis.status)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            Analysis {analysis.status === 'completed' ? 'completed' : 
                     analysis.status === 'in_progress' ? 'in progress' : 
                     analysis.status === 'failed' ? 'failed' : 'pending'}
          </Typography>
        </Box>
        <Chip 
          label={analysis.analysis_type || 'full'} 
          size="small"
          color="primary"
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography variant="body2" color="textSecondary">
            Repository:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2">
            {analysis.repo_url?.split('/').pop() || 'Unknown'}
          </Typography>
        </Grid>
        
        <Grid item xs={4}>
          <Typography variant="body2" color="textSecondary">
            Branch:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2">
            {analysis.branch || 'main'}
          </Typography>
        </Grid>
        
        <Grid item xs={4}>
          <Typography variant="body2" color="textSecondary">
            Started:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2">
            {formatDate(analysis.created_at) || 'N/A'}
          </Typography>
        </Grid>
        
        {analysis.completed_at && (
          <>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Completed:
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">
                {formatDate(analysis.completed_at)} 
                ({formatTimeAgo(analysis.completed_at)})
              </Typography>
            </Grid>
            
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">
                Duration:
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body2">
                {formatDuration(analysis.created_at, analysis.completed_at)}
              </Typography>
            </Grid>
          </>
        )}
        
        {analysis.status === 'in_progress' && (
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Progress:
            </Typography>
            <LinearProgress 
              variant="indeterminate" 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              Analysis in progress... ({formatTimeAgo(analysis.created_at)})
            </Typography>
          </Grid>
        )}
      </Grid>
      
      {analysis.status === 'completed' && analysis.result && (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1 }}>
            Analysis Results
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BugIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {analysis.result.issues?.length || 0} issues found
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CodeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {analysis.result.files_analyzed || 0} files analyzed
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {analysis.result.vulnerabilities || 0} vulnerabilities
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon fontSize="small" color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {analysis.result.quality_score || 0}% quality score
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Dimensional Scores
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(dimensionalScores).map(([dimension, score]) => (
                <Grid item xs={6} key={dimension}>
                  <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                    {dimension}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: getScoreColor(score) }}
                  >
                    {score}%
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
      
      {analysis.status === 'failed' && (
        <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'error.light' }}>
          <Typography color="error" gutterBottom>
            Analysis Failed
          </Typography>
          <Typography variant="body2" color="error">
            {analysis.error || 'An unknown error occurred during the analysis.'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AnalysisSummary;