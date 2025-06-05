// src/utils/mockData.js
/**
 * Dati mock per lo sviluppo senza backend
 * Solo per uso in modalità development
 */

// Genera ID casuali
const generateId = () => Math.random().toString(36).substring(2, 15);

// Repository di esempio
const repositories = [
  {
    id: '1',
    name: 'codephoenix-frontend',
    url: 'https://github.com/codephoenix/frontend',
    description: 'Frontend per la piattaforma CodePhoenix',
    default_branch: 'main',
    created_at: '2023-05-15T10:00:00Z',
    last_analysis: '2023-06-20T14:30:00Z',
    scan_frequency: 'weekly',
    auth_type: 'token'
  },
  {
    id: '2',
    name: 'codephoenix-backend',
    url: 'https://github.com/codephoenix/backend',
    description: 'Backend per la piattaforma CodePhoenix',
    default_branch: 'main',
    created_at: '2023-05-10T09:00:00Z',
    last_analysis: '2023-06-18T11:20:00Z',
    scan_frequency: 'daily',
    auth_type: 'token'
  },
  {
    id: '3',
    name: 'codephoenix-documentation',
    url: 'https://github.com/codephoenix/docs',
    description: 'Documentazione per CodePhoenix',
    default_branch: 'master',
    created_at: '2023-05-20T14:00:00Z',
    last_analysis: '2023-06-15T09:45:00Z',
    scan_frequency: 'manual',
    auth_type: 'none'
  }
];

// Analisi di esempio
const analyses = [
  {
    id: '1',
    repo_url: 'https://github.com/codephoenix/frontend',
    branch: 'main',
    analysis_type: 'full',
    status: 'completed',
    created_at: '2023-06-20T14:00:00Z',
    completed_at: '2023-06-20T14:30:00Z',
    result: {
      quality_score: 85,
      issues: [
        {
          id: '101',
          type: 'bug',
          severity: 'high',
          file: 'src/components/Form.jsx',
          line: 42,
          message: 'Possibile null reference',
          description: 'La proprietà viene utilizzata senza verificare se è null',
          code_snippet: "const value = user.preferences.theme;",
          recommendation: "Aggiungere un controllo: const value = user?.preferences?.theme || 'default';"
        },
        {
          id: '102',
          type: 'security',
          severity: 'medium',
          file: 'src/utils/api.js',
          line: 15,
          message: 'Token sensibile esposto',
          description: 'Il token API è hardcoded nel codice',
          code_snippet: "const API_KEY = 'abc123xyz';",
          recommendation: 'Utilizzare variabili di ambiente per i token'
        }
      ],
      dimension_scores: {
        reliability: 82,
        security: 78,
        maintainability: 90,
        performance: 85
      },
      files_analyzed: 124,
      vulnerabilities: 2,
      performance_issues: 5
    }
  },
  {
    id: '2',
    repo_url: 'https://github.com/codephoenix/backend',
    branch: 'main',
    analysis_type: 'security',
    status: 'completed',
    created_at: '2023-06-18T11:00:00Z',
    completed_at: '2023-06-18T11:20:00Z',
    result: {
      quality_score: 76,
      issues: [
        {
          id: '201',
          type: 'security',
          severity: 'high',
          file: 'src/controllers/auth.js',
          line: 87,
          message: 'SQL Injection possibile',
          description: 'Query SQL costruita con concatenazione di stringhe',
          code_snippet: "const query = `SELECT * FROM users WHERE username = '${username}'`;",
          recommendation: 'Utilizzare query parametrizzate'
        }
      ],
      dimension_scores: {
        reliability: 80,
        security: 70,
        maintainability: 85,
        performance: 78
      },
      files_analyzed: 78,
      vulnerabilities: 3,
      performance_issues: 2
    }
  },
  {
    id: '3',
    repo_url: 'https://github.com/codephoenix/frontend',
    branch: 'feature/new-dashboard',
    analysis_type: 'full',
    status: 'in_progress',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minuti fa
    completed_at: null,
    result: null
  }
];

// Utenti di esempio
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@codephoenix.com',
    name: 'Administrator',
    role: 'admin'
  },
  {
    id: '2',
    username: 'demo',
    email: 'demo@codephoenix.com',
    name: 'Demo User',
    role: 'user'
  }
];

