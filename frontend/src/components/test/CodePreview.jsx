// src/components/test/CodePreview.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  CheckCircleOutline as PassedIcon,
  CancelOutlined as FailedIcon
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

/**
 * Component to display code of a generated test
 * 
 * @param {Object} props - Component props
 * @param {Object} props.test - Test object containing code and metadata
 * @returns {JSX.Element} - CodePreview component
 */
const CodePreview = ({ test }) => {
  const [copied, setCopied] = React.useState(false);
  
  if (!test || !test.code) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No test code available
        </Typography>
      </Box>
    );
  }
  
  // Determine language from file extension
  const getLanguage = (filename) => {
    if (!filename) return 'javascript';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    const extensionMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'c'
    };
    
    return extensionMap[extension] || 'javascript';
  };
  
  const language = getLanguage(test.file);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(test.code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 1, bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            {test.name}
          </Typography>
          <Chip 
            icon={test.status === 'passed' ? <PassedIcon /> : <FailedIcon />}
            label={test.status}
            size="small"
            color={test.status === 'passed' ? 'success' : 'error'}
            sx={{ textTransform: 'capitalize', ml: 1 }}
          />
        </Box>
        <Tooltip title={copied ? "Copied!" : "Copy code"}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider />
      
      <Box sx={{ height: 500, overflow: 'auto', p: 1, bgcolor: '#282c34' }}>
        <SyntaxHighlighter 
          language={language} 
          style={atomOneDark}
          showLineNumbers
          wrapLines
          customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
        >
          {test.code}
        </SyntaxHighlighter>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          {test.file}
        </Typography>
        <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
          +{test.coverage_contribution}% coverage contribution
        </Typography>
      </Box>
    </Paper>
  );
};

export default CodePreview;