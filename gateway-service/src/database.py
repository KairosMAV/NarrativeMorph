# 🗄️ NarrativeMorph Gateway - Database SQLite
# Database models e session per hackathon

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import enum
from datetime import datetime
import os

# Database configuration
DATABASE_URL = "sqlite+aiosqlite:///./narrative_morph.db"

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

class ProcessingStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    text_content = Column(Text, nullable=False)
    status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Processing results
    scenes_json = Column(Text, nullable=True)
    images_generated = Column(Integer, default=0)
    video_path = Column(String, nullable=True)
    audio_path = Column(String, nullable=True)
    
    # Progress tracking
    progress_percentage = Column(Float, default=0.0)
    current_step = Column(String, default="Upload completato")
    error_message = Column(Text, nullable=True)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_database():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
