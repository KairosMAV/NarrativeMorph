# 🚀 NarrativeMorph Gateway Service - Start Script
# PowerShell script per avviare il gateway service con Image_to_video integration

Write-Host "🎬 Avvio NarrativeMorph Gateway Service..." -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Cyan

# Check se siamo nella directory corretta
if (-not (Test-Path "gateway-service")) {
    Write-Host "❌ Errore: Esegui questo script dalla directory root di NarrativeMorph" -ForegroundColor Red
    Write-Host "   Posizione corrente: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Directory richiesta: .../NarrativeMorph/" -ForegroundColor Yellow
    exit 1
}

# Set environment variables per hackathon
Write-Host "🔧 Configurazione environment per hackathon..." -ForegroundColor Yellow

# Copia .env se non esiste
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
        Write-Host "✅ File .env creato da template" -ForegroundColor Green
    }
}

# Environment variables per demo
$env:OPENAI_API_KEY = "mock-key"  # Usa mock per demo
$env:PYTHONPATH = "$PWD;$PWD\gateway-service;$PWD\text-chunker\src;$PWD\book-to-game\src"
$env:ENVIRONMENT = "development"
$env:LOG_LEVEL = "INFO"

Write-Host "📂 PYTHONPATH: $env:PYTHONPATH" -ForegroundColor Cyan

# Verifica dipendenze Python
Write-Host "`n🐍 Verifica dipendenze Python..." -ForegroundColor Yellow

try {
    # Check se il virtual environment esiste
    if (Test-Path "gateway-service\venv\Scripts\activate.ps1") {
        Write-Host "✅ Virtual environment trovato, attivazione..." -ForegroundColor Green
        & "gateway-service\venv\Scripts\activate.ps1"
    } else {
        Write-Host "⚠️  Virtual environment non trovato, uso Python globale" -ForegroundColor Yellow
    }
    
    # Installa dipendenze se necessario
    $requirements = "gateway-service\requirements.txt"
    if (Test-Path $requirements) {
        Write-Host "📦 Installazione dipendenze..." -ForegroundColor Yellow
        pip install -r $requirements --quiet
        Write-Host "✅ Dipendenze installate" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️  Errore installazione dipendenze: $_" -ForegroundColor Yellow
    Write-Host "   Continuando con dipendenze esistenti..." -ForegroundColor Yellow
}

# Verifica servizi richiesti
Write-Host "`n🔍 Verifica servizi di supporto..." -ForegroundColor Yellow

# Check Text Chunker
try {
    $textChunkerStatus = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Text Chunker service attivo (porta 8001)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Text Chunker service non disponibile (porta 8001)" -ForegroundColor Yellow
    Write-Host "   Il gateway userà fallback interno per l'analisi del testo" -ForegroundColor Cyan
}

# Check Book-to-Game service
try {
    $bookToGameStatus = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Book-to-Game service attivo (porta 8000)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Book-to-Game service non disponibile (porta 8000)" -ForegroundColor Yellow
    Write-Host "   Il gateway userà AI agents interni" -ForegroundColor Cyan
}

# Check Image_to_video service
if (Test-Path "Image_to_video\simple_converter.py") {
    Write-Host "✅ Image_to_video service trovato" -ForegroundColor Green
} else {
    Write-Host "⚠️  Image_to_video service non trovato" -ForegroundColor Yellow
    Write-Host "   Il gateway userà video generator interno" -ForegroundColor Cyan
}

# Crea directory di output
Write-Host "`n📁 Preparazione directory di lavoro..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "gateway-service\outputs" | Out-Null
New-Item -ItemType Directory -Force -Path "gateway-service\uploads" | Out-Null
Write-Host "✅ Directory outputs e uploads create" -ForegroundColor Green

# Avvia il gateway service
Write-Host "`n🚀 Avvio Gateway Service (porta 8002)..." -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Cyan

Set-Location "gateway-service"

try {
    Write-Host "🎬 NarrativeMorph Gateway Service in avvio..." -ForegroundColor Magenta
    Write-Host "   URL: http://localhost:8002" -ForegroundColor Cyan
    Write-Host "   Docs: http://localhost:8002/docs" -ForegroundColor Cyan
    Write-Host "   Demo endpoint: POST /api/v1/process-story-complete" -ForegroundColor Green
    Write-Host "`n   Features attive:" -ForegroundColor Yellow
    Write-Host "   • 🧠 AI Scene Analysis" -ForegroundColor Cyan
    Write-Host "   • 🎨 DALL-E Image Generation" -ForegroundColor Cyan
    Write-Host "   • 🎥 Image_to_video Integration" -ForegroundColor Cyan
    Write-Host "   • 🎙️ Audio Narration (gTTS)" -ForegroundColor Cyan
    Write-Host "   • 🗄️ SQLite Database" -ForegroundColor Cyan
    Write-Host "`n📊 Pipeline Demo: Storia → Video in ~5 minuti!" -ForegroundColor Green
    Write-Host "`nPremere Ctrl+C per fermare il servizio`n" -ForegroundColor Yellow
    
    # Avvia con uvicorn
    python -m uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload --log-level info
    
} catch {
    Write-Host "`n❌ Errore avvio Gateway Service: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verifica che Python sia installato" -ForegroundColor Cyan
    Write-Host "2. Verifica che le dipendenze siano installate: pip install -r requirements.txt" -ForegroundColor Cyan
    Write-Host "3. Verifica che la porta 8002 sia libera" -ForegroundColor Cyan
    Write-Host "4. Controlla i log sopra per errori specifici" -ForegroundColor Cyan
} finally {
    Set-Location ".."
    Write-Host "`n🛑 Gateway Service fermato." -ForegroundColor Yellow
}
