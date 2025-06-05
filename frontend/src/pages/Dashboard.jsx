import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Button, Box, Divider, 
  CircularProgress, IconButton
} from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import RepositoryCard from '../components/RepositoryCard';
import AnalysisTable from '../components/AnalysisTable';
import MetricsOverview from '../components/MetricsOverview';
import { fetchRepositories, fetchRecentAnalyses } from '../services/apiService';

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRepositories: 0,
    totalAnalyses: 0,
    issuesFound: 0,
    averageQualityScore: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [reposData, analysesData] = await Promise.all([
        fetchRepositories(),
        fetchRecentAnalyses()
      ]);
      
      setRepositories(reposData);
      setRecentAnalyses(analysesData);
      
      // Calculate summary metrics
      const totalIssues = analysesData.reduce((sum, analysis) => 
        sum + (analysis.result?.issues?.length || 0), 0);
        
      const avgScore = analysesData.length > 0 
        ? analysesData.reduce((sum, analysis) => 
            sum + (analysis.result?.quality_score || 0), 0) / analysesData.length 
        : 0;
        
      setMetrics({
        totalRepositories: reposData.length,
        totalAnalyses: analysesData.length,
        issuesFound: totalIssues,
        averageQualityScore: avgScore
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleRefresh = () => {
    loadData();
  };

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Dashboard</Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            to="/repositories/new"
            sx={{ mr: 2 }}
          >
            Add Repository
          </Button>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <MetricsOverview metrics={metrics} />
          
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Monitored Repositories
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {repositories.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                    No repositories configured yet. Add your first repository to get started.
                  </Typography>
                ) : (
                  repositories.map(repo => (
                    <RepositoryCard key={repo.id} repository={repo} />
                  ))
                )}
                
                <Button 
                  fullWidth 
                  variant="outlined" 
                  component={Link} 
                  to="/repositories"
                  sx={{ mt: 2 }}
                >
                  View All Repositories
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Analyses
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <AnalysisTable analyses={recentAnalyses} />
                
                <Button 
                  fullWidth 
                  variant="outlined" 
                  component={Link} 
                  to="/analyses"
                  sx={{ mt: 2 }}
                >
                  View All Analyses
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Dashboard;