// Gestione delle richieste mock
const mockData = {
  // Gestisce le richieste GET
  get: (url) => {
    // Repositories
    if (url === '/repositories') {
      return [...repositories];
    }
    
    // Specific repository
    if (url.match(/\/repositories\/[a-zA-Z0-9]+/)) {
      const id = url.split('/').pop();
      return repositories.find(repo => repo.id === id) || null;
    }
    
    // Analyses
    if (url === '/analysis') {
      return [...analyses];
    }
    
    // Recent analyses
    if (url === '/analysis/recent') {
      return analyses.slice(0, 5);
    }
    
    // Specific analysis
    if (url.match(/\/analysis\/[a-zA-Z0-9]+/)) {
      const id = url.split('/').pop();
      return analyses.find(analysis => analysis.id === id) || null;
    }
    
    // Analysis history
    if (url.match(/\/analysis\/history\/[a-zA-Z0-9]+/)) {
      const repoId = url.split('/').pop();
      const repo = repositories.find(repo => repo.id === repoId);
      if (!repo) return [];
      
      return analyses.filter(analysis => analysis.repo_url === repo.url);
    }
    
    // User profile
    if (url === '/auth/users/me') {
      return users[0]; // Return admin user
    }
    
    // Default: not found
    return null;
  },
  
  // Gestisce le richieste POST
  post: (url, data) => {
    // Login
    if (url === '/auth/token') {
      const username = data.get ? data.get('username') : data.username;
      const validCredentials = 
        (username === 'admin' && data.get('password') === 'password') || 
        (username === 'demo' && data.get('password') === 'password');
        
      if (validCredentials) {
        return {
          access_token: 'mock_token_' + Date.now(),
          token_type: 'bearer',
          user: users.find(u => u.username === username)
        };
      }
      // Simula errore credenziali non valide
      throw { response: { status: 401, data: { message: 'Credenziali non valide' } } };
    }
    
    // Create repository
    if (url === '/repositories') {
      const newRepo = {
        id: generateId(),
        created_at: new Date().toISOString(),
        ...data
      };
      repositories.push(newRepo);
      return newRepo;
    }
    
    // Submit analysis
    if (url === '/analysis') {
      const { repository_id, branch, analysis_type } = data;
      const repo = repositories.find(r => r.id === repository_id);
      
      if (!repo) {
        throw { response: { status: 404, data: { message: 'Repository non trovato' } } };
      }
      
      const newAnalysis = {
        id: generateId(),
        repo_url: repo.url,
        branch: branch || repo.default_branch,
        analysis_type: analysis_type || 'full',
        status: 'in_progress',
        created_at: new Date().toISOString(),
        completed_at: null,
        result: null
      };
      
      analyses.push(newAnalysis);
      
      // Simula completamento dopo qualche secondo in sviluppo
      setTimeout(() => {
        const index = analyses.findIndex(a => a.id === newAnalysis.id);
        if (index !== -1) {
          analyses[index] = {
            ...newAnalysis,
            status: 'completed',
            completed_at: new Date().toISOString(),
            result: {
              quality_score: Math.floor(Math.random() * 30) + 70, // 70-99
              issues: [
                {
                  id: generateId(),
                  type: 'bug',
                  severity: 'medium',
                  file: `src/components/${Math.random() > 0.5 ? 'Header' : 'Footer'}.jsx`,
                  line: Math.floor(Math.random() * 100) + 1,
                  message: 'Esempio di problema generato automaticamente',
                  description: 'Questo è un problema fittizio creato per la demo',
                  code_snippet: "const value = Math.random() > 0.5 ? data.value : defaultValue;",
                  recommendation: 'Verificare sempre che data.value esista prima di utilizzarlo'
                },
                {
                  id: generateId(),
                  type: 'security',
                  severity: 'low',
                  file: 'src/utils/helpers.js',
                  line: Math.floor(Math.random() * 50) + 1,
                  message: 'Problema di sicurezza simulato',
                  description: 'Questo è un problema fittizio per la demo',
                  code_snippet: "localStorage.setItem('userToken', token);",
                  recommendation: 'Considerare modalità più sicure per memorizzare i token'
                }
              ],
              dimension_scores: {
                reliability: Math.floor(Math.random() * 20) + 70,
                security: Math.floor(Math.random() * 20) + 70,
                maintainability: Math.floor(Math.random() * 20) + 70,
                performance: Math.floor(Math.random() * 20) + 70
              },
              files_analyzed: Math.floor(Math.random() * 50) + 50,
              vulnerabilities: Math.floor(Math.random() * 5),
              performance_issues: Math.floor(Math.random() * 6)
            }
          };
        }
      }, 8000);
      
      return newAnalysis;
    }
    
    // OAuth GitHub callback
    if (url === '/auth/github/callback') {
      return {
        access_token: 'mock_github_token_' + Date.now(),
        token_type: 'bearer'
      };
    }
    
    // OAuth GitLab callback
    if (url === '/auth/gitlab/callback') {
      return {
        access_token: 'mock_gitlab_token_' + Date.now(),
        token_type: 'bearer'
      };
    }
    
    // Default: not implemented
    return null;
  },
  
  // Gestisce le richieste PUT
  put: (url, data) => {
    // Update repository
    if (url.match(/\/repositories\/[a-zA-Z0-9]+/)) {
      const id = url.split('/').pop();
      const index = repositories.findIndex(repo => repo.id === id);
      
      if (index === -1) {
        throw { response: { status: 404, data: { message: 'Repository non trovato' } } };
      }
      
      repositories[index] = { ...repositories[index], ...data };
      return repositories[index];
    }
    
    // Default: not implemented
    return null;
  },
  
  // Gestisce le richieste DELETE
  delete: (url) => {
    // Delete repository
    if (url.match(/\/repositories\/[a-zA-Z0-9]+/)) {
      const id = url.split('/').pop();
      const index = repositories.findIndex(repo => repo.id === id);
      
      if (index === -1) {
        throw { response: { status: 404, data: { message: 'Repository non trovato' } } };
      }
      
      repositories.splice(index, 1);
      return { success: true, message: 'Repository eliminato con successo' };
    }
    
    // Delete analysis
    if (url.match(/\/analysis\/[a-zA-Z0-9]+/)) {
      const id = url.split('/').pop();
      const index = analyses.findIndex(analysis => analysis.id === id);
      
      if (index === -1) {
        throw { response: { status: 404, data: { message: 'Analisi non trovata' } } };
      }
      
      analyses.splice(index, 1);
      return { success: true, message: 'Analisi eliminata con successo' };
    }
    
    // Default: not implemented
    return null;
  }
};

export default mockData;