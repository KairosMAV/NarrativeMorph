#!/bin/bash

# 🚀 NarrativeMorph Hackathon Startup Script
# Quick setup for the first 6 hours

echo "🎬 Starting NarrativeMorph Hackathon Setup..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo -e "${BLUE}📋 Setting up environment...${NC}"

# Copy environment template if .env doesn't exist
if [ ! -f .env ]; then
    cp .env.template .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi

# Create necessary directories
mkdir -p consolidated-api/logs
mkdir -p consolidated-api/media/generated
mkdir -p database/data
mkdir -p dashboard-ui/build

echo -e "${BLUE}🔧 Building Docker containers...${NC}"

# Build and start services
docker-compose build --parallel
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo -e "${BLUE}🚀 Starting services...${NC}"

# Start the stack
docker-compose up -d

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${BLUE}📊 Running database migrations...${NC}"
docker-compose exec api alembic upgrade head

# Check if services are healthy
echo -e "${BLUE}🏥 Checking service health...${NC}"
sleep 5

# Check API health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed, but service might still be starting...${NC}"
fi

# Check UI (if built)
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ UI is running${NC}"
else
    echo -e "${YELLOW}⚠️  UI might still be building...${NC}"
fi

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "📍 Access points:"
echo "  • API: http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • UI: http://localhost:3000"
echo "  • Database: localhost:5432"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart API: docker-compose restart api"
echo ""
echo "🚀 Ready for hackathon development!"
