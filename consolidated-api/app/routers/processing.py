"""
⚙️ NarrativeMorph - Processing Router
AI processing endpoints for video/Unity generation
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.database import get_db
from app.models import Project, User, ProjectStatus
from app.schemas import ProcessingRequest, ProcessingStatus
from app.routers.projects import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/start", response_model=ProcessingStatus)
async def start_processing(
    request: ProcessingRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start AI processing for a project"""
    try:
        # Verify project ownership
        result = await db.execute(
            select(Project).where(
                Project.id == request.project_id,
                Project.owner_id == current_user.id
            )
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if project is ready for processing
        if project.status not in [ProjectStatus.GENERATING_SCENES, ProjectStatus.COMPLETED]:
            raise HTTPException(
                status_code=400,
                detail=f"Project must be in GENERATING_SCENES or COMPLETED status, current: {project.status}"
            )
        
        # Start appropriate processing based on type
        if request.processing_type == "videos":
            background_tasks.add_task(process_videos, request.project_id, request.options or {})
            project.status = ProjectStatus.GENERATING_VIDEOS
            
        elif request.processing_type == "unity":
            background_tasks.add_task(process_unity, request.project_id, request.options or {})
            project.status = ProjectStatus.GENERATING_UNITY
            
        else:
            raise HTTPException(status_code=400, detail="Invalid processing type")
        
        project.progress_percentage = 50.0
        await db.commit()
        
        logger.info(f"Started {request.processing_type} processing for project {request.project_id}")
        
        return ProcessingStatus(
            project_id=project.id,
            status=project.status,
            progress_percentage=project.progress_percentage,
            current_step=f"Starting {request.processing_type} generation"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting processing: {e}")
        raise HTTPException(status_code=500, detail="Failed to start processing")


@router.get("/status/{project_id}", response_model=ProcessingStatus)
async def get_processing_status(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get processing status for a project"""
    try:
        result = await db.execute(
            select(Project).where(
                Project.id == project_id,
                Project.owner_id == current_user.id
            )
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Determine current step based on status
        current_step = None
        if project.status == ProjectStatus.PROCESSING_TEXT:
            current_step = "Analyzing text and creating scenes"
        elif project.status == ProjectStatus.GENERATING_SCENES:
            current_step = "Scene generation completed"
        elif project.status == ProjectStatus.GENERATING_VIDEOS:
            current_step = "Generating videos with CogVideoX"
        elif project.status == ProjectStatus.GENERATING_UNITY:
            current_step = "Creating Unity interactive experience"
        elif project.status == ProjectStatus.COMPLETED:
            current_step = "Processing completed"
        elif project.status == ProjectStatus.FAILED:
            current_step = "Processing failed"
        
        return ProcessingStatus(
            project_id=project.id,
            status=project.status,
            progress_percentage=project.progress_percentage,
            current_step=current_step,
            error_message=project.error_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting processing status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get processing status")


async def process_videos(project_id: int, options: dict):
    """Background task to generate videos using CogVideoX"""
    from app.database import async_session
    
    async with async_session() as db:
        try:
            # Get project and scenes
            result = await db.execute(select(Project).where(Project.id == project_id))
            project = result.scalar_one_or_none()
            
            if not project:
                logger.error(f"Project {project_id} not found for video processing")
                return
            
            # Update progress
            project.progress_percentage = 60.0
            await db.commit()
            
            # Get scenes
            from app.models import Scene
            scenes_result = await db.execute(
                select(Scene).where(Scene.project_id == project_id).order_by(Scene.scene_number)
            )
            scenes = scenes_result.scalars().all()
            
            logger.info(f"Starting video generation for {len(scenes)} scenes in project {project_id}")
            
            # Process each scene (placeholder for CogVideoX integration)
            for i, scene in enumerate(scenes):
                # Update progress
                progress = 60.0 + (30.0 * (i + 1) / len(scenes))
                project.progress_percentage = progress
                await db.commit()
                
                # TODO: Integrate CogVideoX here
                # For now, just log the scene processing
                logger.info(f"Processing scene {scene.id}: {scene.elementi_narrativi[:50]}...")
                
                # Simulate video generation time
                import asyncio
                await asyncio.sleep(2)
            
            # Complete
            project.status = ProjectStatus.COMPLETED
            project.progress_percentage = 100.0
            project.total_videos = len(scenes)
            await db.commit()
            
            logger.info(f"Completed video generation for project {project_id}")
            
        except Exception as e:
            logger.error(f"Error processing videos for project {project_id}: {e}")
            
            # Update project with error
            if project:
                project.status = ProjectStatus.FAILED
                project.error_message = str(e)
                await db.commit()


async def process_unity(project_id: int, options: dict):
    """Background task to generate Unity project"""
    from app.database import async_session
    
    async with async_session() as db:
        try:
            # Get project
            result = await db.execute(select(Project).where(Project.id == project_id))
            project = result.scalar_one_or_none()
            
            if not project:
                logger.error(f"Project {project_id} not found for Unity processing")
                return
            
            # Update progress
            project.progress_percentage = 70.0
            await db.commit()
            
            logger.info(f"Starting Unity project generation for project {project_id}")
            
            # TODO: Integrate Unity project generation here
            # For now, just simulate the process
            import asyncio
            await asyncio.sleep(5)
            
            # Complete
            project.status = ProjectStatus.COMPLETED
            project.progress_percentage = 100.0
            await db.commit()
            
            logger.info(f"Completed Unity generation for project {project_id}")
            
        except Exception as e:
            logger.error(f"Error processing Unity for project {project_id}: {e}")
            
            # Update project with error
            if project:
                project.status = ProjectStatus.FAILED
                project.error_message = str(e)
                await db.commit()
