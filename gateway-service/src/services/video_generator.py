"""
🎥 NarrativeMorph - Video Generator
Simple Video Assembly con FFmpeg basic per hackathon
"""
import os
import logging
import asyncio
from typing import List
from pathlib import Path

from ..models.schemas import SceneData

logger = logging.getLogger(__name__)

class VideoGenerator:
    """
    🎬 Simple Video Assembly - FFmpeg basic
    Assemble video con audio in 1 minuto
    """
    
    def __init__(self):
        self.output_dir = Path("data/videos")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info("🎥 VideoGenerator initialized")
    
    async def create_video(
        self, 
        project_id: str, 
        scenes: List[SceneData], 
        images: List[str], 
        audio_files: List[str]
    ) -> str:
        """
        🎬 Assemble video da scene, immagini e audio
        """
        try:
            output_path = self.output_dir / f"{project_id}.mp4"
            
            # Verifica che abbiamo tutti i file
            if len(images) != len(scenes) or len(audio_files) != len(scenes):
                logger.warning("⚠️ Mismatch in scene/image/audio counts")
            
            # Metodo 1: MoviePy (più semplice per hackathon)
            video_path = await self._create_video_moviepy(
                scenes, images, audio_files, str(output_path)
            )
            
            logger.info(f"🎥 Video created: {video_path}")
            return video_path
            
        except Exception as e:
            logger.error(f"❌ Video creation error: {e}")
            # Fallback: crea video semplice
            return await self._create_simple_video(project_id, len(scenes))
    
    async def _create_video_moviepy(
        self, 
        scenes: List[SceneData], 
        images: List[str], 
        audio_files: List[str],
        output_path: str
    ) -> str:
        """Create video using MoviePy"""
        try:
            from moviepy.editor import (
                ImageClip, AudioFileClip, CompositeVideoClip, 
                concatenate_videoclips, concatenate_audioclips
            )
            
            video_clips = []
            audio_clips = []
            
            for i, (scene, image_path, audio_path) in enumerate(zip(scenes, images, audio_files)):
                # Create image clip
                if os.path.exists(image_path):
                    img_clip = ImageClip(image_path, duration=scene.duration)
                    img_clip = img_clip.resize(height=720)  # HD ready
                else:
                    # Create placeholder clip
                    img_clip = ImageClip("data/placeholder.jpg", duration=scene.duration)
                
                video_clips.append(img_clip)
                
                # Add audio if exists
                if os.path.exists(audio_path):
                    try:
                        audio_clip = AudioFileClip(audio_path)
                        # Adjust duration to match video
                        if audio_clip.duration > scene.duration:
                            audio_clip = audio_clip.subclip(0, scene.duration)
                        elif audio_clip.duration < scene.duration:
                            # Extend with silence
                            from moviepy.editor import CompositeAudioClip
                            silence_duration = scene.duration - audio_clip.duration
                            audio_clip = concatenate_audioclips([
                                audio_clip,
                                AudioFileClip("data/silence.mp3").subclip(0, silence_duration)
                            ])
                        
                        audio_clips.append(audio_clip)
                    except Exception as e:
                        logger.warning(f"⚠️ Audio clip error for scene {i}: {e}")
                        # Add silence
                        audio_clips.append(None)
                else:
                    audio_clips.append(None)
            
            # Concatenate video clips
            final_video = concatenate_videoclips(video_clips, method="compose")
            
            # Add audio if available
            if audio_clips and any(clip is not None for clip in audio_clips):
                # Filter out None clips and concatenate
                valid_audio_clips = [clip for clip in audio_clips if clip is not None]
                if valid_audio_clips:
                    final_audio = concatenate_audioclips(valid_audio_clips)
                    final_video = final_video.set_audio(final_audio)
            
            # Write video
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: final_video.write_videofile(
                    output_path,
                    fps=24,
                    codec='libx264',
                    audio_codec='aac',
                    verbose=False,
                    logger=None
                )
            )
            
            # Cleanup
            final_video.close()
            for clip in video_clips:
                clip.close()
            for clip in audio_clips:
                if clip:
                    clip.close()
            
            return output_path
            
        except Exception as e:
            logger.error(f"❌ MoviePy video creation error: {e}")
            raise
    
    async def _create_simple_video(self, project_id: str, scene_count: int) -> str:
        """
        Create simple placeholder video for errors
        """
        try:
            from moviepy.editor import ColorClip, TextClip, CompositeVideoClip
            
            output_path = self.output_dir / f"{project_id}_simple.mp4"
            
            # Create simple colored background
            background = ColorClip(size=(1280, 720), color=(100, 150, 200), duration=30)
            
            # Add text
            text = TextClip(
                f"Video for Project: {project_id}\nScenes: {scene_count}",
                fontsize=50,
                color='white',
                font='Arial'
            ).set_duration(30).set_position('center')
            
            # Composite
            video = CompositeVideoClip([background, text])
            
            # Write
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: video.write_videofile(
                    str(output_path),
                    fps=24,
                    verbose=False,
                    logger=None
                )
            )
            
            video.close()
            
            return str(output_path)
            
        except Exception as e:
            logger.error(f"❌ Simple video creation error: {e}")
            # Ultimate fallback - empty file
            output_path = self.output_dir / f"{project_id}_error.mp4"
            output_path.touch()
            return str(output_path)
    
    def _ensure_placeholder_files(self):
        """Ensure placeholder files exist"""
        try:
            # Create placeholder image
            placeholder_img = Path("data/placeholder.jpg")
            if not placeholder_img.exists():
                from PIL import Image, ImageDraw
                img = Image.new('RGB', (1280, 720), color='lightgray')
                draw = ImageDraw.Draw(img)
                draw.text((640, 360), "NarrativeMorph", fill='black', anchor='mm')
                placeholder_img.parent.mkdir(parents=True, exist_ok=True)
                img.save(placeholder_img)
            
            # Create silence audio
            silence_audio = Path("data/silence.mp3")
            if not silence_audio.exists():
                from pydub import AudioSegment
                silence = AudioSegment.silent(duration=1000)  # 1 second
                silence_audio.parent.mkdir(parents=True, exist_ok=True)
                silence.export(silence_audio, format="mp3")
            
        except Exception as e:
            logger.warning(f"⚠️ Could not create placeholder files: {e}")
    
    def __del__(self):
        """Cleanup on destruction"""
        try:
            # Cleanup any temporary files if needed
            pass
        except:
            pass
