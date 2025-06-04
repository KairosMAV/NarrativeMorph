"""
🗄️ NarrativeMorph - Database Models
PostgreSQL + SQLAlchemy ORM Models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, Float, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from typing import Optional
import uuid

Base = declarative_base()


class ProjectStatus(enum.Enum):
    """Project processing status"""
    CREATED = "created"
    PROCESSING_TEXT = "processing_text"
    GENERATING_SCENES = "generating_scenes"
    GENERATING_VIDEOS = "generating_videos"
    GENERATING_UNITY = "generating_unity"
    COMPLETED = "completed"
    FAILED = "failed"


class MediaType(enum.Enum):
    """Media asset types"""
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    UNITY_PROJECT = "unity_project"
    TEXT_CHUNK = "text_chunk"


class User(Base):
    """User model - simplified for hackathon"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")


class Project(Base):
    """Main project entity"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    original_text = Column(Text, nullable=False)
    
    # Status & Processing
    status = Column(Enum(ProjectStatus), default=ProjectStatus.CREATED)
    progress_percentage = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    
    # Settings & Configuration
    generation_settings = Column(JSON, nullable=True)  # Store CrewAI settings, video params, etc.
    
    # Metadata
    total_scenes = Column(Integer, default=0)
    total_videos = Column(Integer, default=0)
    total_images = Column(Integer, default=0)
    estimated_duration_minutes = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processing_started_at = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign Keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    scenes = relationship("Scene", back_populates="project", cascade="all, delete-orphan")
    media_assets = relationship("MediaAsset", back_populates="project", cascade="all, delete-orphan")
    crew_tasks = relationship("CrewTask", back_populates="project", cascade="all, delete-orphan")


class Scene(Base):
    """Individual scene from text analysis"""
    __tablename__ = "scenes"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Scene Content (from your text-chunker)
    elementi_narrativi = Column(Text, nullable=False)
    personaggi = Column(Text, nullable=False)
    ambientazione = Column(Text, nullable=False)
    mood_vibe = Column(Text, nullable=False)
    azione_in_corso = Column(Text, nullable=False)
    
    # Processing metadata
    scene_number = Column(Integer, nullable=False)  # Order in the story
    word_count = Column(Integer, nullable=True)
    estimated_duration_seconds = Column(Float, nullable=True)
    
    # Generation flags
    image_generated = Column(Boolean, default=False)
    video_generated = Column(Boolean, default=False)
    audio_generated = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="scenes")
    media_assets = relationship("MediaAsset", back_populates="scene")


class MediaAsset(Base):
    """Generated media assets (images, videos, audio, Unity projects)"""
    __tablename__ = "media_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    scene_id = Column(Integer, ForeignKey("scenes.id"), nullable=True)  # Null for project-level assets
    
    # Asset Information
    asset_type = Column(Enum(MediaType), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    
    # Generation metadata
    generation_prompt = Column(Text, nullable=True)  # The prompt used for generation
    generation_params = Column(JSON, nullable=True)  # Model parameters used
    generation_model = Column(String(100), nullable=True)  # Which AI model was used
    generation_duration_seconds = Column(Float, nullable=True)
    
    # Asset-specific metadata
    width = Column(Integer, nullable=True)  # For images/videos
    height = Column(Integer, nullable=True)  # For images/videos  
    duration_seconds = Column(Float, nullable=True)  # For videos/audio
    frame_rate = Column(Float, nullable=True)  # For videos
    
    # Status
    is_primary = Column(Boolean, default=False)  # Primary asset for the scene
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="media_assets")
    scene = relationship("Scene", back_populates="media_assets")


class CrewTask(Base):
    """CrewAI task tracking and monitoring"""
    __tablename__ = "crew_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Task Information
    task_name = Column(String(100), nullable=False)  # e.g., "text_analysis", "video_generation"
    agent_name = Column(String(100), nullable=False)  # CrewAI agent name
    task_description = Column(Text, nullable=True)
    
    # Status & Progress
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    progress_percentage = Column(Float, default=0.0)
    result = Column(JSON, nullable=True)  # Task result/output
    error_message = Column(Text, nullable=True)
    
    # Performance Metrics
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    
    # Input/Output
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="crew_tasks")


class BookCatalog(Base):
    """Pre-loaded book catalog for quick demos"""
    __tablename__ = "book_catalog"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    genre = Column(String(50), nullable=True)
    language = Column(String(10), default="en")
    
    # Content
    full_text = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=True)
    estimated_reading_time_minutes = Column(Integer, nullable=True)
    
    # Demo settings
    is_featured = Column(Boolean, default=False)
    difficulty_level = Column(String(20), default="medium")  # easy, medium, hard
    expected_scenes = Column(Integer, nullable=True)
    
    # Metadata
    source_url = Column(String(500), nullable=True)
    copyright_status = Column(String(50), default="public_domain")
    added_at = Column(DateTime(timezone=True), server_default=func.now())


# 📊 Database Indexes for Performance
from sqlalchemy import Index

# Performance indexes
Index('idx_projects_owner_status', Project.owner_id, Project.status)
Index('idx_projects_created_at', Project.created_at.desc())
Index('idx_scenes_project_scene_number', Scene.project_id, Scene.scene_number)
Index('idx_media_assets_project_type', MediaAsset.project_id, MediaAsset.asset_type)
Index('idx_crew_tasks_project_status', CrewTask.project_id, CrewTask.status)
Index('idx_book_catalog_featured', BookCatalog.is_featured)
