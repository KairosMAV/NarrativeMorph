"""
🚀 NarrativeMorph - FastAPI Main Application
Story-to-Video Transformation Platform
"""
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine
from app.routers import projects, scenes, media, processing
from app.core.logging import setup_logging
from app.services.video_service import cogvideox_service

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""    # Startup
    logger.info("🚀 Starting NarrativeMorph API...")
    
    # Database is already initialized via Alembic migrations
    logger.info("📊 Database ready")
      # Initialize services
    logger.info("🤖 Initializing CrewAI agents...")
    # Agent initialization will be added here
    
    logger.info("🎥 Initializing CogVideoX service...")
    try:
        await cogvideox_service.initialize()
        logger.info("✅ CogVideoX service ready")
    except Exception as e:
        logger.warning(f"⚠️ CogVideoX initialization failed: {e}")
    
    logger.info("🚀 API startup complete")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down NarrativeMorph API...")


# Create FastAPI app
app = FastAPI(    title="NarrativeMorph API",
    description="Transform stories into interactive video experiences using AI",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "service": "narrativemorph-api",
        "version": "0.1.0",
        "environment": settings.environment
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "🎬 Welcome to NarrativeMorph API",
        "description": "Transform stories into interactive video experiences",
        "docs": "/docs" if settings.debug else "Documentation disabled in production",
        "health": "/health"
    }


# Include routers
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(scenes.router, prefix="/api/v1/scenes", tags=["scenes"])
app.include_router(media.router, prefix="/api/v1/media", tags=["media"])
app.include_router(processing.router, prefix="/api/v1/processing", tags=["processing"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
