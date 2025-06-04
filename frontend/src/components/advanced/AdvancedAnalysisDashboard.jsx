import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, CardHeader, Grid, Typography, Tabs, Tab,
  Paper, CircularProgress, Divider, Button, Menu, MenuItem,
  FormControl, InputLabel, Select, Chip
} from '@mui/material';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
  ResponsiveContainer, ScatterChart, Scatter, Treemap, Area, AreaChart
} from 'recharts';
import {
  BugReport as BugIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  Construction as ToolsIcon
} from '@mui/icons-material';

import { getDetailedAnalysis, getHistoricalTrends, getBenchmarkData } from '../../services/analysisService';
import IssueList from '../IssueList';
import CodeSnippetViewer from '../CodeSnippetViewer';
import MetricCard from '../MetricCard';
import TrendLineChart from '../charts/TrendLineChart';
import QualityRadarChart from '../charts/QualityRadarChart';
import DependencyGraph from '../charts/DependencyGraph';
import CodeHeatmap from '../charts/CodeHeatmap';
import PredictiveTrendChart from '../charts/PredictiveTrendChart';

const AdvancedAnalysisDashboard = ({ analysisId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [metricTimeframe, setMetricTimeframe] = useState('1M'); // 1M, 3M, 6M, 1Y
  const [selectedDimension, setSelectedDimension] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [codeView, setCodeView] = useState('heatmap'); // heatmap, dependency, source
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analysisData, trendsData, benchmarkResults] = await Promise.all([
          getDetailedAnalysis(analysisId),
          getHistoricalTrends(analysisId, metricTimeframe),
          getBenchmarkData(analysisId)
        ]);
        
        setAnalysis(analysisData);
        setHistoricalData(trendsData);
        setBenchmarkData(benchmarkResults);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [analysisId, metricTimeframe]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
  };
  
  const handleTimeframeChange = (event) => {
    setMetricTimeframe(event.target.value);
  };
  
  const handleDimensionChange = (event) => {
    setSelectedDimension(event.target.value);
  };
  
  const handleCodeViewChange = (view) => {
    setCodeView(view);
  };
  
  const dimensionScores = useMemo(() => {
    if (!analysis || !analysis.dimension_scores) return [];
    
    return Object.entries(analysis.dimension_scores).map(([key, value]) => ({
      dimension: key,
      score: value,
      fullMark: 100
    }));
  }, [analysis]);
  
  const filteredIssues = useMemo(() => {
    if (!analysis || !analysis.result || !analysis.result.issues) return [];
    
    if (selectedDimension === 'all') {
      return analysis.result.issues;
    }
    
    const dimensionToTypeMap = {
      reliability: ['bug'],
      security: ['security'],
      maintainability: ['code_smell'],
      performance: ['performance']
    };
    
    const issueTypes = dimensionToTypeMap[selectedDimension] || [];
    return analysis.result.issues.filter(issue => issueTypes.includes(issue.type));
  }, [analysis, selectedDimension]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!analysis) {
    return (
      <Box p={3}>
        <Typography variant="h5" color="error">Analysis not found</Typography>
      </Box>
    );
  }
  
  return (
    <Box p={2}>
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={`Advanced Analysis: ${analysis.repository_url.split('/').pop()}`}
          subheader={`Branch: ${analysis.branch} | Analyzed: ${new Date(analysis.created_at).toLocaleString()}`}
        />
        <CardContent>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Box height={300}>
                <Typography variant="h6" gutterBottom align="center">Quality Dimensions</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <QualityRadarChart data={dimensionScores} />
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box height={300}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">Quality Trends</Typography>
                  <FormControl size="small" sx={{ width: 100 }}>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={metricTimeframe}
                      label="Timeframe"
                      onChange={handleTimeframeChange}
                    >
                      <MenuItem value="1M">1 Month</MenuItem>
                      <MenuItem value="3M">3 Months</MenuItem>
                      <MenuItem value="6M">6 Months</MenuItem>
                      <MenuItem value="1Y">1 Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <ResponsiveContainer width="100%" height="90%">
                  <TrendLineChart data={historicalData} />
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
          
          <Grid container spacing={2} mb={4}>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Quality Score"
                value={`${analysis.result.quality_score}/100`}
                icon={<CodeIcon color="primary" />}
                color="primary"
                trend={+2.5}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Issues"
                value={analysis.result.issues.length}
                icon={<BugIcon color="error" />}
                color="error"
                trend={-5.3}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Security Score"
                value={`${analysis.dimension_scores.security.toFixed(1)}/100`}
                icon={<SecurityIcon color="warning" />}
                color="warning"
                trend={+1.7}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <MetricCard
                title="Performance"
                value={`${analysis.dimension_scores.performance.toFixed(1)}/100`}
                icon={<SpeedIcon color="success" />}
                color="success"
                trend={-0.8}
              />
            </Grid>
          </Grid>

          <Box mb={2}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="analysis tabs">
              <Tab label="Issues" icon={<BugIcon />} iconPosition="start" />
              <Tab label="Code Analysis" icon={<CodeIcon />} iconPosition="start" />
              <Tab label="Trends" icon={<TimelineIcon />} iconPosition="start" />
              <Tab label="Benchmark" icon={<CompareIcon />} iconPosition="start" />
              <Tab label="AI Recommendations" icon={<ToolsIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box p={2} bgcolor="background.paper" borderRadius={1}>
            {activeTab === 0 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Issues ({filteredIssues.length})</Typography>
                  <FormControl size="small" sx={{ width: 200 }}>
                    <InputLabel>Filter by dimension</InputLabel>
                    <Select
                      value={selectedDimension}
                      label="Filter by dimension"
                      onChange={handleDimensionChange}
                    >
                      <MenuItem value="all">All issues</MenuItem>
                      <MenuItem value="reliability">Reliability</MenuItem>
                      <MenuItem value="security">Security</MenuItem>
                      <MenuItem value="maintainability">Maintainability</MenuItem>
                      <MenuItem value="performance">Performance</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={selectedIssue ? 6 : 12}>
                    <IssueList
                      issues={filteredIssues}
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
              </>
            )}

            {activeTab === 1 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Code Analysis</Typography>
                  <Box>
                    <Button 
                      variant={codeView === 'heatmap' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => handleCodeViewChange('heatmap')}
                      sx={{ mr: 1 }}
                    >
                      Heatmap
                    </Button>
                    <Button 
                      variant={codeView === 'dependency' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => handleCodeViewChange('dependency')}
                      sx={{ mr: 1 }}
                    >
                      Dependencies
                    </Button>
                    <Button 
                      variant={codeView === 'source' ? 'contained' : 'outlined'} 
                      size="small"
                      onClick={() => handleCodeViewChange('source')}
                    >
                      Source Code
                    </Button>
                  </Box>
                </Box>
                
                <Box height={500}>
                  {codeView === 'heatmap' && (
                    <CodeHeatmap analysisData={analysis} />
                  )}
                  {codeView === 'dependency' && (
                    <DependencyGraph analysisData={analysis} />
                  )}
                  {codeView === 'source' && (
                    <Typography>Source code viewer would be here</Typography>
                  )}
                </Box>
              </>
            )}

            {activeTab === 2 && (
              <>
                <Typography variant="h6" gutterBottom>Trends and Prediction</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 350 }}>
                      <Typography variant="subtitle1" gutterBottom>Historical Quality Trends</Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="reliability" stroke="#8884d8" />
                          <Line type="monotone" dataKey="security" stroke="#82ca9d" />
                          <Line type="monotone" dataKey="maintainability" stroke="#ffc658" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 350 }}>
                      <Typography variant="subtitle1" gutterBottom>Predictive Analysis</Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <PredictiveTrendChart data={analysis.future_predictions || {}} />
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Issue Evolution</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="bugs" stackId="1" stroke="#ff8a80" fill="#ff8a80" />
                          <Area type="monotone" dataKey="vulnerabilities" stackId="1" stroke="#ffb74d" fill="#ffb74d" />
                          <Area type="monotone" dataKey="code_smells" stackId="1" stroke="#81d4fa" fill="#81d4fa" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}

            {activeTab === 3 && (
              <>
                <Typography variant="h6" gutterBottom>Benchmark Comparison</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Peer Comparison</Typography>
                      <Box height={350}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Your Project', reliability: analysis.dimension_scores.reliability, security: analysis.dimension_scores.security, maintainability: analysis.dimension_scores.maintainability },
                              { name: 'Industry Avg', reliability: 75, security: 72, maintainability: 68 },
                              { name: 'Top 10%', reliability: 92, security: 90, maintainability: 88 }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="reliability" fill="#8884d8" />
                            <Bar dataKey="security" fill="#82ca9d" />
                            <Bar dataKey="maintainability" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Quality Rating</Typography>
                      <Box p={2}>
                        {benchmarkData && Object.entries(benchmarkData.dimensions).map(([dimension, data]) => (
                          <Box key={dimension} mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ textTransform: 'capitalize', width: 120 }}>
                                {dimension}:
                              </Typography>
                              <Box flex={1} mx={2}>
                                <Box 
                                  sx={{ 
                                    height: 8, 
                                    bgcolor: '#e0e0e0', 
                                    borderRadius: 4,
                                    position: 'relative'
                                  }}
                                >
                                  <Box 
                                    sx={{
                                      position: 'absolute',
                                      left: `${data.percentile}%`,
                                      top: -6,
                                      width: 20,
                                      height: 20,
                                      borderRadius: '50%',
                                      bgcolor: data.rating === 'excellent' ? '#4caf50' : 
                                               data.rating === 'good' ? '#8bc34a' :
                                               data.rating === 'average' ? '#ffeb3b' :
                                               data.rating === 'poor' ? '#ff9800' : '#f44336',
                                      border: '2px solid white',
                                      transform: 'translateX(-50%)'
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Chip 
                                label={data.rating} 
                                size="small"
                                sx={{ 
                                  bgcolor: data.rating === 'excellent' ? '#4caf50' : 
                                           data.rating === 'good' ? '#8bc34a' :
                                           data.rating === 'average' ? '#ffeb3b' :
                                           data.rating === 'poor' ? '#ff9800' : '#f44336',
                                  color: data.rating === 'average' ? 'black' : 'white',
                                  width: 100,
                                  textAlign: 'center'
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" fontWeight="bold" sx={{ width: 120 }}>
                            Overall:
                          </Typography>
                          <Box flex={1} mx={2}>
                            <Box 
                              sx={{ 
                                height: 8, 
                                bgcolor: '#e0e0e0', 
                                borderRadius: 4,
                                position: 'relative'
                              }}
                            >
                              <Box 
                                sx={{
                                  position: 'absolute',
                                  left: `${benchmarkData?.overall.percentile || 50}%`,
                                  top: -6,
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  bgcolor: benchmarkData?.overall.rating === 'excellent' ? '#4caf50' : 
                                           benchmarkData?.overall.rating === 'good' ? '#8bc34a' :
                                           benchmarkData?.overall.rating === 'average' ? '#ffeb3b' :
                                           benchmarkData?.overall.rating === 'poor' ? '#ff9800' : '#f44336',
                                  border: '2px solid white',
                                  transform: 'translateX(-50%)'
                                }}
                              />
                            </Box>
                          </Box>
                          <Chip 
                            label={benchmarkData?.overall.rating || 'unknown'} 
                            size="small"
                            sx={{ 
                              bgcolor: benchmarkData?.overall.rating === 'excellent' ? '#4caf50' : 
                                       benchmarkData?.overall.rating === 'good' ? '#8bc34a' :
                                       benchmarkData?.overall.rating === 'average' ? '#ffeb3b' :
                                       benchmarkData?.overall.rating === 'poor' ? '#ff9800' : '#f44336',
                              color: benchmarkData?.overall.rating === 'average' ? 'black' : 'white',
                              width: 100,
                              textAlign: 'center'
                            }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}

            {activeTab === 4 && (
              <>
                <Typography variant="h6" gutterBottom>AI Recommendations</Typography>
                <Grid container spacing={3}>
                  {analysis.recommendations && analysis.recommendations.map((rec, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ 
                        p: 2, 
                        borderLeft: '4px solid',
                        borderLeftColor: rec.severity === 'critical' ? '#f44336' : 
                                         rec.severity === 'high' ? '#ff9800' : 
                                         rec.severity === 'medium' ? '#ffeb3b' : '#8bc34a'
                      }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Chip 
                            label={rec.category} 
                            size="small" 
                            sx={{ mr: 1, textTransform: 'capitalize' }}
                          />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {rec.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {rec.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdvancedAnalysisDashboard;