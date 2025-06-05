import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Chip,
  Divider
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.css';

const getLanguageFromFilename = (filename) => {
  if (!filename) return 'javascript';
  
  const extension = filename.split('.').pop().toLowerCase();
  
  const extensionMap = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'java': 'java',
    'cs': 'csharp',
    'go': 'go',
    'json': 'json',
    'css': 'css',
    'scss': 'scss',
    'html': 'markup',
    'xml': 'markup',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'bash',
    'bash': 'bash'
  };
  
  return extensionMap[extension] || 'javascript';
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'high':
      return <ErrorIcon color="error" />;
    case 'medium':
      return <WarningIcon color="warning" />;
    case 'low':
      return <InfoIcon color="info" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
};

const CodeSnippetViewer = ({ issue }) => {
  const [copied, setCopied] = useState(false);
  
  React.useEffect(() => {
    // Highlight code when the component mounts or issue changes
    Prism.highlightAll();
  }, [issue]);
  
  if (!issue) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">
          Select an issue to view code
        </Typography>
      </Paper>
    );
  }
  
  const language = getLanguageFromFilename(issue.file);
  const lineNumber = issue.line || 1;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(issue.code_snippet || '');
    setCopied(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <Paper sx={{ p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.100' }}>
        <Box display="flex" alignItems="center">
          {getSeverityIcon(issue.severity)}
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {issue.issue_type || 'Code Issue'}
          </Typography>
          <Chip 
            label={issue.severity || 'info'} 
            size="small" 
            color={getSeverityColor(issue.severity)}
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Tooltip title={copied ? "Copied!" : "Copy code"}>
          <IconButton onClick={handleCopy} size="small">
            {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, backgroundColor: 'grey.900', overflow: 'auto', flex: 1 }}>
        <Typography variant="caption" color="grey.400" display="block" gutterBottom>
          {issue.file} (line {lineNumber})
        </Typography>
        
        <Box sx={{ position: 'relative' }}>
          <pre className="line-numbers" data-line={lineNumber}>
            <code className={`language-${language}`}>
              {issue.code_snippet || 'No code snippet available'}
            </code>
          </pre>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Description
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {issue.description || 'No description available for this issue.'}
        </Typography>
        
        {issue.recommendation && (
          <React.Fragment>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Recommendation
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {issue.recommendation}
            </Typography>
          </React.Fragment>
        )}
      </Box>
    </Paper>
  );
};

export default CodeSnippetViewer;