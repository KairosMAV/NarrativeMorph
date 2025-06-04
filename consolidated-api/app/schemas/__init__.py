"""
📋 NarrativeMorph - Pydantic Schemas
Request/Response models for API endpoints
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.models import ProjectStatus, MediaType


# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common configuration"""
    model_config = ConfigDict(from_attributes=True)


# User schemas
class UserBase(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


# Project schemas
class ProjectBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    original_text: str = Field(..., min_length=10)


class ProjectCreate(ProjectBase):
    generation_settings: Optional[Dict[str, Any]] = None


class ProjectUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    generation_settings: Optional[Dict[str, Any]] = None


class ProjectResponse(ProjectBase):
    id: int
    uuid: str
    status: ProjectStatus
    progress_percentage: float = 0.0
    error_message: Optional[str] = None
    total_scenes: int = 0
    total_videos: int = 0
    total_images: int = 0
    estimated_duration_minutes: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    owner_id: int


class ProjectListResponse(BaseSchema):
    projects: List[ProjectResponse]
    total: int
    page: int
    limit: int


# Scene schemas
class SceneBase(BaseSchema):
    elementi_narrativi: str
    personaggi: str
    ambientazione: str
    azioni: str
    emozioni: str
    dialoghi: Optional[str] = None
    note_regia: Optional[str] = None


class SceneCreate(SceneBase):
    project_id: int


class SceneResponse(SceneBase):
    id: int
    project_id: int
    scene_number: int
    duration_seconds: Optional[float] = None
    video_prompt: Optional[str] = None
    audio_prompt: Optional[str] = None
    unity_prompt: Optional[str] = None
    created_at: datetime


# Media Asset schemas
class MediaAssetBase(BaseSchema):
    filename: str
    media_type: MediaType
    file_size_bytes: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class MediaAssetCreate(MediaAssetBase):
    project_id: int
    scene_id: Optional[int] = None


class MediaAssetResponse(MediaAssetBase):
    id: int
    project_id: int
    scene_id: Optional[int] = None
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime


# Processing schemas
class ProcessingRequest(BaseSchema):
    project_id: int
    processing_type: str = Field(..., description="Type of processing: 'scenes', 'videos', 'unity'")
    options: Optional[Dict[str, Any]] = None


class ProcessingStatus(BaseSchema):
    project_id: int
    status: ProjectStatus
    progress_percentage: float
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    estimated_completion: Optional[datetime] = None


# CrewAI Task schemas
class CrewTaskResponse(BaseSchema):
    id: int
    project_id: int
    task_type: str
    agent_name: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    execution_time_seconds: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


# Health check schema
class HealthResponse(BaseSchema):
    status: str
    service: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
