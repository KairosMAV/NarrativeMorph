import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Tabs, Tab, Grid, Chip,
  CircularProgress, Divider, Button, Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BugReport as BugIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { fetchAnalysisById } from '../services/apiService';
import IssueList from '../components/IssueList';
import CodeSnippetViewer from '../components/CodeSnippetViewer';
import AnalysisSummary from '../components/AnalysisSummary';
import QualityScoreGauge from '../components/QualityScoreGauge';
import AIRecommendations from '../components/AIRecommendations';

const AnalysisDetail = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalysisById(id);
        setAnalysis(data);
      } catch (error) {
        console.error('Error loading analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalysis();
  }, [id]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!analysis) {
    return (
      <Container>
        <Typography variant="h5" color="error">Analysis not found</Typography>
        <Button component={Link} to="/analyses" startIcon={<ArrowBackIcon />}>
          Back to Analyses
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/analyses">Analyses</Link>
        <Typography color="textPrimary">Analysis Details</Typography>
      </Breadcrumbs>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analysis: {analysis.repo_url?.split('/').pop() || 'Unknown Repository'}
        </Typography>
        <Button 
          variant="outlined"
          component={Link}
          to="/analyses"
          startIcon={<ArrowBackIcon />}
        >
          Back to Analyses
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <AnalysisSummary analysis={analysis} />
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quality Score</Typography>
            <Box display="flex" justifyContent="center" p={2}>
              <QualityScoreGauge score={analysis.result?.quality_score || 0} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="analysis tabs">
              <Tab label="Issues" icon={<BugIcon />} iconPosition="start" />
              <Tab label="Performance" icon={<SpeedIcon />} iconPosition="start" />
              <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="AI Recommendations" icon={<CodeIcon />} iconPosition="start" />
            </Tabs>
            
            <Box p={2} mt={2}>
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={selectedIssue ? 6 : 12}>
                    <IssueList 
                      issues={analysis.result?.issues || []} 
                      onIssueSelect={handleIssueSelect}
                      selectedIssue={selectedIssue}
                    />
                  </Grid>
                  
                  {selectedIssue && (
                    <Grid item xs={12} md={6}>
                      <CodeSnippetViewer issue={selectedIssue} />
                    </Grid>
                  )}
                </Grid>
              )}
              
              {activeTab === 1 && (
                <IssueList issues={analysis.result?.performance_issues || []} />
              )}
              
              {activeTab === 2 && (
                <Typography variant="body1">
                  Security analysis data would be displayed here.
                </Typography>
              )}
              
              {activeTab === 3 && (
                <AIRecommendations recommendations={analysis.result?.ai_recommendations || "No AI recommendations available for this analysis."} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalysisDetail;