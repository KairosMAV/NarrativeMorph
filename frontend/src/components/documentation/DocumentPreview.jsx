// src/components/documentation/DocumentPreview.jsx
import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Divider
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Component to preview documentation content
 * 
 * @param {Object} props - Component props
 * @param {Array} props.sections - Array of documentation sections
 * @param {string} props.format - Format of the documentation (markdown, html, etc.)
 * @returns {JSX.Element} - DocumentPreview component
 */
const DocumentPreview = ({ sections, format = 'markdown' }) => {
  const [activeSection, setActiveSection] = useState(0);
  
  if (!sections || sections.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No documentation content available
        </Typography>
      </Box>
    );
  }
  
  const handleTabChange = (event, newValue) => {
    setActiveSection(newValue);
  };
  
  const renderContent = (content) => {
    switch (format) {
      case 'markdown':
        return (
          <Box sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </Box>
        );
      case 'html':
        return (
          <Box sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {content}
            </Typography>
          </Box>
        );
    }
  };
  
  return (
    <Paper variant="outlined">
      <Tabs
        value={activeSection}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
      >
        {sections.map((section, index) => (
          <Tab key={index} label={section.title} />
        ))}
      </Tabs>
      
      <Divider />
      
      {renderContent(sections[activeSection].content)}
    </Paper>
  );
};

export default DocumentPreview;