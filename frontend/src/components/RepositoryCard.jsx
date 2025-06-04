import React from 'react';
import { 
  Box, Card, CardContent, Typography, Chip, IconButton, 
  Button, Divider 
} from '@mui/material';
import { 
  GitHub as GitHubIcon, 
  OpenInNew as OpenInNewIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const RepositoryCard = ({ repository }) => {
  const isGitHub = repository.url?.includes('github.com');
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {isGitHub ? <GitHubIcon sx={{ mr: 1 }} /> : <AnalyticsIcon sx={{ mr: 1 }} />}
            <Typography variant="h6">
              {repository.name || repository.url?.split('/').pop() || 'Unknown Repository'}
            </Typography>
          </Box>
          <IconButton 
            component="a" 
            href={repository.url} 
            target="_blank" 
            rel="noopener noreferrer"
            size="small"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {repository.description || 'No description provided.'}
        </Typography>
        
        <Box mt={2} display="flex" alignItems="center">
          <Chip 
            label={repository.branch || 'main'} 
            size="small" 
            sx={{ mr: 1 }}
            variant="outlined"
          />
          
          {repository.last_analysis && (
            <Typography variant="caption" color="textSecondary">
              Last analyzed: {formatDistance(new Date(repository.last_analysis), new Date(), { addSuffix: true })}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between">
          <Button 
            component={Link} 
            to={`/repositories/${repository.id || repository._id}`}
            size="small"
            variant="outlined"
          >
            Details
          </Button>
          
          <Button 
            component={Link}
            to={`/analysis/new?repository=${repository.id || repository._id}`}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AnalyticsIcon />}
          >
            Analyze
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RepositoryCard;