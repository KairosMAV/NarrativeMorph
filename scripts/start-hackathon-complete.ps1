# 🚀 NarrativeMorph - Sistema Completo Hackathon
# Script master per avviare tutti i servizi per il demo

Write-Host "🎬 NARRATIVEMORPH - AVVIO SISTEMA COMPLETO" -ForegroundColor Magenta
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "🎯 DEMO SCENARIO: Storia → Video in 5 minuti" -ForegroundColor Green
Write-Host "Features attive:" -ForegroundColor Yellow
Write-Host "• 🧠 AI Scene Analysis (3 agenti essenziali)" -ForegroundColor Cyan
Write-Host "• 🎨 DALL-E Image Generation" -ForegroundColor Cyan
Write-Host "• 🎥 Image_to_video Service Integration" -ForegroundColor Cyan
Write-Host "• 🎙️ Audio Narration (gTTS)" -ForegroundColor Cyan
Write-Host "• 🗄️ SQLite Database" -ForegroundColor Cyan
Write-Host "• 🌐 React Frontend" -ForegroundColor Cyan

# Verifica directory
if (-not (Test-Path "gateway-service") -or -not (Test-Path "frontend") -or -not (Test-Path "Image_to_video")) {
    Write-Host "❌ Errore: Esegui questo script dalla directory root di NarrativeMorph" -ForegroundColor Red
    Write-Host "   Directory richieste: gateway-service, frontend, Image_to_video" -ForegroundColor Yellow
    exit 1
}

# Menu di scelta
Write-Host "`n🔧 Scegli modalità di avvio:" -ForegroundColor Yellow
Write-Host "1. 🚀 Avvio completo (Backend + Frontend + Test)" -ForegroundColor Green
Write-Host "2. 🛠️  Solo Backend (Gateway Service)" -ForegroundColor Cyan
Write-Host "3. 🌐 Solo Frontend" -ForegroundColor Cyan
Write-Host "4. 🧪 Solo Test Pipeline" -ForegroundColor Cyan
Write-Host "5. ❌ Exit" -ForegroundColor Red

$choice = Read-Host "`nSelezione (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 AVVIO COMPLETO SISTEMA..." -ForegroundColor Magenta
        
        # Avvia Gateway Service in background
        Write-Host "`n🛠️  Avvio Gateway Service..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\scripts\start-gateway.ps1" -WindowStyle Normal
        
        # Aspetta che il gateway sia pronto
        Write-Host "⏱️  Attendo che Gateway Service sia pronto..." -ForegroundColor Yellow
        $maxWait = 30
        $waited = 0
        do {
            Start-Sleep -Seconds 2
            $waited += 2
            try {
                $health = Invoke-RestMethod -Uri "http://localhost:8002/health" -TimeoutSec 3 -ErrorAction Stop
                Write-Host "✅ Gateway Service pronto!" -ForegroundColor Green
                break
            } catch {
                Write-Host "." -NoNewline -ForegroundColor Yellow
            }
        } while ($waited -lt $maxWait)
        
        if ($waited -ge $maxWait) {
            Write-Host "`n⚠️  Gateway Service impiega più tempo del previsto..." -ForegroundColor Yellow
        }
        
        # Avvia Frontend
        Write-Host "`n🌐 Avvio Frontend React..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start" -WindowStyle Normal
        
        # Aspetta e avvia test
        Start-Sleep -Seconds 5
        Write-Host "`n🧪 Avvio Test Pipeline..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\scripts\test-gateway.ps1" -WindowStyle Normal
        
        Write-Host "`n🎉 Sistema completo avviato!" -ForegroundColor Magenta
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host "🛠️  Gateway Service: http://localhost:8002" -ForegroundColor Green
        Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Green
        Write-Host "📚 API Docs: http://localhost:8002/docs" -ForegroundColor Green
        Write-Host "`n🎬 Pronto per il demo hackathon!" -ForegroundColor Magenta
    }
    
    "2" {
        Write-Host "`n🛠️  AVVIO SOLO BACKEND..." -ForegroundColor Green
        & ".\scripts\start-gateway.ps1"
    }
    
    "3" {
        Write-Host "`n🌐 AVVIO SOLO FRONTEND..." -ForegroundColor Green
        Set-Location "frontend"
        try {
            npm start
        } finally {
            Set-Location ".."
        }
    }
    
    "4" {
        Write-Host "`n🧪 AVVIO SOLO TEST..." -ForegroundColor Green
        & ".\scripts\test-gateway.ps1"
    }
    
    "5" {
        Write-Host "`n👋 Uscita..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "`n❌ Selezione non valida" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📋 COMANDI UTILI:" -ForegroundColor Yellow
Write-Host "• Test pipeline: .\scripts\test-gateway.ps1" -ForegroundColor Cyan
Write-Host "• Solo gateway: .\scripts\start-gateway.ps1" -ForegroundColor Cyan
Write-Host "• Health check: curl http://localhost:8002/health" -ForegroundColor Cyan
Write-Host "• Frontend: cd frontend && npm start" -ForegroundColor Cyan

Write-Host "`n🎯 ENDPOINT PRINCIPALE DEMO:" -ForegroundColor Green
Write-Host "POST http://localhost:8002/api/v1/process-story-complete" -ForegroundColor Magenta
Write-Host "Body: { 'story_text': 'La tua storia...', 'title': 'Titolo' }" -ForegroundColor Cyan

Write-Host "`n🚀 Sistema pronto per hackathon! Buona fortuna! 🍀" -ForegroundColor Magenta
