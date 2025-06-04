"""
📁 NarrativeMorph - Projects Router
CRUD operations for project management
"""
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import logging

from app.database import get_db
from app.models import Project, User, ProjectStatus
from app.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
)
from app.services.text_service import TextChunkingService

logger = logging.getLogger(__name__)
router = APIRouter()


# Dependency to get current user (simplified for hackathon)
async def get_current_user(db: AsyncSession = Depends(get_db)) -> User:
    """Get current user - simplified implementation for hackathon"""
    # In a real app, this would validate JWT tokens
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    
    if not user:
        # Create default user for hackathon
        user = User(
            username="hackathon_user",
            email="user@hackathon.com",
            full_name="Hackathon User"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return user


@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project and start text processing"""
    try:
        # Create project
        project = Project(
            title=project_data.title,
            description=project_data.description,
            original_text=project_data.original_text,
            generation_settings=project_data.generation_settings or {},
            owner_id=current_user.id,
            status=ProjectStatus.CREATED
        )
        
        db.add(project)
        await db.commit()
        await db.refresh(project)
        
        logger.info(f"Created project {project.id}: {project.title}")
        
        # Start background text processing
        background_tasks.add_task(process_project_text, project.id)
        
        return project
        
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create project")


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[ProjectStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List projects with pagination and filtering"""
    try:
        # Base query
        query = select(Project).where(Project.owner_id == current_user.id)
        
        # Filter by status if provided
        if status:
            query = query.where(Project.status == status)
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(Project.created_at.desc())
        
        # Execute query
        result = await db.execute(query)
        projects = result.scalars().all()
        
        return ProjectListResponse(
            projects=projects,
            total=total,
            page=page,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to list projects")


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project by ID"""
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
        
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get project")


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project"""
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
        
        # Update fields
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        await db.commit()
        await db.refresh(project)
        
        logger.info(f"Updated project {project_id}")
        return project
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update project")


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete project"""
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
        
        await db.delete(project)
        await db.commit()
        
        logger.info(f"Deleted project {project_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete project")


async def process_project_text(project_id: int):
    """Background task to process project text into scenes"""
    from app.database import async_session
    
    async with async_session() as db:
        try:
            # Get project
            result = await db.execute(select(Project).where(Project.id == project_id))
            project = result.scalar_one_or_none()
            
            if not project:
                logger.error(f"Project {project_id} not found for text processing")
                return
            
            # Update status
            project.status = ProjectStatus.PROCESSING_TEXT
            project.progress_percentage = 10.0
            await db.commit()
            
            # Process text using the text service
            text_service = TextChunkingService()
            scenes_data = await text_service.process_text(project.original_text)
            
            # Create scene records
            from app.models import Scene
            scene_number = 1
            
            for scene_data in scenes_data:
                scene = Scene(
                    project_id=project.id,
                    scene_number=scene_number,
                    elementi_narrativi=scene_data.get('elementi_narrativi', ''),
                    personaggi=scene_data.get('personaggi', ''),
                    ambientazione=scene_data.get('ambientazione', ''),
                    azioni=scene_data.get('azioni', ''),
                    emozioni=scene_data.get('emozioni', ''),
                    dialoghi=scene_data.get('dialoghi'),
                    note_regia=scene_data.get('note_regia')
                )
                db.add(scene)
                scene_number += 1
            
            # Update project
            project.status = ProjectStatus.GENERATING_SCENES
            project.progress_percentage = 40.0
            project.total_scenes = len(scenes_data)
            
            await db.commit()
            logger.info(f"Processed text for project {project_id}: {len(scenes_data)} scenes created")
            
        except Exception as e:
            logger.error(f"Error processing text for project {project_id}: {e}")
            
            # Update project with error
            if project:
                project.status = ProjectStatus.FAILED
                project.error_message = str(e)
                await db.commit()
