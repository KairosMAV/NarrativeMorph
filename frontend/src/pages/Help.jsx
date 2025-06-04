import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Tab,
  Tabs
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Forum as ForumIcon,
  Code as CodeIcon,
  FileDownload as DownloadIcon,
  QuestionAnswer as FaqIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearch = (event) => {
    event.preventDefault();
    // Implementare la ricerca
    console.log('Ricerca per:', searchQuery);
  };
  
  // FAQ comuni
  const faqItems = [
    {
      question: 'Come posso aggiungere un nuovo repository?',
      answer: 'Per aggiungere un nuovo repository, vai alla pagina "Repositories" e clicca sul pulsante "Aggiungi Repository". Inserisci l\'URL del repository, configura le opzioni di analisi e clicca su "Salva".'
    },
    {
      question: 'Come funziona l\'analisi del codice?',
      answer: 'CodePhoenix analizza il tuo codice utilizzando un\'insieme di strumenti per identificare problemi di qualità, sicurezza e performance. L\'analisi viene eseguita sul server e i risultati vengono visualizzati nella dashboard.'
    },
    {
      question: 'Che tipi di problemi può rilevare CodePhoenix?',
      answer: 'CodePhoenix può rilevare vari tipi di problemi, tra cui: vulnerabilità di sicurezza, code smells, bug potenziali, problemi di performance, duplicazioni di codice e altro ancora.'
    },
    {
      question: 'Posso integrare CodePhoenix nel mio CI/CD?',
      answer: 'Sì, CodePhoenix offre API REST che puoi utilizzare per integrare l\'analisi del codice nel tuo pipeline CI/CD. Puoi trovare la documentazione completa nella sezione API.'
    },
    {
      question: 'Come posso configurare le regole di analisi?',
      answer: 'Puoi configurare le regole di analisi a livello di repository. Vai alle impostazioni del repository e seleziona la scheda "Regole di Analisi". Qui puoi attivare o disattivare specifiche regole e configurare la loro severità.'
    },
    {
      question: 'CodePhoenix supporta i repository privati?',
      answer: 'Sì, CodePhoenix supporta sia repository pubblici che privati. Per i repository privati, dovrai configurare le credenziali di accesso nelle impostazioni del repository.'
    }
  ];
  
  // Risorse disponibili
  const resources = [
    {
      title: 'Guida Rapida',
      description: 'Come iniziare con CodePhoenix in pochi minuti',
      icon: <BookIcon />,
      link: '/docs/quickstart'
    },
    {
      title: 'Video Tutorial',
      description: 'Video tutorial passo-passo per utilizzare CodePhoenix',
      icon: <VideoIcon />,
      link: '/docs/videos'
    },
    {
      title: 'Documentazione API',
      description: 'Documentazione completa delle API di CodePhoenix',
      icon: <BookIcon />,
      link: '/docs/api'
    },
    {
      title: 'Forum della Community',
      description: 'Confrontati con altri utenti e ricevi supporto dalla community',
      icon: <ForumIcon />,
      link: 'https://community.codephoenix.com'
    },
    {
      title: 'Aggiornamenti e Novità',
      description: 'Rimani aggiornato sulle nuove funzionalità e miglioramenti',
      icon: <BookIcon />,
      link: '/docs/updates'
    }
  ];
  
  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Help &amp; Supporto</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Help &amp; Supporto
      </Typography>
      
      {/* Barra di ricerca */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            label="Cerca aiuto"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Es. Come configurare un repository"
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ ml: 2, height: 40 }}
            startIcon={<SearchIcon />}
          >
            Cerca
          </Button>
        </Box>
      </Paper>
      
      {/* Tab per le sezioni di aiuto */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="FAQ" icon={<FaqIcon />} iconPosition="start" />
          <Tab label="Risorse" icon={<BookIcon />} iconPosition="start" />
          <Tab label="Supporto" icon={<HelpIcon />} iconPosition="start" />
          <Tab label="Downloads" icon={<DownloadIcon />} iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* FAQ */}
          {activeTab === 0 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Domande Frequenti
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Risposte alle domande più comuni su CodePhoenix
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {faqItems.map((faq, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`faq-content-${index}`}
                      id={`faq-header-${index}`}
                    >
                      <Typography>{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="textSecondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </div>
          )}
          
          {/* Risorse */}
          {activeTab === 1 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Risorse Disponibili
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Documentazione, guide e risorse per sfruttare al meglio CodePhoenix
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {resources.map((resource, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ color: 'primary.main', mr: 1 }}>
                            {resource.icon}
                          </Box>
                          <Typography variant="h6">{resource.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {resource.description}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          component={Link} 
                          to={resource.link}
                        >
                          Vai alla risorsa
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
          
          {/* Supporto */}
          {activeTab === 2 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Supporto Tecnico
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Hai bisogno di assistenza? Contatta il nostro team di supporto
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Assistenza via Email
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Invia una richiesta di supporto al nostro team tecnico. Risponderemo entro 24 ore lavorative.
                    </Typography>
                    <Button 
                      variant="contained" 
                      component="a" 
                      href="mailto:support@codephoenix.com"
                    >
                      Contatta il supporto
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Chat dal vivo
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Chatta in tempo reale con un nostro esperto. Servizio disponibile dal lunedì al venerdì, 9:00-18:00.
                    </Typography>
                    <Button variant="contained" color="secondary">
                      Inizia una chat
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </div>
          )}
          
          {/* Downloads */}
          {activeTab === 3 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Downloads
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Scarica strumenti, plugin e altre risorse per CodePhoenix
              </Typography>
              
              <List sx={{ mt: 2 }}>
                <ListItem button component="a" href="/downloads/cli">
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="CodePhoenix CLI" 
                    secondary="Strumento da linea di comando per eseguire analisi in locale" 
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem button component="a" href="/downloads/vscode">
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Plugin VS Code" 
                    secondary="Integrazione con Visual Studio Code" 
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem button component="a" href="/downloads/intellij">
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Plugin IntelliJ" 
                    secondary="Integrazione con IntelliJ IDEA e altri IDE JetBrains" 
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem button component="a" href="/downloads/github">
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="GitHub Action" 
                    secondary="Integrazione con GitHub Actions per CI/CD" 
                  />
                </ListItem>
              </List>
            </div>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Help;