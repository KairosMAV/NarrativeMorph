#!/bin/bash
# Quick Setup Script per Hackathon

echo "🚀 Narrative Morph - Hackathon Setup"
echo "====================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "⚠️  Please edit .env with your API keys before continuing!"
    echo "   Required: OPENAI_API_KEY, ELEVENLABS_API_KEY"
    exit 1
fi

# Create storage directories
echo "📁 Creating storage directories..."
mkdir -p storage/{media,videos,audio,images,temp}
mkdir -p uploads

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🔧 Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Health checks
echo "🏥 Checking service health..."

# Check API
if curl -f http://localhost:8000/health 2>/dev/null; then
    echo "✅ API service is healthy"
else
    echo "❌ API service is not responding"
fi

# Check Redis
if docker-compose exec redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is not responding"
fi

# Check UI
if curl -f http://localhost:3000 2>/dev/null; then
    echo "✅ UI service is healthy"
else
    echo "❌ UI service is not responding"
fi

echo ""
echo "🎉 Setup complete!"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "🎬 Ready to transform stories into videos!"
