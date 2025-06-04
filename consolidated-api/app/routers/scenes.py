"""
🎬 NarrativeMorph - Scenes Router
CRUD operations for scene management
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import logging

from app.database import get_db
from app.models import Scene, Project, User
from app.schemas import SceneResponse
from app.routers.projects import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/project/{project_id}", response_model=List[SceneResponse])
async def list_scenes_by_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all scenes for a specific project"""
    try:
        # Verify project ownership
        project_result = await db.execute(
            select(Project).where(
                Project.id == project_id,
                Project.owner_id == current_user.id
            )
        )
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get scenes
        result = await db.execute(
            select(Scene)
            .where(Scene.project_id == project_id)
            .order_by(Scene.scene_number)
        )
        scenes = result.scalars().all()
        
        return scenes
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing scenes for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list scenes")


@router.get("/{scene_id}", response_model=SceneResponse)
async def get_scene(
    scene_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scene by ID"""
    try:
        # Get scene with project to verify ownership
        result = await db.execute(
            select(Scene, Project)
            .join(Project)
            .where(
                Scene.id == scene_id,
                Project.owner_id == current_user.id
            )
        )
        scene_project = result.first()
        
        if not scene_project:
            raise HTTPException(status_code=404, detail="Scene not found")
        
        scene = scene_project[0]
        return scene
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting scene {scene_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get scene")


@router.put("/{scene_id}/prompts")
async def update_scene_prompts(
    scene_id: int,
    video_prompt: Optional[str] = None,
    audio_prompt: Optional[str] = None,
    unity_prompt: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update AI generation prompts for a scene"""
    try:
        # Get scene with project to verify ownership
        result = await db.execute(
            select(Scene, Project)
            .join(Project)
            .where(
                Scene.id == scene_id,
                Project.owner_id == current_user.id
            )
        )
        scene_project = result.first()
        
        if not scene_project:
            raise HTTPException(status_code=404, detail="Scene not found")
        
        scene = scene_project[0]
        
        # Update prompts
        if video_prompt is not None:
            scene.video_prompt = video_prompt
        if audio_prompt is not None:
            scene.audio_prompt = audio_prompt
        if unity_prompt is not None:
            scene.unity_prompt = unity_prompt
        
        await db.commit()
        await db.refresh(scene)
        
        logger.info(f"Updated prompts for scene {scene_id}")
        return scene
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating scene prompts {scene_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update scene prompts")
