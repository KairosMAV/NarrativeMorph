// src/components/refactoring/RefactoringList.jsx
import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Box,
  Paper
} from '@mui/material';
import {
  Code as CodeIcon,
  AutoFixHigh as ExtractMethodIcon,
  TextFields as RenameIcon,
  ContentCopy as DuplicationIcon,
  Architecture as DesignPatternIcon,
  HdrAuto as RefactorIcon
} from '@mui/icons-material';

/**
 * Component to display a list of applied refactorings
 * 
 * @param {Object} props - Component props
 * @param {Array} props.refactorings - Array of refactoring objects
 * @param {Function} props.onSelectRefactoring - Function to call when a refactoring is selected
 * @param {string} props.selectedRefactoringId - ID of the currently selected refactoring
 * @returns {JSX.Element} - RefactoringList component
 */
const RefactoringList = ({ refactorings, onSelectRefactoring, selectedRefactoringId }) => {
  if (!refactorings || refactorings.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No refactorings applied
        </Typography>
      </Box>
    );
  }
  
  const getRefactoringIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'extract_method':
        return <ExtractMethodIcon color="primary" />;
      case 'rename_variable':
      case 'rename_method':
      case 'rename_class':
        return <RenameIcon color="secondary" />;
      case 'remove_duplication':
        return <DuplicationIcon color="error" />;
      case 'apply_design_pattern':
        return <DesignPatternIcon color="info" />;
      default:
        return <RefactorIcon color="primary" />;
    }
  };
  
  const getQualityImprovementColor = (improvement) => {
    switch (improvement?.toLowerCase()) {
      case 'high':
        return 'success';
      case 'medium':
        return 'primary';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };
  
  return (
    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
      <List disablePadding>
        {refactorings.map((refactoring, index) => (
          <React.Fragment key={refactoring.id}>
            <ListItemButton 
              selected={selectedRefactoringId === refactoring.id}
              onClick={() => onSelectRefactoring(refactoring)}
            >
              <ListItemIcon>
                {getRefactoringIcon(refactoring.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" noWrap>
                    {refactoring.type.replace(/_/g, ' ')}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {refactoring.file}
                      {refactoring.location && ` (Lines ${refactoring.location.start_line}-${refactoring.location.end_line})`}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap sx={{ mt: 0.5 }}>
                      {refactoring.description}
                    </Typography>
                  </Box>
                }
              />
              <Chip 
                label={refactoring.quality_improvement || 'medium'} 
                size="small"
                color={getQualityImprovementColor(refactoring.quality_improvement)}
                sx={{ ml: 1, textTransform: 'capitalize' }}
              />
            </ListItemButton>
            {index < refactorings.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RefactoringList;