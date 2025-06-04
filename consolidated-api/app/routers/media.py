"""
🎥 NarrativeMorph - Media Router
File management for generated assets
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging
import aiofiles
import os
from pathlib import Path

from app.database import get_db
from app.models import MediaAsset, Project, User, MediaType
from app.schemas import MediaAssetResponse
from app.routers.projects import get_current_user
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Ensure media directory exists
MEDIA_DIR = Path("media")
MEDIA_DIR.mkdir(exist_ok=True)


@router.get("/project/{project_id}", response_model=List[MediaAssetResponse])
async def list_media_by_project(
    project_id: int,
    media_type: MediaType = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all media assets for a specific project"""
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
        
        # Build query
        query = select(MediaAsset).where(MediaAsset.project_id == project_id)
        
        if media_type:
            query = query.where(MediaAsset.media_type == media_type)
        
        query = query.order_by(MediaAsset.created_at.desc())
        
        # Execute query
        result = await db.execute(query)
        media_assets = result.scalars().all()
        
        return media_assets
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing media for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list media assets")


@router.get("/{media_id}", response_model=MediaAssetResponse)
async def get_media_asset(
    media_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get media asset by ID"""
    try:
        # Get media asset with project to verify ownership
        result = await db.execute(
            select(MediaAsset, Project)
            .join(Project)
            .where(
                MediaAsset.id == media_id,
                Project.owner_id == current_user.id
            )
        )
        media_project = result.first()
        
        if not media_project:
            raise HTTPException(status_code=404, detail="Media asset not found")
        
        media_asset = media_project[0]
        return media_asset
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting media asset {media_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get media asset")


@router.post("/upload/{project_id}", response_model=MediaAssetResponse)
async def upload_media(
    project_id: int,
    file: UploadFile = File(...),
    scene_id: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a media file for a project"""
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
        
        # Determine media type from file extension
        file_ext = Path(file.filename).suffix.lower()
        media_type_map = {
            '.mp4': MediaType.VIDEO,
            '.avi': MediaType.VIDEO,
            '.mov': MediaType.VIDEO,
            '.jpg': MediaType.IMAGE,
            '.jpeg': MediaType.IMAGE,
            '.png': MediaType.IMAGE,
            '.gif': MediaType.IMAGE,
            '.mp3': MediaType.AUDIO,
            '.wav': MediaType.AUDIO,
            '.zip': MediaType.UNITY_PROJECT,
        }
        
        media_type = media_type_map.get(file_ext, MediaType.IMAGE)
        
        # Create file path
        project_dir = MEDIA_DIR / f"project_{project_id}"
        project_dir.mkdir(exist_ok=True)
        
        file_path = project_dir / file.filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create media asset record
        media_asset = MediaAsset(
            project_id=project_id,
            scene_id=scene_id,
            filename=file.filename,
            media_type=media_type,
            file_size_bytes=len(content),
            file_url=str(file_path),
            metadata={"original_filename": file.filename}
        )
        
        db.add(media_asset)
        await db.commit()
        await db.refresh(media_asset)
        
        logger.info(f"Uploaded media {file.filename} for project {project_id}")
        return media_asset
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading media for project {project_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to upload media")


@router.delete("/{media_id}", status_code=204)
async def delete_media_asset(
    media_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete media asset"""
    try:
        # Get media asset with project to verify ownership
        result = await db.execute(
            select(MediaAsset, Project)
            .join(Project)
            .where(
                MediaAsset.id == media_id,
                Project.owner_id == current_user.id
            )
        )
        media_project = result.first()
        
        if not media_project:
            raise HTTPException(status_code=404, detail="Media asset not found")
        
        media_asset = media_project[0]
        
        # Delete file from filesystem
        if media_asset.file_url and os.path.exists(media_asset.file_url):
            os.remove(media_asset.file_url)
        
        # Delete record
        await db.delete(media_asset)
        await db.commit()
        
        logger.info(f"Deleted media asset {media_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting media asset {media_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete media asset")
