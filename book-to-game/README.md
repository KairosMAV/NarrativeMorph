# 🎭 Book to Game

> Trasforma libri in giochi interattivi e esperienze AR con Unity usando AI

Un sistema avanzato che prende l'output del **text-chunker** (scene strutturate da libri) e le trasforma automaticamente in progetti Unity completi con minigame, esperienze AR e contenuti educativi.

## 🌟 Caratteristiche Principali

- **🤖 Team di Agenti AI Specializzati**: 4 agenti che lavorano insieme per creare progetti completi
- **🎮 Minigame Automatici**: Genera meccaniche di gioco basate sul contenuto narrativo
- **🥽 Esperienze AR Immersive**: Porta le scene letterarie nel mondo reale
- **📱 Multi-Piattaforma**: Supporta mobile, desktop, AR/VR
- **♿ Accessibilità Integrata**: Conforme agli standard di accessibilità
- **🛡️ Controlli di Qualità**: Testing automatico e guardrail di sicurezza
- **📚 Standard Educativi**: Allineamento con curriculum scolastici

## 🏗️ Architettura del Sistema

### Team di Agenti AI

1. **Unity Code Agent** 🔧
   - Genera script C# per Unity
   - Controller di scene e personaggi
   - Sistemi di interazione
   - Features AR/VR

2. **Game Design Agent** 🎨
   - Progetta minigame narrativi
   - Sistemi di progressione
   - Esperienze AR immersive
   - Linee guida di accessibilità

3. **Asset Generation Agent** 🎯
   - Specifiche per asset 3D
   - Configurazioni audio
   - Elementi UI/UX
   - Pipeline di ottimizzazione

4. **Quality Assurance Agent** 🛡️
   - Framework di testing
   - Guardrail di performance
   - Validazione contenuti educativi
   - Monitoraggio in tempo reale

### Coordinatore

Il **Agent Coordinator** orchestra tutti gli agenti per creare progetti Unity completi e coerenti.

## 🚀 Installazione e Setup

### Prerequisiti

- Python 3.12+
- Chiave API OpenAI
- Unity 2022.3+ (per sviluppo del progetto generato)

### Installazione

```bash
# Clone del repository
git clone <repository-url>
cd book-to-game

# Installazione delle dipendenze
pip install -e .

# Configurazione chiave API
export OPENAI_API_KEY='your-openai-api-key'
```

## 📖 Utilizzo

### 1. Trasformazione Diretta da Codice

```python
import asyncio
from src.services.book_to_game_service import BookToGameService

# Scene dal text-chunker
scenes = [
    {
        'elementi_narrativi': 'Tuoni e fulmini. Atmosfera tempestosa.',
        'personaggi': 'Tre streghe misteriose...',
        'ambientazione': 'Una landa desolata nella tempesta...',
        'mood_vibe': 'Misterioso, sinistro, inquietante',
        'azione_in_corso': 'Le streghe si incontrano...'
    }
    # ... altre scene
]

# Configurazione progetto
config = {
    'target_platforms': ['mobile', 'ar'],
    'educational_standards': ['Common Core Literature'],
    'target_age_groups': ['14-18'],
    'project_name': 'MacbethInteractive'
}

# Trasformazione
service = BookToGameService(api_key="your-key")
unity_project = await service.transform_book_to_game(scenes, config)
```

### 2. API REST

```bash
# Avvia il server
python -m src.api.main

# Trasforma un libro
curl -X POST "http://localhost:8000/transform/book-to-game" \
  -H "Content-Type: application/json" \
  -d '{
    "scenes": [...],
    "project_config": {...}
  }'

# Download progetto Unity come ZIP
curl -X POST "http://localhost:8000/transform/book-to-game/download" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  --output project.zip
```

### 3. Upload da File Text-Chunker

```bash
# Upload file CSV/JSON dal text-chunker
curl -X POST "http://localhost:8000/upload/text-chunker-output" \
  -F "file=@macbeth_scenes.csv" \
  -F "project_config={...}"
```

### 4. Esempio Completo

```bash
# Esegui l'esempio del Macbeth
python examples/usage_example.py

# Demo di una singola scena
python examples/usage_example.py --demo

# Mostra aiuto
python examples/usage_example.py --help
```

## 🎯 Output del Sistema

Il sistema genera un progetto Unity completo con:

### 📁 Struttura dei File

```
UnityProject/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── GameManager.cs
│   │   │   ├── SceneManager.cs
│   │   │   └── ProgressionManager.cs
│   │   ├── Scenes/
│   │   │   ├── Scene000Controller.cs
│   │   │   ├── Scene000Interactions.cs
│   │   │   └── ...
│   │   ├── Characters/
│   │   │   └── [Character]Controller.cs
│   │   └── AR/
│   │       └── Scene000AR.cs
│   ├── Resources/
│   │   ├── GameConfig.json
│   │   └── ScenesData.json
│   └── Tests/
│       └── TestFramework.cs
├── Documentation/
│   ├── README.md
│   └── API_Reference.md
└── project_data.json
```

### 🎮 Contenuti Generati

- **Script Unity**: Controller completi per scene, personaggi, interazioni
- **Configurazioni AR**: Setup per esperienze di realtà aumentata
- **Design di Gioco**: Minigame e meccaniche narrative
- **Specifiche Asset**: Dettagli per modelli 3D, audio, UI
- **Sistema di Testing**: Framework completo per QA
- **Documentazione**: Guide e riferimenti API

