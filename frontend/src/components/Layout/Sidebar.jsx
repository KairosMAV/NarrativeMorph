import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Drawer,
  Box
} from '@mui/material';
import {
  // Existing imports
  Dashboard as DashboardIcon,
  Storage as RepositoryIcon,
  Assessment as AnalysisIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Description as DocumentationIcon,
  BugReport as TestingIcon,
  ExpandLess,
  ExpandMore,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  // New icons
  ShieldOutlined as VulnerabilitiesIcon,
  HistoryOutlined as ScanHistoryIcon,
  AutoFixHighOutlined as TestGenIcon,
  SchemaOutlined as TestHistoryIcon,
  SettingsBackupRestore as RefactorIcon,
  BuildOutlined as RefactoringIcon,
  HistoryOutlined as RefactoringHistoryIcon,
  NoteAddOutlined as DocGenIcon,
  MenuBookOutlined as DocHistoryIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState('');
  
  const handleMenuToggle = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? '' : menuName);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const isGroupActive = (basePath) => {
    return location.pathname.startsWith(basePath);
  };
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      text: 'Repositories',
      icon: <RepositoryIcon />,
      group: 'repositories',
      onClick: () => handleMenuToggle('repositories'),
      children: [
        {
          text: 'All Repositories',
          path: '/repositories',
          onClick: () => navigate('/repositories')
        },
        {
          text: 'Add New',
          path: '/repositories/new',
          onClick: () => navigate('/repositories/new')
        }
      ]
    },
    {
      text: 'Analysis',
      icon: <AnalysisIcon />,
      group: 'analysis',
      onClick: () => handleMenuToggle('analysis'),
      children: [
        {
          text: 'Recent Analysis',
          path: '/analyses',
          onClick: () => navigate('/analyses')
        },
        {
          text: 'Metrics',
          path: '/analyses/metrics',
          onClick: () => navigate('/analyses/metrics')
        },
        {
          text: 'Trends',
          path: '/analyses/trends',
          onClick: () => navigate('/analyses/trends')
        }
      ]
    },
    {
      text: 'Security',
      icon: <SecurityIcon />,
      group: 'security',
      onClick: () => handleMenuToggle('security'),
      children: [
        {
          text: 'New Security Scan',
          path: '/security/scan',
          onClick: () => navigate('/security/scan')
        },
        {
          text: 'Scan History',
          path: '/security/scans',
          onClick: () => navigate('/security/scans')
        },
        {
          text: 'Vulnerabilities',
          path: '/security/vulnerabilities',
          onClick: () => navigate('/security/vulnerabilities')
        }
      ]
    },
    {
      text: 'Test Automation',
      icon: <TestingIcon />,
      group: 'test',
      onClick: () => handleMenuToggle('test'),
      children: [
        {
          text: 'Generate Tests',
          path: '/test/generate',
          onClick: () => navigate('/test/generate')
        },
        {
          text: 'Test History',
          path: '/test/history',
          onClick: () => navigate('/test/history')
        }
      ]
    },
    {
      text: 'Refactoring',
      icon: <RefactorIcon />,
      group: 'refactoring',
      onClick: () => handleMenuToggle('refactoring'),
      children: [
        {
          text: 'New Refactoring',
          path: '/refactoring',
          onClick: () => navigate('/refactoring')
        },
        {
          text: 'Refactoring History',
          path: '/refactoring/history',
          onClick: () => navigate('/refactoring/history')
        }
      ]
    },
    {
      text: 'Documentation',
      icon: <DocumentationIcon />,
      group: 'documentation',
      onClick: () => handleMenuToggle('documentation'),
      children: [
        {
          text: 'Generate Documentation',
          path: '/documentation/generate',
          onClick: () => navigate('/documentation/generate')
        },
        {
          text: 'Documentation History',
          path: '/documentation/history',
          onClick: () => navigate('/documentation/history')
        }
      ]
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      onClick: () => navigate('/settings')
    },
    {
      text: 'Help',
      icon: <HelpIcon />,
      path: '/help',
      onClick: () => navigate('/help')
    }
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem 
                button 
                onClick={item.onClick} 
                sx={{
                  backgroundColor: (item.path && isActive(item.path)) || 
                                  (item.group && isGroupActive(`/${item.group}`)) 
                                  ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.children && (
                  expandedMenu === item.group ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItem>
              
              {item.children && (
                <Collapse in={expandedMenu === item.group} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem 
                        button 
                        key={child.text} 
                        onClick={child.onClick}
                        sx={{ 
                          pl: 4,
                          backgroundColor: isActive(child.path) ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                      >
                        <ListItemText primary={child.text} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;