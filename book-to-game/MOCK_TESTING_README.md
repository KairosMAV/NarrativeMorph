# 🧪 Book-to-Game Mock Testing System

Questo sistema permette di testare completamente il pipeline book-to-game senza utilizzare API reali. Perfetto per sviluppo, demo e hackathon!

## 🚀 Quick Start

### 1. Setup Iniziale
```bash
cd book-to-game
python setup_mock_testing.py
```

### 2. Test Completo del Sistema
```bash
python test_complete_mock_system.py
```

### 3. Test di Scenari Specifici
```bash
python test_scenarios.py
```

### 4. Avvio Server API Mock
```bash
python start_mock_server.py
```

## 📋 Test Disponibili

### Test Completo (`test_complete_mock_system.py`)
- ✅ Test diretto del servizio
- ✅ Test health check API
- ✅ Test trasformazione via API
- ✅ Test prestazioni (richieste concurrent)
- ✅ Test singoli agenti
- ✅ Riepilogo completo dei risultati

### Test Scenari (`test_scenarios.py`)
- 📖 **Minimal**: Scena di test semplice
- 🧚 **Fairy Tale**: Cappuccetto Rosso educativo
- 🚀 **Space Adventure**: Avventura spaziale scientifica
- 🏺 **Historical**: Esplorazione dell'Antico Egitto

### Server Mock (`start_mock_server.py`)
- 🌐 Server FastAPI in modalità mock
- 📖 Documentazione automatica su `/docs`
- 🔄 Hot reload per sviluppo
- ⚡ Risposte rapide simulate

## 🎯 Componenti Testati

### 1. Agenti AI (Mock)
- **Unity Code Agent**: Genera script C# per Unity
- **Game Design Agent**: Crea design e meccaniche di gioco
- **Asset Generation Agent**: Specifica asset visivi e audio
- **Quality Assurance Agent**: Valuta qualità e conformità educativa

### 2. API Endpoints
- `GET /`: Health check
- `POST /transform/book-to-game`: Trasformazione completa
- WebSocket per aggiornamenti real-time (se implementato)

### 3. Servizi
- **BookToGameService**: Orchestrazione completa
- **AgentCoordinator**: Coordinamento agenti
- **Mock OpenAI Client**: Simulazione risposte AI

## 📊 Output Attesi

### Risultati di Trasformazione
```json
{
  "unity_project_files": {
    "Scripts/SceneController.cs": "...",
    "Scripts/CharacterController.cs": "...",
    "Scenes/MainScene.unity": "..."
  },
  "game_scenes": [
    {
      "scene_id": "scene_1",
      "title": "...",
      "mechanics": [...],
      "ar_features": [...]
    }
  ],
  "educational_content": [...],
  "ar_features": [...],
  "project_metadata": {...}
}
```

### File Unity Generati
- **SceneController.cs**: Controller principale della scena
- **CharacterController.cs**: Gestione personaggi
- **InteractionManager.cs**: Sistema di interazioni
- **ARFeatureManager.cs**: Funzionalità AR
- **EducationalAssessment.cs**: Sistema di valutazione

## 🛠️ Configurazione Avanzata

### Variabili Ambiente (.env)
```env
OPENAI_API_KEY=mock-api-key
OPENAI_MODEL=gpt-4
MOCK_MODE=true
LOG_LEVEL=INFO
```

### Personalizzazione Mock
Per modificare le risposte mock, edita `src/utils/mock_openai.py`:
- `_generate_unity_code()`: Codice Unity personalizzato
- `_generate_game_design()`: Design di gioco
- `_generate_asset_spec()`: Specifica asset
- `_generate_qa_review()`: Valutazione qualità

## 🎮 Scenari di Test

### 1. Scenario Minimal
- Scena singola semplice
- Test di base funzionalità
- Verifica pipeline completo

### 2. Scenario Educativo Complesso
- Multiple scene interconnesse
- Contenuti educativi avanzati
- Meccaniche AR integrate

### 3. Test Prestazioni
- Richieste multiple simultanee
- Misura tempi di risposta
- Verifica stabilità sistema

## 🐛 Troubleshooting

### Server non si avvia
```bash
# Verifica dipendenze
pip install -r requirements.txt

# Controlla porta
netstat -an | grep 8002
```

### Import errors
```bash
# Assicurati di essere nella directory corretta
cd book-to-game

# Verifica struttura
ls src/
```

### Test falliscono
```bash
# Verifica configurazione
python setup_mock_testing.py

# Test singolo agente
python test_agent_mock.py
```

## 📈 Metriche di Successo

### Criteri di Accettazione
- ✅ Tutti i test passano (≥95% success rate)
- ✅ Tempo risposta < 10 secondi per scenario complesso
- ✅ Generazione file Unity validi
- ✅ Contenuto educativo appropriato
- ✅ Features AR specificate

### Performance Targets
- **Trasformazione singola scena**: < 3 secondi
- **Trasformazione scenario completo**: < 10 secondi
- **Richieste concurrent**: 5+ simultanee
- **Success rate**: ≥95%

## 🎯 Utilizzo in Hackathon

### Demo Preparation
1. **Setup**: `python setup_mock_testing.py`
2. **Test**: `python test_complete_mock_system.py`
3. **Server**: `python start_mock_server.py`
4. **Demo**: `python test_scenarios.py` (scenario fairy_tale)

### Desenvolvimento Rapido
- Mock system permette sviluppo senza API keys
- Risposte immediate per iterazione veloce
- Test automatizzati per verifica continua
- Setup in < 5 minuti

## 🔧 Estensioni Future

### Integrazione Real APIs
- Sostituire mock client con OpenAI reale
- Aggiungere Stability AI per immagini
- Integrare ElevenLabs per audio

### Features Avanzate
- WebSocket real-time updates
- Database persistenza progetti
- Export progetti Unity completi
- Deploy automatico su cloud

---

**🎉 Happy Testing!** Questo sistema mock ti permette di testare e sviluppare rapidamente senza limitazioni di API quota o costi!
