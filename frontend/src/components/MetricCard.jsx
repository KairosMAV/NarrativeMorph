import React from 'react';
import { 
  Box, Card, CardContent, Typography, 
  CardHeader, Avatar, IconButton 
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  TrendingFlat as TrendingFlatIcon 
} from '@mui/icons-material';

const MetricCard = ({ title, value, icon, color, trend }) => {
  // Determina l'icona di trend in base al valore
  const renderTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return (
        <Box display="flex" alignItems="center" color="success.main">
          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" component="span">
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </Typography>
        </Box>
      );
    } else if (trend < 0) {
      return (
        <Box display="flex" alignItems="center" color="error.main">
          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" component="span">
            {trend.toFixed(1)}%
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box display="flex" alignItems="center" color="text.secondary">
          <TrendingFlatIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2" component="span">
            0%
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: `${color}.light`, 
                color: `${color}.main`,
                width: 40,
                height: 40,
                mr: 1
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          {renderTrendIcon()}
        </Box>
        <Typography variant="h4" component="div" align="center" py={1}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;