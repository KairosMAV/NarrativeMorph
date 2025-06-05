import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  BugReport as BugIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  SearchOutlined as SearchIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const getIssueIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'bug':
      return <BugIcon color="error" />;
    case 'security':
    case 'vulnerability':
      return <SecurityIcon color="warning" />;
    case 'performance':
      return <SpeedIcon color="info" />;
    case 'code_smell':
    case 'refactoring':
      return <CodeIcon color="action" />;
    default:
      return <CodeIcon color="action" />;
  }
};

const getSeverityIcon = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return <ErrorIcon color="error" fontSize="small" />;
    case 'medium':
      return <WarningIcon color="warning" fontSize="small" />;
    case 'low':
      return <InfoIcon color="info" fontSize="small" />;
    default:
      return <InfoIcon color="info" fontSize="small" />;
  }
};

const IssueList = ({ issues = [], onIssueSelect, selectedIssue = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  if (!issues || issues.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No issues found!
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Great job! Your code seems to be in good shape.
        </Typography>
      </Paper>
    );
  }
  
  // Get unique issue types for filter
  const issueTypes = ['all', ...new Set(issues.map(issue => issue.type?.toLowerCase() || 'unknown'))];
  
  // Get unique severity levels for filter
  const severityLevels = ['all', ...new Set(issues.map(issue => issue.severity?.toLowerCase() || 'unknown'))];
  
  // Filter issues based on search term and filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = !searchTerm || 
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.file?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || issue.type?.toLowerCase() === typeFilter;
    
    const matchesSeverity = severityFilter === 'all' || issue.severity?.toLowerCase() === severityFilter;
    
    return matchesSearch && matchesType && matchesSeverity;
  });
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Issues ({filteredIssues.length} of {issues.length})
        </Typography>
        
        <TextField
          placeholder="Search issues..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {issueTypes.map(type => (
                <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                  {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              {severityLevels.map(level => (
                <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                  {level === 'all' ? 'All Severities' : level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List disablePadding>
          {filteredIssues.map((issue, index) => (
            <React.Fragment key={issue.id || index}>
              <ListItemButton
                selected={selectedIssue && selectedIssue.id === issue.id}
                onClick={() => onIssueSelect && onIssueSelect(issue)}
              >
                <ListItemIcon>
                  {getIssueIcon(issue.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                        {issue.message || issue.description?.substring(0, 50) || 'Issue detected'}
                      </Typography>
                      <Chip
                        icon={getSeverityIcon(issue.severity)}
                        label={issue.severity || 'unknown'}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, textTransform: 'capitalize' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary" noWrap>
                      {issue.file} {issue.line ? `(line ${issue.line})` : ''}
                    </Typography>
                  }
                />
              </ListItemButton>
              {index < filteredIssues.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default IssueList;