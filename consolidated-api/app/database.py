"""
🗄️ NarrativeMorph - Database Configuration
Async PostgreSQL connection with SQLAlchemy
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
import asyncio
from typing import AsyncGenerator
import structlog

# Configure logging
logger = structlog.get_logger(__name__)

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://raguser:ragpass123@localhost:5432/narrative_morph"
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True if os.getenv("DEBUG", "false").lower() == "true" else False,
    poolclass=NullPool,  # For development/hackathon - simplify connection pooling
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "server_settings": {
            "application_name": "narrative_morph_api",
        }
    }
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autoflush=True,
    autocommit=False
)

# Base class for models
Base = declarative_base()


async def get_database_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session for FastAPI endpoints
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error("Database session error", error=str(e))
            raise
        finally:
            await session.close()


# Alias for compatibility with existing routers
get_db = get_database_session

# Alias for background processing tasks
async_session = AsyncSessionLocal


async def init_database():
    """
    Initialize database tables and seed data
    """
    try:
        # Import models to ensure they're registered
        from app.models import (
            User, Project, Scene, MediaAsset, CrewTask, BookCatalog,
            ProjectStatus, MediaType
        )
        
        logger.info("Creating database tables...")
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
        # Seed initial data for hackathon demo
        await seed_demo_data()
        
    except Exception as e:
        logger.error("Failed to initialize database", error=str(e))
        raise


async def seed_demo_data():
    """
    Seed database with demo data for hackathon
    """
    try:
        from app.models import User, BookCatalog
        
        async with AsyncSessionLocal() as session:
            # Check if we already have demo data
            result = await session.execute("SELECT COUNT(*) FROM users")
            user_count = result.scalar()
            
            if user_count == 0:
                logger.info("Seeding demo data...")
                
                # Create demo users
                demo_users = [
                    User(
                        username="alice",
                        email="alice@narrativemorph.com",
                        full_name="Alice Creator",
                        is_active=True
                    ),
                    User(
                        username="bob",
                        email="bob@narrativemorph.com", 
                        full_name="Bob Developer",
                        is_active=True
                    ),
                    User(
                        username="demo",
                        email="demo@narrativemorph.com",
                        full_name="Demo User",
                        is_active=True
                    )
                ]
                
                for user in demo_users:
                    session.add(user)
                
                # Add sample books to catalog
                sample_books = [
                    BookCatalog(
                        title="The Little Prince",
                        author="Antoine de Saint-Exupéry",
                        description="A classic tale about a little prince who travels from planet to planet.",
                        genre="Fantasy",
                        language="en",
                        full_text="""Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal. Here is a copy of the drawing.

In the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."

I pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing.""",
                        word_count=150,
                        estimated_reading_time_minutes=1,
                        is_featured=True,
                        difficulty_level="easy",
                        expected_scenes=3,
                        copyright_status="public_domain"
                    ),
                    BookCatalog(
                        title="A Short Fairy Tale",
                        author="Demo Author",
                        description="A quick fantasy story perfect for testing video generation.",
                        genre="Fantasy",
                        language="en",
                        full_text="""Once upon a time, in a magical forest filled with glowing mushrooms and singing birds, there lived a young fairy named Luna. She had shimmering wings that sparkled like starlight and a kind heart that loved helping all creatures.

One sunny morning, Luna discovered that the forest's magical spring had stopped flowing. Without its magic water, all the plants were beginning to wither and the animals were becoming sad.

Determined to help, Luna flew to the wise old owl who lived in the tallest tree. The owl told her that only a crystal of pure moonlight could restore the spring's power, but it was hidden in the dangerous shadow cave.

Brave Luna ventured into the dark cave, using her glowing wings to light the way. After facing her fears and solving ancient riddles, she found the beautiful moonlight crystal.

When Luna placed the crystal in the spring, it immediately began to flow again with magical water. The forest came back to life, flowers bloomed, and all the animals cheered. Luna had saved her home through courage and kindness.""",
                        word_count=180,
                        estimated_reading_time_minutes=2,
                        is_featured=True,
                        difficulty_level="easy",
                        expected_scenes=5,
                        copyright_status="demo_content"
                    )
                ]
                
                for book in sample_books:
                    session.add(book)
                
                await session.commit()
                logger.info("Demo data seeded successfully")
            else:
                logger.info("Demo data already exists, skipping seed")
                
    except Exception as e:
        logger.error("Failed to seed demo data", error=str(e))
        # Don't raise - this is non-critical for the API to function


async def check_database_health() -> bool:
    """
    Check if database connection is healthy
    """
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute("SELECT 1")
            return result.scalar() == 1
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        return False


async def close_database_connections():
    """
    Close all database connections (for shutdown)
    """
    try:
        await engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error("Error closing database connections", error=str(e))


# Redis connection for caching and background jobs
import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = redis.from_url(
    REDIS_URL,
    encoding="utf-8",
    decode_responses=True
)


async def get_redis_client():
    """Get Redis client for dependency injection"""
    return redis_client


async def check_redis_health() -> bool:
    """Check if Redis connection is healthy"""
    try:
        await redis_client.ping()
        return True
    except Exception as e:
        logger.error("Redis health check failed", error=str(e))
        return False