## 🔧 Configurazione Avanzata

### Template di Configurazione

```python
# Mobile Educativo
mobile_config = {
    "target_platforms": ["mobile"],
    "educational_standards": ["Common Core", "CSTA"],
    "target_age_groups": ["10-14"],
    "ar_features_enabled": False,
    "minigames_enabled": True
}

# Esperienza AR Completa
ar_config = {
    "target_platforms": ["mobile", "ar"],
    "educational_standards": ["Common Core"],
    "target_age_groups": ["13-18"],
    "ar_features_enabled": True,
    "minigames_enabled": True
}

# Desktop Avanzato
desktop_config = {
    "target_platforms": ["desktop", "ar", "vr"],
    "educational_standards": ["Common Core", "NGSS"],
    "target_age_groups": ["16-adult"],
    "ar_features_enabled": True,
    "multiplayer_enabled": True
}
```

### Personalizzazione Agenti

Ogni agente può essere configurato per specifiche esigenze:

```python
# Configurazione personalizzata degli agenti
coordinator = AgentCoordinator(
    openai_api_key="your-key",
    model="gpt-4"  # o "gpt-3.5-turbo" per costi ridotti
)

# Override delle configurazioni degli agenti
coordinator.unity_agent.temperature = 0.5  # Più deterministico
coordinator.design_agent.temperature = 0.9  # Più creativo
```

## 🧪 Testing e Qualità

### Framework di Testing Integrato

Il sistema include testing automatico per:

- ✅ **Performance**: Framerate, memoria, batteria
- ✅ **Accessibilità**: Conformità agli standard
- ✅ **Contenuti**: Appropriatezza educativa
- ✅ **Compatibilità**: Cross-platform testing
- ✅ **Sicurezza**: Validazione contenuti

### Guardrail di Qualità

- **Performance**: Target 60fps su dispositivi mid-range
- **Sicurezza**: Controlli automatici dei contenuti
- **Educativo**: Allineamento con standard curricolari
- **Accessibilità**: Conformità WCAG 2.1

## 🌐 Integrazione con Text-Chunker

Il sistema è progettato per integrarsi perfettamente con il text-chunker esistente:

1. **Input**: Prende le scene strutturate dal text-chunker
2. **Processing**: Gli agenti AI analizzano e trasformano i contenuti
3. **Output**: Progetto Unity completo pronto per lo sviluppo

### Formato Input Supportato

Il sistema accetta l'output del text-chunker in formato:
- **CSV** (come l'esempio fornito)
- **JSON** strutturato
- **API diretta** tra i servizi

## 📈 Roadmap

### Versione 1.1
- [ ] Integrazione con Unity Cloud Build
- [ ] Supporto per più motori di AI (Claude, Gemini)
- [ ] Template di asset procedurali

### Versione 1.2
- [ ] Editor Unity integrato
- [ ] Marketplace di asset generati
- [ ] Collaborazione multi-utente

### Versione 2.0
- [ ] VR nativo
- [ ] Multiplayer real-time
- [ ] AI procedurale in-game

## 🤝 Contributi

Contributi benvenuti! Aree di interesse:

- **Nuovi Agenti**: Specializzazioni per generi specifici
- **Ottimizzazioni**: Performance e costi API
- **Integrazioni**: Altri engine di gioco
- **Templates**: Configurazioni per casi d'uso specifici

## 📄 Licenza

[Specificare licenza]

## 🆘 Supporto

- **Issues**: [GitHub Issues]
- **Documentazione**: `/Documentation`
- **Esempi**: `/examples`

---

*Trasforma ogni libro in un'avventura interattiva! 🚀*

- **Analisi narrativa avanzata**: Estrae personaggi, ambientazioni, eventi chiave
- **Generazione di contenuti di gioco**: Crea obiettivi, missioni, puzzle basati sulla storia
- **Dati per Unity**: Genera configurazioni JSON compatibili con Unity per AR/VR
- **Integrazione con AI**: Utilizza modelli linguistici per creare contenuti dinamici
- **API REST**: Interfaccia semplice per integrazioni esterne

## Architettura

```
book-to-game/
├── src/
│   ├── main.py                 # FastAPI entry point
│   ├── models/                 # Pydantic models
│   ├── services/              # Business logic
│   ├── generators/            # Content generators
│   ├── unity/                 # Unity integration
│   └── utils/                 # Utilities
├── tests/                     # Test suite
├── unity_assets/              # Unity project files
└── examples/                  # Example books and outputs
```

## Installazione

```bash
cd book-to-game
pip install -e .
```

## Utilizzo

```bash
uvicorn src.main:app --reload --port 8000
```

## API Endpoints

- `POST /analyze-book` - Analizza un libro e genera dati strutturati
- `POST /generate-game` - Crea contenuti di gioco da un libro
- `POST /export-unity` - Esporta configurazioni per Unity
- `GET /health` - Health check

## Integrazione Unity

Il servizio genera file JSON compatibili con Unity che includono:
- Scene descriptions per l'AR
- Character data e modelli 3D
- Quest/mission configurations
- Interactive object definitions
