// src/components/documentation/DiagramPreview.jsx
import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import {
  Architecture as ArchitectureIcon,
  AccountTree as TreeIcon,
  Timeline as TimelineIcon,
  Schema as SchemaIcon
} from '@mui/icons-material';
import Mermaid from 'react-mermaid2';

/**
 * Component to preview generated diagrams
 * 
 * @param {Object} props - Component props
 * @param {Array} props.diagrams - Array of diagram objects
 * @returns {JSX.Element} - DiagramPreview component
 */
const DiagramPreview = ({ diagrams }) => {
  const [activeDiagram, setActiveDiagram] = useState(0);
  
  if (!diagrams || diagrams.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No diagrams available
        </Typography>
      </Box>
    );
  }
  
  const handleTabChange = (event, newValue) => {
    setActiveDiagram(newValue);
  };
  
  const getDiagramIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'architecture':
        return <ArchitectureIcon />;
      case 'uml':
        return <SchemaIcon />;
      case 'flowchart':
        return <TreeIcon />;
      case 'sequence':
        return <TimelineIcon />;
      default:
        return <SchemaIcon />;
    }
  };
  
  return (
    <Paper variant="outlined">
      <Tabs
        value={activeDiagram}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
      >
        {diagrams.map((diagram, index) => (
          <Tab 
            key={index} 
            label={diagram.title} 
            icon={getDiagramIcon(diagram.type)} 
            iconPosition="start"
          />
        ))}
      </Tabs>
      
      <Divider />
      
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {diagrams[activeDiagram].title}
          </Typography>
          <Chip 
            label={diagrams[activeDiagram].type} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        
        <Box sx={{ 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper' 
        }}>
          {/* Use Mermaid to render diagrams */}
          <Mermaid
            chart={diagrams[activeDiagram].content}
            config={{
              theme: 'neutral',
              securityLevel: 'loose'
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default DiagramPreview;