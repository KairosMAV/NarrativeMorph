# Quick Setup Script per Hackathon - Windows PowerShell
Write-Host "🚀 Narrative Morph - Hackathon Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env"
    Write-Host "⚠️  Please edit .env with your API keys before continuing!" -ForegroundColor Red
    Write-Host "   Required: OPENAI_API_KEY, ELEVENLABS_API_KEY" -ForegroundColor Red
    exit 1
}

# Create storage directories
Write-Host "📁 Creating storage directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "storage\media", "storage\videos", "storage\audio", "storage\images", "storage\temp" | Out-Null
New-Item -ItemType Directory -Force -Path "uploads" | Out-Null

# Check Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Building and starting services..." -ForegroundColor Cyan
docker-compose up --build -d

Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health checks
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan

# Check API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API service is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API service is not responding" -ForegroundColor Red
}

# Check Redis
try {
    $redisCheck = docker-compose exec redis redis-cli ping 2>$null
    if ($redisCheck -like "*PONG*") {
        Write-Host "✅ Redis is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Redis is not responding" -ForegroundColor Red
}

# Check UI
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ UI service is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ UI service is not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 API: http://localhost:8000" -ForegroundColor Cyan  
Write-Host "📊 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎬 Ready to transform stories into videos!" -ForegroundColor Magenta
