// src/components/refactoring/CodeDiffViewer.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider
} from '@mui/material';
import { ReactCompareSlider, ReactCompareSliderHandle } from 'react-compare-slider';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

/**
 * Component to display before/after code diff for refactoring
 * 
 * @param {Object} props - Component props
 * @param {Object} props.diffData - Object containing old_code and new_code
 * @param {Object} props.refactoring - Refactoring metadata
 * @returns {JSX.Element} - CodeDiffViewer component
 */
const CodeDiffViewer = ({ diffData, refactoring }) => {
  if (!diffData) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No diff data available
        </Typography>
      </Box>
    );
  }
  
  const { old_code, new_code } = diffData;
  
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
  
  const language = getLanguage(refactoring?.file);
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          {refactoring?.type?.replace(/_/g, ' ')} in {refactoring?.file}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {refactoring?.description}
        </Typography>
      </Box>
      
      <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 1, bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">Before / After Comparison</Typography>
        </Box>
        <Divider />
        
        <Box sx={{ height: 400, position: 'relative' }}>
          <ReactCompareSlider
            itemOne={
              <Box sx={{ height: '100%', overflow: 'auto', p: 1, bgcolor: '#282c34' }}>
                <SyntaxHighlighter 
                  language={language} 
                  style={atomOneDark}
                  showLineNumbers
                  wrapLines
                  customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
                >
                  {old_code}
                </SyntaxHighlighter>
              </Box>
            }
            itemTwo={
              <Box sx={{ height: '100%', overflow: 'auto', p: 1, bgcolor: '#282c34' }}>
                <SyntaxHighlighter 
                  language={language} 
                  style={atomOneDark}
                  showLineNumbers
                  wrapLines
                  customStyle={{ background: 'transparent', margin: 0, padding: 0 }}
                >
                  {new_code}
                </SyntaxHighlighter>
              </Box>
            }
            handle={
              <ReactCompareSliderHandle
                buttonStyle={{
                  backdropFilter: 'none',
                  background: 'white',
                  color: '#333',
                  border: 0
                }}
              />
            }
            position={50}
            style={{ height: '100%' }}
          />
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2">
            Quality Improvement: <span style={{ textTransform: 'capitalize' }}>{refactoring?.quality_improvement || 'medium'}</span>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CodeDiffViewer;