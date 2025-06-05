# 🚀 DOCKER COMPOSE HACKATHON - VERSIONE SEMPLIFICATA

## Problema con la versione completa
**7 servizi = 7 potenziali punti di failure**
- Ogni servizio richiede Dockerfile + debug
- Network dependencies possono bloccare tutto
- PostgreSQL + Celery = overhead di setup
- Media service + Unity generator = nice-to-have per MVP

## 🎯 VERSIONE MVP (3 servizi core)

```yaml
# docker-compose.hackathon.yml - MVP Version
version: '3.8'

services:
  # All-in-One Backend (FastAPI + CrewAI)
  narrative-api:
    build: ./narrative-morph-api
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
      - STABILITY_API_KEY=${STABILITY_API_KEY}
      - DATABASE_URL=sqlite:///./storage/narrative.db
    volumes:
      - ./storage:/app/storage
      - ./text-chunker/src:/app/text_chunker  # Mount existing text-chunker
    networks:
      - narrative_net

  # Redis for job queue (lightweight)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - narrative_net

  # Frontend
  narrative-ui:
    build: ./narrative-morph-ui
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - narrative-api
    networks:
      - narrative_net

networks:
  narrative_net:
    driver: bridge

volumes:
  storage_data:
```

## 🔄 EVOLUZIONE GRADUALE

### Fase 1: MVP (Hackathon - 72h)
- ✅ 3 servizi: API + Redis + UI
- ✅ SQLite database (no PostgreSQL setup)
- ✅ Text-chunker integrato (no microservizio separato)
- ✅ CrewAI orchestrator interno
- ✅ Local file storage (no S3)

### Fase 2: Production Ready (Post-hackathon)
- ⬆️ PostgreSQL per production
- ⬆️ Separate microservices
- ⬆️ Celery workers
- ⬆️ Media service
- ⬆️ Unity generator service

## 📁 STRUTTURA SEMPLIFICATA

```
NarrativeMorph/
├── docker-compose.yml           # MVP version
├── docker-compose.prod.yml      # Full microservices
├── narrative-morph-api/         # All-in-one backend
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py             # FastAPI + CrewAI
│   │   ├── agents/             # CrewAI agents
│   │   ├── services/           # Business logic
│   │   └── text_chunker/       # Integrated chunker
│   └── requirements.txt
├── narrative-morph-ui/          # React frontend
│   ├── Dockerfile
│   └── src/
└── storage/                     # Local file storage
    ├── media/
    ├── videos/
    └── audio/
```

## ⚡ QUICK START COMMANDS

```bash
# Setup rapido per hackathon
cp docker-compose.hackathon.yml docker-compose.yml
echo "OPENAI_API_KEY=your_key_here" > .env
echo "ELEVENLABS_API_KEY=your_key_here" >> .env

# Build e start
docker-compose up --build
```

## 🎭 MIGRAZIONE GRADUALE

### Durante Hackathon
```yaml
# Single backend service con tutto integrato
narrative-api:
  # Include: FastAPI + CrewAI + TextChunker + Media processing
```

### Post Hackathon
```yaml
# Microservizi separati
gateway-service:      # API Gateway
orchestrator-service: # CrewAI agents
text-chunker:        # Scene analysis
unity-generator:     # Game code gen
media-service:       # FFmpeg processing
```
