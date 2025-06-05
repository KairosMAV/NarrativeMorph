import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Button,
  TextField,
  Alert
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Architecture as ArchitectureIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'security':
      return <SecurityIcon color="warning" />;
    case 'performance':
      return <SpeedIcon color="info" />;
    case 'bug':
      return <BugIcon color="error" />;
    case 'architecture':
      return <ArchitectureIcon color="primary" />;
    case 'code quality':
      return <CodeIcon color="secondary" />;
    default:
      return <LightbulbIcon color="primary" />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'error';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'primary';
  }
};

const AIRecommendations = ({ recommendations }) => {
  const [expanded, setExpanded] = useState(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Handle string or array recommendations
  const parsedRecommendations = React.useMemo(() => {
    if (typeof recommendations === 'string') {
      return [{ description: recommendations, category: 'general', severity: 'medium' }];
    }
    
    if (Array.isArray(recommendations)) {
      return recommendations;
    }
    
    return [];
  }, [recommendations]);
  
  if (!recommendations) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No AI recommendations available.
        </Typography>
      </Paper>
    );
  }
  
  const handleToggle = (id) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };
  
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
  
  const handleFeedback = (id, positive) => {
    setFeedbackGiven({
      ...feedbackGiven,
      [id]: positive ? 'positive' : 'negative'
    });
    
    // In a real application, you would send this feedback to your backend
    console.log(`User gave ${positive ? 'positive' : 'negative'} feedback for recommendation ${id}`);
  };
  
  // Get unique categories for filter
  const categories = ['all', ...new Set(parsedRecommendations.map(rec => rec.category?.toLowerCase() || 'general'))];
  
  // Filter recommendations
  const filteredRecommendations = parsedRecommendations.filter(rec => 
    filter === 'all' || rec.category?.toLowerCase() === filter
  );

  return (
    <Paper sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LightbulbIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            AI Recommendations
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          CodePhoenix AI has analyzed your code and provided the following recommendations to improve quality and security.
        </Typography>
      </Box>
      
      <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {categories.map(category => (
          <Chip
            key={category}
            label={category}
            onClick={() => setFilter(category)}
            color={filter === category ? 'primary' : 'default'}
            variant={filter === category ? 'filled' : 'outlined'}
            icon={filter === category ? getCategoryIcon(category) : undefined}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Box>
      
      <Divider />
      
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredRecommendations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No recommendations match your filter.
            </Typography>
          </Box>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <Accordion 
              key={recommendation.id || index}
              expanded={expanded.has(recommendation.id || index)}
              onChange={() => handleToggle(recommendation.id || index)}
              sx={{
                '&:before': { display: 'none' },
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderLeft: '4px solid',
                  borderLeftColor: `${getSeverityColor(recommendation.severity)}.main`,
                  '&.Mui-expanded': {
                    minHeight: 48,
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getCategoryIcon(recommendation.category)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {recommendation.title || 'Improvement Recommendation'}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {recommendation.category && (
                          <Chip 
                            label={recommendation.category} 
                            size="small" 
                            sx={{ textTransform: 'capitalize' }}
                          />
                        )}
                        {recommendation.severity && (
                          <Chip 
                            label={recommendation.severity} 
                            size="small"
                            color={getSeverityColor(recommendation.severity)}
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        )}
                      </Box>
                    }
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" gutterBottom>
                  {recommendation.description}
                </Typography>
                
                {recommendation.code_sample && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Example Code:
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'grey.900',
                        color: 'grey.100',
                        fontFamily: 'monospace',
                        position: 'relative',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(recommendation.id || index, recommendation.code_sample)}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          color: 'grey.300',
                          bgcolor: 'rgba(0,0,0,0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.4)',
                          }
                        }}
                      >
                        {copied === (recommendation.id || index) ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                      </IconButton>
                      <pre style={{ margin: 0 }}>
                        {recommendation.code_sample}
                      </pre>
                    </Paper>
                  </Box>
                )}
                
                {recommendation.impact && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Impact:
                    </Typography>
                    <Typography variant="body2">
                      {recommendation.impact}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Was this recommendation helpful?
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 0.5 }}>
                      <Button
                        size="small"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleFeedback(recommendation.id || index, true)}
                        color="primary"
                        variant={feedbackGiven[recommendation.id || index] === 'positive' ? 'contained' : 'outlined'}
                        sx={{ mr: 1 }}
                        disabled={feedbackGiven[recommendation.id || index] === 'negative'}
                      >
                        Yes
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleFeedback(recommendation.id || index, false)}
                        color="error"
                        variant={feedbackGiven[recommendation.id || index] === 'negative' ? 'contained' : 'outlined'}
                        disabled={feedbackGiven[recommendation.id || index] === 'positive'}
                      >
                        No
                      </Button>
                    </Box>
                  </Box>
                  
                  {recommendation.file && recommendation.line && (
                    <Chip 
                      label={`${recommendation.file}:${recommendation.line}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default AIRecommendations;