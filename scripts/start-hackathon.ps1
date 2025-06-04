# 🚀 NarrativeMorph Hackathon Startup Script (PowerShell)
# Quick setup for the first 6 hours

Write-Host "🎬 Starting NarrativeMorph Hackathon Setup..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Setting up environment..." -ForegroundColor Blue

# Copy environment template if .env doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.template" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
}

# Create necessary directories
$directories = @(
    "consolidated-api/logs",
    "consolidated-api/media/generated", 
    "database/data",
    "dashboard-ui/build"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "🔧 Building Docker containers..." -ForegroundColor Blue

# Build and start services
docker-compose build --parallel
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting services..." -ForegroundColor Blue

# Start the stack
docker-compose up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Run database migrations
Write-Host "📊 Running database migrations..." -ForegroundColor Blue
docker-compose exec api alembic upgrade head

# Check if services are healthy
Write-Host "🏥 Checking service health..." -ForegroundColor Blue
Start-Sleep -Seconds 5

# Check API health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  API health check failed, but service might still be starting..." -ForegroundColor Yellow
}

# Check UI
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ UI is running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  UI might still be building..." -ForegroundColor Yellow
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access points:"
Write-Host "  • API: http://localhost:8000"
Write-Host "  • API Docs: http://localhost:8000/docs"
Write-Host "  • UI: http://localhost:3000"
Write-Host "  • Database: localhost:5432"
Write-Host ""
Write-Host "🔧 Useful commands:"
Write-Host "  • View logs: docker-compose logs -f"
Write-Host "  • Stop services: docker-compose down"
Write-Host "  • Restart API: docker-compose restart api"
Write-Host ""
Write-Host "🚀 Ready for hackathon development!" -ForegroundColor Cyan
