"""
⚙️ NarrativeMorph - Configuration Management
Centralized settings using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List, Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # 🌍 Application Settings
    app_name: str = "NarrativeMorph API"
    app_version: str = "1.0.0"
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # 🗄️ Database Settings
    database_url: str = Field(
        default="postgresql+asyncpg://raguser:ragpass123@localhost:5432/narrative_morph",
        env="DATABASE_URL"
    )
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # 🤖 AI Service API Keys
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    stability_api_key: str = Field(default="", env="STABILITY_API_KEY")
    elevenlabs_api_key: str = Field(default="", env="ELEVENLABS_API_KEY")
    
    # 🎬 CogVideoX Configuration
    cogvideo_model_path: str = Field(default="./models/cogvideox", env="COGVIDEO_MODEL_PATH")
    cogvideo_device: str = Field(default="cpu", env="COGVIDEO_DEVICE")  # cpu or cuda
    gpu_memory_fraction: float = Field(default=0.8, env="GPU_MEMORY_FRACTION")
    
    # 📁 File Storage Settings
    upload_dir: str = Field(default="./uploads", env="UPLOAD_DIR")
    media_dir: str = Field(default="./media", env="MEDIA_DIR")
    data_dir: str = Field(default="./data", env="DATA_DIR")
    temp_dir: str = Field(default="./temp", env="TEMP_DIR")
    max_file_size_mb: int = Field(default=100, env="MAX_FILE_SIZE_MB")
    
    # 🎮 Unity Generation Settings
    unity_project_template_path: str = Field(default="./templates/unity", env="UNITY_PROJECT_TEMPLATE_PATH")
    unity_export_path: str = Field(default="./media/unity-projects", env="UNITY_EXPORT_PATH")
    
    # 🔐 Security Settings
    jwt_secret_key: str = Field(default="your-super-secret-jwt-key-here", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expire_hours: int = Field(default=24, env="JWT_EXPIRE_HOURS")
    
    # 🌐 CORS Settings
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        env="CORS_ORIGINS"
    )
    
    # 🔄 Background Jobs
    celery_broker_url: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")
    max_concurrent_jobs: int = Field(default=5, env="MAX_CONCURRENT_JOBS")
    
    # 📈 Monitoring
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")
    analytics_enabled: bool = Field(default=False, env="ANALYTICS_ENABLED")
    
    # 🎯 Demo Mode Settings
    demo_mode: bool = Field(default=True, env="DEMO_MODE")
    demo_user_id: str = Field(default="demo-user-001", env="DEMO_USER_ID")
    demo_project_limit: int = Field(default=5, env="DEMO_PROJECT_LIMIT")
    
    # 🎬 Video Generation Settings
    default_video_width: int = Field(default=1024, env="DEFAULT_VIDEO_WIDTH")
    default_video_height: int = Field(default=576, env="DEFAULT_VIDEO_HEIGHT")
    default_video_fps: int = Field(default=8, env="DEFAULT_VIDEO_FPS")
    default_video_frames: int = Field(default=49, env="DEFAULT_VIDEO_FRAMES")
    video_inference_steps: int = Field(default=50, env="VIDEO_INFERENCE_STEPS")
    
    # 🎨 Image Generation Settings
    default_image_width: int = Field(default=1024, env="DEFAULT_IMAGE_WIDTH")
    default_image_height: int = Field(default=1024, env="DEFAULT_IMAGE_HEIGHT")
    image_inference_steps: int = Field(default=25, env="IMAGE_INFERENCE_STEPS")
    
    # 📝 Text Processing Settings
    max_text_length: int = Field(default=100000, env="MAX_TEXT_LENGTH")  # ~40 pages
    target_chunk_size_words: int = Field(default=5000, env="TARGET_CHUNK_SIZE_WORDS")
    chunk_word_slack: int = Field(default=500, env="CHUNK_WORD_SLACK")
    min_chunk_size_words: int = Field(default=1000, env="MIN_CHUNK_SIZE_WORDS")
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("cogvideo_device")
    def validate_device(cls, v):
        if v not in ["cpu", "cuda"]:
            raise ValueError("Device must be 'cpu' or 'cuda'")
        return v
    
    def create_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            self.upload_dir,
            self.media_dir,
            self.data_dir,
            self.temp_dir,
            self.cogvideo_model_path,
            self.unity_export_path,
            f"{self.media_dir}/images",
            f"{self.media_dir}/videos", 
            f"{self.media_dir}/audio",
            f"{self.media_dir}/unity-projects",
            f"{self.data_dir}/projects",
            f"{self.data_dir}/logs"
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Create directories on import
settings.create_directories()


def get_settings() -> Settings:
    """Dependency to get settings in FastAPI"""
    return settings


# Development helpers
def is_development() -> bool:
    return settings.environment.lower() == "development"


def is_production() -> bool:
    return settings.environment.lower() == "production"


def has_gpu() -> bool:
    """Check if GPU is available and configured"""
    if settings.cogvideo_device == "cpu":
        return False
    
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False


def get_device() -> str:
    """Get the appropriate device for PyTorch models"""
    if settings.cogvideo_device == "cuda" and has_gpu():
        return "cuda"
    return "cpu"


# API Configuration
API_CONFIG = {
    "title": settings.app_name,
    "description": """
    🎬 **NarrativeMorph API** - Transform stories into interactive video experiences
    
    ## Features
    - 📝 **Text Analysis**: Intelligent scene extraction from narratives
    - 🎨 **Image Generation**: DALL-E 3 powered scene visualization  
    - 🎬 **Video Generation**: CogVideoX AI video creation
    - 🎵 **Audio Generation**: ElevenLabs voice synthesis
    - 🎮 **Unity Integration**: Automated game project generation
    - 🤖 **CrewAI Orchestration**: Multi-agent workflow management
    
    ## Hackathon Edition
    - ⚡ **Fast Setup**: PostgreSQL + Redis + Docker
    - 🎯 **Demo Ready**: Pre-loaded content and test users
    - 📊 **Real-time Monitoring**: WebSocket progress tracking
    - 🧪 **Development Friendly**: Hot reload and debugging
    """,
    "version": settings.app_version,
    "docs_url": "/docs" if is_development() else None,
    "redoc_url": "/redoc" if is_development() else None,
}


# Logging Configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "structured": {
            "()": "structlog.stdlib.ProcessorFormatter",
            "processor": "structlog.dev.ConsoleRenderer",
        },
    },
    "handlers": {
        "default": {
            "formatter": "structured",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "formatter": "default",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": f"{settings.data_dir}/logs/app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "": {
            "handlers": ["default", "file"],
            "level": settings.log_level,
            "propagate": False,
        },
        "uvicorn": {
            "handlers": ["default"],
            "level": "INFO",
            "propagate": False,
        },
        "sqlalchemy.engine": {
            "handlers": ["file"],
            "level": "INFO" if is_development() else "WARNING",
            "propagate": False,
        },
    },
}
