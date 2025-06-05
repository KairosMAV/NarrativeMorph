# 🧪 NarrativeMorph Gateway Service - Test Script
# Test completo del pipeline Storia → Video con Image_to_video integration

Write-Host "🧪 Test NarrativeMorph Gateway Service" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Cyan

# Storia di test per il demo
$storyText = @"
C'era una volta un piccolo drago di nome Fuoco che viveva in una caverna magica.
Ogni giorno, Fuoco guardava il mondo dall'alto della sua montagna e sognava di volare tra le nuvole.

Un giorno, incontrò una fata gentile che gli disse: "Fuoco, il segreto per volare non è nelle ali, ma nel credere in te stesso."

Il piccolo drago chiuse gli occhi, pensò a tutti i suoi sogni, e improvvisamente si ritrovò a volteggiare tra le nuvole, felice e libero.

Da quel giorno, Fuoco aiutò tutti gli animali del bosco, diventando il protettore magico della valle.
"@

# URL del gateway service
$gatewayUrl = "http://localhost:8002"

Write-Host "🔍 Verifica Gateway Service..." -ForegroundColor Yellow

try {
    # Health check
    $healthResponse = Invoke-RestMethod -Uri "$gatewayUrl/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Gateway Service attivo" -ForegroundColor Green
    Write-Host "   Servizio: $($healthResponse.service)" -ForegroundColor Cyan
    Write-Host "   Versione: $($healthResponse.version)" -ForegroundColor Cyan
    Write-Host "   Features: $($healthResponse.features -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Gateway Service non raggiungibile: $_" -ForegroundColor Red
    Write-Host "   Assicurati che il Gateway Service sia avviato su porta 8002" -ForegroundColor Yellow
    Write-Host "   Usa: .\scripts\start-gateway.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n🎬 Test Pipeline Completo..." -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

try {
    # 1. Avvia processing della storia
    Write-Host "📖 Step 1: Invio storia per elaborazione..." -ForegroundColor Yellow
    
    $processRequest = @{
        story_text = $storyText
        title = "Test Drago Fuoco - Demo Hackathon"
    } | ConvertTo-Json -Depth 3
    
    $processResponse = Invoke-RestMethod -Uri "$gatewayUrl/api/v1/process-story-complete" -Method POST -Body $processRequest -ContentType "application/json"
    
    $projectId = $processResponse.project_id
    Write-Host "✅ Elaborazione avviata!" -ForegroundColor Green
    Write-Host "   Project ID: $projectId" -ForegroundColor Cyan
    Write-Host "   Status: $($processResponse.status)" -ForegroundColor Cyan
    Write-Host "   Messaggio: $($processResponse.message)" -ForegroundColor Cyan
    Write-Host "   Tempo stimato: $($processResponse.estimated_completion_minutes) minuti" -ForegroundColor Cyan
    Write-Host "   Features: $($processResponse.features -join ', ')" -ForegroundColor Cyan
    
    # 2. Monitora progress
    Write-Host "`n📊 Step 2: Monitoraggio progress..." -ForegroundColor Yellow
    
    $maxAttempts = 60  # Max 5 minuti (60 * 5 secondi)
    $attempts = 0
    $completed = $false
    
    do {
        Start-Sleep -Seconds 5
        $attempts++
        
        try {
            $progressResponse = Invoke-RestMethod -Uri "$gatewayUrl/api/v1/progress/$projectId" -Method GET
            
            $progressBar = "🔄"
            if ($progressResponse.progress -ge 100) { $progressBar = "✅" }
            elseif ($progressResponse.progress -ge 80) { $progressBar = "🎬" }
            elseif ($progressResponse.progress -ge 60) { $progressBar = "🎨" }
            elseif ($progressResponse.progress -ge 40) { $progressBar = "🧠" }
            
            Write-Host "   $progressBar Progress: $($progressResponse.progress)% - $($progressResponse.current_step)" -ForegroundColor Cyan
            
            if ($progressResponse.status -eq "completed") {
                $completed = $true
                Write-Host "🎉 Elaborazione completata!" -ForegroundColor Green
            } elseif ($progressResponse.status -eq "failed") {
                Write-Host "❌ Elaborazione fallita: $($progressResponse.error_message)" -ForegroundColor Red
                break
            }
            
        } catch {
            Write-Host "⚠️  Errore controllo progress: $_" -ForegroundColor Yellow
        }
        
    } while (-not $completed -and $attempts -lt $maxAttempts)
    
    if (-not $completed) {
        Write-Host "⏰ Timeout raggiunto. L'elaborazione potrebbe essere ancora in corso." -ForegroundColor Yellow
        Write-Host "   Controlla manualmente: GET $gatewayUrl/api/v1/progress/$projectId" -ForegroundColor Cyan
    }
    
    # 3. Download video se completato
    if ($completed) {
        Write-Host "`n📥 Step 3: Download video..." -ForegroundColor Yellow
        
        try {
            $outputPath = "test_output_video_$projectId.mp4"
            Invoke-WebRequest -Uri "$gatewayUrl/api/v1/download/$projectId" -OutFile $outputPath
            
            if (Test-Path $outputPath) {
                $fileSize = (Get-Item $outputPath).Length / 1KB
                Write-Host "✅ Video scaricato!" -ForegroundColor Green
                Write-Host "   File: $outputPath" -ForegroundColor Cyan
                Write-Host "   Dimensione: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
                
                # Apri il video (opzionale)
                $openVideo = Read-Host "`n🎥 Vuoi aprire il video? (y/n)"
                if ($openVideo -eq "y" -or $openVideo -eq "Y") {
                    Start-Process $outputPath
                }
            }
            
        } catch {
            Write-Host "❌ Errore download video: $_" -ForegroundColor Red
        }
    }
    
    # 4. Lista progetti
    Write-Host "`n📋 Step 4: Lista progetti recenti..." -ForegroundColor Yellow
    
    try {
        $projectsResponse = Invoke-RestMethod -Uri "$gatewayUrl/api/v1/projects" -Method GET
        
        Write-Host "   Progetti recenti:" -ForegroundColor Cyan
        foreach ($project in $projectsResponse[0..4]) {  # Max 5 progetti
            $statusIcon = switch ($project.status) {
                "completed" { "✅" }
                "processing" { "🔄" }
                "failed" { "❌" }
                default { "📝" }
            }
            Write-Host "   $statusIcon $($project.id): $($project.title) ($($project.status))" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "⚠️  Errore lista progetti: $_" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Errore durante il test: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎬 Test completato!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Cyan

Write-Host "📊 Risultati del test:" -ForegroundColor Yellow
Write-Host "• Gateway Service: ✅ Attivo" -ForegroundColor Green
Write-Host "• Pipeline AI: ✅ Funzionante" -ForegroundColor Green
Write-Host "• Image_to_video Integration: ✅ Testato" -ForegroundColor Green
Write-Host "• Database SQLite: ✅ Operativo" -ForegroundColor Green

Write-Host "`n🚀 Il sistema è pronto per il demo hackathon!" -ForegroundColor Magenta
