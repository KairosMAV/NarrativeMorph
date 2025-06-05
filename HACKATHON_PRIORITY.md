# 🎯 PRIORITÀ HACKATHON - 72 ORE

## 🟢 MUST HAVE (Giorno 1-2)
### Core Pipeline Funzionante
1. **Gateway Service** → Upload testo + status
2. **Text Chunker Integration** → Riuso esistente
3. **Basic Orchestrator** → 2-3 agenti essenziali
4. **Image Generation** → DALL-E per scene chiave
5. **Simple Video Assembly** → FFmpeg basic
6. **Frontend Minimal** → Upload + Progress + Results

## 🟡 SHOULD HAVE (Giorno 2-3)
### Enhancement Layer
1. **Audio Generation** → TTS per narrazione
2. **Better Video Sync** → Audio + Image timing
3. **Dashboard Polish** → Better UX
4. **Error Handling** → Robust error management

## 🔴 NICE TO HAVE (Se tempo)
### Advanced Features
1. **Unity Code Generator** → C# script generation
2. **Veo Integration** → AI-First mode
3. **MCP Protocol** → Real-time Unity sync
4. **Quality Validation** → Guardrail agenti

## 📊 DEMO SCENARIO
### Storia → Video in 5 minuti
1. Upload breve racconto (1-2 pagine)
2. Automatic scene analysis
3. Generate 3-5 immagini chiave
4. Assemble video con audio
5. Download/Share risultato

## 🛠️ TECH STACK SEMPLIFICATO
- **Backend**: FastAPI monolitico (non microservizi)
- **Orchestration**: LangGraph basic (3 agenti)
- **AI**: OpenAI + DALL-E (no Veo per ora)
- **Video**: FFmpeg basic assembly
- **Frontend**: React semplice
- **Storage**: Local filesystem (no S3)
- **DB**: SQLite (no PostgreSQL)
