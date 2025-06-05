// src/pages/Welcome.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Security as SecurityIcon,
  Code as CodeIcon,
  Description as DocIcon,
  BugReport as TestIcon,
  AutoFixHigh as RefactorIcon,
  PlayArrow as StartIcon,
  ArrowForward as NextIcon,
  KeyboardArrowRight as ArrowIcon
} from '@mui/icons-material';

const Welcome = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleStart = () => {
    navigate('/dashboard');
  };
  
  // Passi del tour di introduzione
  const steps = [
    {
      label: 'Benvenuto in CodePhoenix',
      description: `CodePhoenix è una piattaforma all-in-one basata su AI che migliora
                    la qualità del tuo codice, identifica vulnerabilità, genera test,
                    suggerisce refactoring e crea documentazione automaticamente.`,
      component: (
        <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
          <CardMedia
            component="img"
            sx={{ 
              width: { xs: '100%', sm: 200 },
              height: { xs: 200, sm: 'auto' },
              objectFit: 'cover'
            }}
            image="/logo512.png"
            alt="CodePhoenix Logo"
          />
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h5" component="div" gutterBottom>
              Sfrutta la potenza dell'AI per il tuo codice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CodePhoenix è una suite di microservizi basati su AI progettati per automatizzare
              diverse fasi del ciclo di vita dello sviluppo software. Integrato con i principali
              sistemi di controllo del codice come GitHub e GitLab, CodePhoenix offre una
              soluzione completa per migliorare la qualità e la sicurezza del tuo codice.
            </Typography>
          </CardContent>
        </Card>
      )
    },
    {
      label: 'I nostri servizi',
      description: 'CodePhoenix offre cinque servizi principali per migliorare il tuo processo di sviluppo:',
      component: (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Analisi di Sicurezza
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Scansione automatica del codice per identificare vulnerabilità, dipendenze obsolete,
                  pattern di codice insicuri e segreti hardcoded.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CodeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Analisi della Qualità
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Valutazione multi-dimensionale della qualità del codice, che misura affidabilità,
                  manutenibilità, performance e complessità.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TestIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Generazione di Test
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Creazione automatizzata di test unitari, di integrazione ed end-to-end con analisi
                  della coverage.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RefactorIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Refactoring Automatico
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Suggerimenti e automazione di refactoring per migliorare la qualità del codice,
                  ridurre la complessità e applicare best practices.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DocIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Documentazione Automatica
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Generazione di documentazione completa per codice, API e utenti finali con
                  diagrammi UML, sequenze e flowchart.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Come iniziare',
      description: 'Ecco come puoi iniziare a utilizzare CodePhoenix:',
      component: (
        <List sx={{ mt: 1 }}>
          <ListItem>
            <ListItemIcon>
              <ArrowIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Aggiungi un Repository" 
              secondary="Connetti il tuo repository da GitHub, GitLab o un altro provider Git." 
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <ArrowIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Esegui un'Analisi" 
              secondary="Seleziona il tipo di analisi da eseguire sul tuo repository." 
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <ArrowIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Visualizza i Risultati" 
              secondary="Esamina i problemi, le metriche e i suggerimenti generati dall'AI." 
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <ArrowIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Automatizza" 
              secondary="Configura analisi periodiche o integrazioni con il tuo workflow CI/CD." 
            />
          </ListItem>
        </List>
      )
    }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Benvenuto su CodePhoenix
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" align="center" paragraph>
          La tua piattaforma per analisi di codice e miglioramento guidato dall'AI
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {step.component}
                <Box sx={{ mb: 2, mt: 3 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleStart : handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      endIcon={index === steps.length - 1 ? <StartIcon /> : <NextIcon />}
                    >
                      {index === steps.length - 1 ? 'Inizia ora' : 'Continua'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Indietro
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Sei pronto per iniziare!
            </Typography>
            <Typography paragraph>
              Ora puoi esplorare tutte le funzionalità di CodePhoenix e migliorare la qualità del tuo codice.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleStart}
              size="large"
              sx={{ mt: 2 }}
              startIcon={<StartIcon />}
            >
              Vai alla Dashboard
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Welcome;