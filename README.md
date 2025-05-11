# Narrative Morph: L'Evoluzione AI del Contenuto

## Elevator Pitch
Narrative Morph è una piattaforma AI-powered che rivoluziona la fruizione dei contenuti digitali trasformando articoli e notizie statiche in esperienze multi-formato, interattive e immersive.

## Descrizione del Progetto
(Includere qui la descrizione dettagliata del problema, della soluzione proposta e dell'architettura ad agenti come fornito nel documento.)

## Tecnologie Chiave
- **Frontend:** React, Tailwind CSS
- **Backend:** Python, FastAPI
- **Orchestrazione Agenti:** CrewAI
- **Agenti AI:**
    - NLP: spaCy, NLTK, API LLM (OpenAI GPT, Google Gemini)
    - TTS: ElevenLabs, Google Cloud TTS
    - Generazione Immagini: API DALL-E 3, Stability AI, Unsplash/Pexels API
    - LLM per generazione testo e chatbot: OpenAI API, Google Gemini
- **Deployment (Prototipo):** Vercel/Netlify (Frontend), Google Cloud Run/Heroku (Backend), Docker

## Struttura del Progetto (Proposta)
```
narrative-morph/
├── narrative-morph-api/      # Backend FastAPI e Agenti CrewAI
│   ├── app/
│   │   ├── main.py           # Entrypoint FastAPI
│   │   ├── agents/           # Definizione degli agenti CrewAI
│   │   ├── tasks/            # Definizione dei task CrewAI
│   │   ├── tools/            # Eventuali tool custom per gli agenti
│   │   └── services/         # Logica di business, integrazioni API esterne
│   ├── Dockerfile
│   └── requirements.txt
├── narrative-morph-ui/       # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   ├── Dockerfile
│   └── package.json
├── .gitignore
└── README.md
```

## Setup e Avvio (Locale)

### Backend
```bash
cd narrative-morph-api
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate per Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd narrative-morph-ui
npm install
npm start
```
## Output Previsto per l'Hackathon
(Dettagliare l'output come da documento originale)

## Focus per l'Hackathon
(Dettagliare il focus come da documento originale)