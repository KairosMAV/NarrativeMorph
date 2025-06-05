"""
🎬 NarrativeMorph Gateway Service
FastAPI monolitico per hackathon - Storia → Video in 5 minuti
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
import asyncio
import logging
import os
import uuid
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from src.services.story_processor import StoryProcessor
from src.services.video_generator import VideoGenerator
from src.models.schemas import (
    StoryUploadResponse, ProcessingStatus, VideoResult
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
story_processor = None
video_generator = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan"""
    global story_processor, video_generator
    
    logger.info("🚀 Starting NarrativeMorph Gateway Service...")
    
    # Initialize database
    init_database()
    
    # Initialize services
    story_processor = StoryProcessor()
    video_generator = VideoGenerator()
    
    logger.info("✅ Gateway Service ready!")
    yield
    
    logger.info("🛑 Shutting down Gateway Service...")

# Create FastAPI app
app = FastAPI(
    title="NarrativeMorph Gateway",
    description="Transform stories into videos in 5 minutes",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_database():
    """Initialize SQLite database"""
    db_path = "data/gateway.db"
    os.makedirs("data", exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'uploaded',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            video_path TEXT,
            scenes_count INTEGER DEFAULT 0,
            progress INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "narrativemorph-gateway",
        "version": "1.0.0"
    }

@app.post("/api/v1/stories/upload", response_model=StoryUploadResponse)
async def upload_story(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = None
):
    """
    📖 Upload storia per trasformazione
    Demo: Upload breve racconto (1-2 pagine)
    """
    try:
        # Validate file
        if not file.filename.endswith(('.txt', '.md')):
            raise HTTPException(400, "Only .txt and .md files supported")
        
        # Read content
        content = await file.read()
        story_text = content.decode('utf-8')
        
        if len(story_text) < 50:
            raise HTTPException(400, "Story too short (minimum 50 characters)")
        
        # Generate project ID
        project_id = str(uuid.uuid4())
        project_title = title or file.filename
        
        # Save to database
        conn = sqlite3.connect("data/gateway.db")
        conn.execute("""
            INSERT INTO projects (id, title, content, status)
            VALUES (?, ?, ?, 'uploaded')
        """, (project_id, project_title, story_text))
        conn.commit()
        conn.close()
        
        # Start background processing
        background_tasks.add_task(process_story_to_video, project_id, story_text)
        
        logger.info(f"📖 Story uploaded: {project_id} - {project_title}")
        
        return StoryUploadResponse(
            project_id=project_id,
            title=project_title,
            status="processing",
            message="Story upload successful. Video generation started."
        )
        
    except Exception as e:
        logger.error(f"❌ Upload error: {e}")
        raise HTTPException(500, f"Upload failed: {str(e)}")

@app.get("/api/v1/projects/{project_id}/status", response_model=ProcessingStatus)
async def get_processing_status(project_id: str):
    """
    📊 Status del progetto
    """
    try:
        conn = sqlite3.connect("data/gateway.db")
        cursor = conn.execute("""
            SELECT title, status, progress, scenes_count, video_path, created_at
            FROM projects WHERE id = ?
        """, (project_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(404, "Project not found")
        
        title, status, progress, scenes_count, video_path, created_at = row
        
        return ProcessingStatus(
            project_id=project_id,
            title=title,
            status=status,
            progress=progress or 0,
            scenes_count=scenes_count or 0,
            video_ready=video_path is not None,
            created_at=created_at
        )
        
    except Exception as e:
        logger.error(f"❌ Status error: {e}")
        raise HTTPException(500, f"Status check failed: {str(e)}")

@app.get("/api/v1/projects/{project_id}/download")
async def download_video(project_id: str):
    """
    📥 Download video generato
    """
    try:
        conn = sqlite3.connect("data/gateway.db")
        cursor = conn.execute("""
            SELECT video_path, title FROM projects 
            WHERE id = ? AND video_path IS NOT NULL
        """, (project_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(404, "Video not found or not ready")
        
        video_path, title = row
        
        if not os.path.exists(video_path):
            raise HTTPException(404, "Video file not found")
        
        return FileResponse(
            video_path,
            media_type="video/mp4",
            filename=f"{title.replace(' ', '_')}.mp4"
        )
        
    except Exception as e:
        logger.error(f"❌ Download error: {e}")
        raise HTTPException(500, f"Download failed: {str(e)}")

@app.get("/api/v1/projects", response_model=List[ProcessingStatus])
async def list_projects():
    """
    📋 Lista tutti i progetti
    """
    try:
        conn = sqlite3.connect("data/gateway.db")
        cursor = conn.execute("""
            SELECT id, title, status, progress, scenes_count, video_path, created_at
            FROM projects ORDER BY created_at DESC LIMIT 20
        """)
        rows = cursor.fetchall()
        conn.close()
        
        projects = []
        for row in rows:
            project_id, title, status, progress, scenes_count, video_path, created_at = row
            projects.append(ProcessingStatus(
                project_id=project_id,
                title=title,
                status=status,
                progress=progress or 0,
                scenes_count=scenes_count or 0,
                video_ready=video_path is not None,
                created_at=created_at
            ))
        
        return projects
        
    except Exception as e:
        logger.error(f"❌ List error: {e}")
        raise HTTPException(500, f"List failed: {str(e)}")

async def process_story_to_video(project_id: str, story_text: str):
    """
    🎬 Background processing: Storia → Video
    Pipeline completo in 5 minuti
    """
    try:
        logger.info(f"🔄 Starting processing for {project_id}")
        
        # Update status
        update_project_status(project_id, "analyzing", 10)
        
        # 1. Scene Analysis (30s)
        scenes = await story_processor.analyze_scenes(story_text)
        logger.info(f"📝 Analyzed {len(scenes)} scenes")
        
        update_project_status(project_id, "generating_images", 30, len(scenes))
        
        # 2. Image Generation (2-3 min)
        images = await story_processor.generate_scene_images(scenes)
        logger.info(f"🖼️ Generated {len(images)} images")
        
        update_project_status(project_id, "generating_audio", 60)
        
        # 3. Audio Generation (1 min)
        audio_segments = await story_processor.generate_audio(scenes)
        logger.info(f"🔊 Generated {len(audio_segments)} audio segments")
        
        update_project_status(project_id, "assembling_video", 80)
        
        # 4. Video Assembly (1 min)
        video_path = await video_generator.create_video(
            project_id, scenes, images, audio_segments
        )
        logger.info(f"🎥 Video created: {video_path}")
        
        # Final update
        update_project_status(project_id, "completed", 100, video_path=video_path)
        
        logger.info(f"✅ Processing completed for {project_id}")
        
    except Exception as e:
        logger.error(f"❌ Processing error for {project_id}: {e}")
        update_project_status(project_id, "failed", 0, error=str(e))

def update_project_status(
    project_id: str, 
    status: str, 
    progress: int, 
    scenes_count: int = None,
    video_path: str = None,
    error: str = None
):
    """Update project status in database"""
    try:
        conn = sqlite3.connect("data/gateway.db")
        
        if video_path:
            conn.execute("""
                UPDATE projects 
                SET status = ?, progress = ?, video_path = ?
                WHERE id = ?
            """, (status, progress, video_path, project_id))
        elif scenes_count:
            conn.execute("""
                UPDATE projects 
                SET status = ?, progress = ?, scenes_count = ?
                WHERE id = ?
            """, (status, progress, scenes_count, project_id))
        else:
            conn.execute("""
                UPDATE projects 
                SET status = ?, progress = ?
                WHERE id = ?
            """, (status, progress, project_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"❌ Status update error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
