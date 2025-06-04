import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import CreateProject from './components/CreateProject';
import Navigation from './components/Navigation';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/v1/projects/');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  projects={projects} 
                  loading={loading} 
                  onRefresh={fetchProjects} 
                />
              } 
            />
            <Route 
              path="/create" 
              element={
                <CreateProject 
                  onProjectCreated={fetchProjects} 
                />
              } 
            />
            <Route 
              path="/project/:id" 
              element={<ProjectDetail />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
