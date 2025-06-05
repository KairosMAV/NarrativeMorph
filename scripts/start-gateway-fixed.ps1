# 🚀 NarrativeMorph Gateway Service - PowerShell Startup Fixed
# Avvia il gateway service per hackathon demo

Write-Host "🎬 Starting NarrativeMorph Gateway Service..." -ForegroundColor Green
Write-Host "📊 Demo: Storia -> Video in 5 minuti" -ForegroundColor Yellow

# Check current directory
$currentDir = Get-Location
Write-Host "📂 Current directory: $currentDir" -ForegroundColor Cyan

# Set working directory to gateway-service
$gatewayDir = Join-Path $currentDir "gateway-service"
if (Test-Path $gatewayDir) {
    Set-Location $gatewayDir
    Write-Host "✅ Changed to gateway-service directory" -ForegroundColor Green
} else {
    Write-Host "❌ Gateway service directory not found: $gatewayDir" -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "data" | Out-Null
New-Item -ItemType Directory -Force -Path "data/videos" | Out-Null
New-Item -ItemType Directory -Force -Path "data/images" | Out-Null
New-Item -ItemType Directory -Force -Path "data/audio" | Out-Null
New-Item -ItemType Directory -Force -Path "data/temp" | Out-Null

# Environment variables for demo
$env:OPENAI_API_KEY = "mock-key"
$env:ENVIRONMENT = "development"
$env:LOG_LEVEL = "INFO"
$env:DEBUG = "true"

Write-Host "🔧 Environment configured for demo mode" -ForegroundColor Green

# Check Python
Write-Host "🐍 Checking Python environment..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt --quiet
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Failed to install some dependencies, continuing..." -ForegroundColor Yellow
}

# Check FFmpeg
Write-Host "🎥 Checking FFmpeg..." -ForegroundColor Yellow
try {
    $ffmpegCheck = ffmpeg -version 2>&1
    Write-Host "✅ FFmpeg available" -ForegroundColor Green
} catch {
    Write-Host "⚠️ FFmpeg not found. Video generation may use fallback methods." -ForegroundColor Yellow
}

# Start the service
Write-Host ""
Write-Host "🚀 Starting Gateway Service on http://localhost:8000..." -ForegroundColor Green
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Demo Pipeline:" -ForegroundColor Yellow
Write-Host "  1. Upload story -> POST /api/v1/stories/upload" -ForegroundColor White
Write-Host "  2. Check status -> GET /api/v1/projects/{id}/status" -ForegroundColor White
Write-Host "  3. Download video -> GET /api/v1/projects/{id}/download" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

try {
    # Start the FastAPI server
    python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
} catch {
    Write-Host "❌ Failed to start service: $_" -ForegroundColor Red
    
    # Try alternative startup method
    Write-Host "🔄 Trying direct execution..." -ForegroundColor Yellow
    try {
        python src/main.py
    } catch {
        Write-Host "❌ Direct execution also failed: $_" -ForegroundColor Red
        Write-Host "Please check that all dependencies are installed." -ForegroundColor Yellow
    }
} finally {
    Set-Location $currentDir
    Write-Host "🛑 Gateway Service stopped." -ForegroundColor Yellow
}
