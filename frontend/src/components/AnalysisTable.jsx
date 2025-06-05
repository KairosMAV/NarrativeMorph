import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, IconButton, Typography, Box
} from '@mui/material';
import { 
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon color="success" />;
    case 'failed':
      return <ErrorIcon color="error" />;
    case 'in_progress':
      return <PendingIcon color="primary" />;
    default:
      return <PendingIcon color="action" />;
  }
};

const getQualityScoreColor = (score) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#8bc34a';
  if (score >= 40) return '#ffeb3b';
  if (score >= 20) return '#ff9800';
  return '#f44336';
};

const AnalysisTable = ({ analyses = [] }) => {
  if (analyses.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography variant="body2" color="textSecondary">
          No analyses found. Start by analyzing a repository.
        </Typography>
      </Box>
    );
  }
  
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Repository</TableCell>
            <TableCell>Branch</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Quality Score</TableCell>
            <TableCell>Issues</TableCell>
            <TableCell>Time</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {analyses.map((analysis) => (
            <TableRow key={analysis.id || analysis._id}>
              <TableCell>
                {analysis.repo_url?.split('/').pop() || 'Unknown'}
              </TableCell>
              <TableCell>{analysis.branch || 'main'}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getStatusIcon(analysis.status)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {analysis.status}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {analysis.result?.quality_score ? (
                  <Chip 
                    label={`${analysis.result.quality_score}/100`} 
                    sx={{ 
                      bgcolor: getQualityScoreColor(analysis.result.quality_score),
                      color: 'white'
                    }}
                    size="small"
                  />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {analysis.result?.issues ? (
                  <Typography variant="body2">
                    {analysis.result.issues.length}
                  </Typography>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {analysis.created_at ? (
                  <Typography variant="body2">
                    {formatDistance(new Date(analysis.created_at), new Date(), { addSuffix: true })}
                  </Typography>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton 
                  component={Link} 
                  to={`/analysis/${analysis.id || analysis._id}`}
                  size="small"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AnalysisTable;