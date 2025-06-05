// src/components/security/SecurityScoreGauge.jsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * Component that displays a gauge with the security score
 * @param {Object} props - Component props
 * @param {number} props.score - Security score between 0 and 100
 * @param {number} props.size - Size of the gauge in pixels (default: 200)
 * @param {boolean} props.showLabel - Whether to show the label (default: true)
 * @returns {JSX.Element} - Security score gauge
 */
const SecurityScoreGauge = ({ score = 0, size = 200, showLabel = true }) => {
  const theme = useTheme();
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Calculate colors based on score
  const getScoreColor = (score) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    if (score >= 30) return theme.palette.warning.dark;
    return theme.palette.error.main;
  };
  
  const getScoreText = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  };
  
  // Calculate the circumference of the circle
  const radius = (size / 2) - 10;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the arc length based on the score
  const arcLength = (normalizedScore / 100) * circumference;
  const arcOffset = circumference - arcLength;
  
  // Calculate gradient angles based on score
  const gradientAngle = (normalizedScore / 100) * 180;
  
  return (
    <Box sx={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      {/* Background circle */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.palette.grey[200]}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Progress arc with gradient */}
        <defs>
          <linearGradient id="securityScoreGradient" gradientTransform={`rotate(${gradientAngle})`}>
            <stop offset="0%" stopColor={getScoreColor(normalizedScore)} />
            <stop offset="100%" stopColor={getScoreColor(Math.max(0, normalizedScore - 30))} />
          </linearGradient>
        </defs>
        
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#securityScoreGradient)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={arcOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Marker at the end of the arc */}
        <circle
          cx={(size/2) + radius * Math.cos(2 * Math.PI * (normalizedScore/100 - 0.25))}
          cy={(size/2) + radius * Math.sin(2 * Math.PI * (normalizedScore/100 - 0.25))}
          r={5}
          fill={getScoreColor(normalizedScore)}
        />
        
        {/* Shield icon in the center */}
        <path
          d={`M${size/2 - 20},${size/2 - 15} L${size/2 + 20},${size/2 - 15} L${size/2 + 20},${size/2 + 5} L${size/2},${size/2 + 25} L${size/2 - 20},${size/2 + 5} Z`}
          fill={theme.palette.background.paper}
          stroke={getScoreColor(normalizedScore)}
          strokeWidth={1}
          opacity={0.2}
        />
      </svg>
      
      {/* Center text */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h3" 
          component="div" 
          align="center"
          sx={{ 
            fontWeight: 'bold',
            color: getScoreColor(normalizedScore)
          }}
        >
          {Math.round(normalizedScore)}
        </Typography>
        
        {showLabel && (
          <Typography 
            variant="subtitle1" 
            component="div" 
            align="center"
            sx={{ 
              color: getScoreColor(normalizedScore),
              mt: -0.5
            }}
          >
            {getScoreText(normalizedScore)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SecurityScoreGauge;