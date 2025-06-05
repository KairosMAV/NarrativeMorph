"""
📖 NarrativeMorph - Story Processor
Basic Orchestrator con 3 agenti essenziali per hackathon
"""
import asyncio
import logging
import os
import openai
from typing import List, Dict
import json
import re

from ..models.schemas import SceneData

logger = logging.getLogger(__name__)

class StoryProcessor:
    """
    🧠 Basic Orchestrator - 3 agenti essenziali:
    1. Scene Analyzer Agent
    2. Image Prompt Agent  
    3. Audio Script Agent
    """
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY", "mock-key")
        )
        self.is_mock = os.getenv("OPENAI_API_KEY", "mock-key") == "mock-key"
        logger.info(f"🤖 StoryProcessor initialized (Mock: {self.is_mock})")
    
    async def analyze_scenes(self, story_text: str) -> List[SceneData]:
        """
        🎭 Agent 1: Scene Analyzer
        Automatic scene analysis - 3-5 scene chiave
        """
        try:
            if self.is_mock:
                return self._mock_scene_analysis(story_text)
            
            prompt = f"""
            Analizza questa storia e dividila in 3-5 scene chiave per un video di 5 minuti.
            
            STORIA:
            {story_text}
            
            Per ogni scena, fornisci:
            1. Titolo breve
            2. Descrizione visiva
            3. Dialogo principale (se presente)
            4. Durata approssimativa in secondi
            
            Risposta in formato JSON:
            {{
                "scenes": [
                    {{
                        "id": 1,
                        "title": "Titolo scena",
                        "description": "Descrizione visiva dettagliata",
                        "dialogue": "Dialogo o narrazione",
                        "duration": 60
                    }}
                ]
            }}
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            result = json.loads(response.choices[0].message.content)
            scenes = []
            
            for i, scene in enumerate(result["scenes"]):
                scenes.append(SceneData(
                    id=i + 1,
                    title=scene["title"],
                    description=scene["description"],
                    dialogue=scene.get("dialogue"),
                    visual_prompt="",  # Generato dal prossimo agente
                    audio_text=scene.get("dialogue", scene["description"]),
                    duration=scene.get("duration", 60)
                ))
            
            logger.info(f"📝 Analyzed {len(scenes)} scenes")
            return scenes
            
        except Exception as e:
            logger.error(f"❌ Scene analysis error: {e}")
            return self._mock_scene_analysis(story_text)
    
    async def generate_scene_images(self, scenes: List[SceneData]) -> List[str]:
        """
        🖼️ Agent 2: Image Prompt Agent + DALL-E Generation
        Generate 3-5 immagini chiave
        """
        try:
            images = []
            
            for scene in scenes:
                # Generate DALL-E prompt
                visual_prompt = await self._generate_visual_prompt(scene)
                scene.visual_prompt = visual_prompt
                
                # Generate image
                if self.is_mock:
                    # Mock image path
                    image_path = f"data/images/scene_{scene.id}_mock.jpg"
                    os.makedirs("data/images", exist_ok=True)
                    
                    # Create placeholder image
                    from PIL import Image, ImageDraw, ImageFont
                    img = Image.new('RGB', (1024, 576), color='lightblue')
                    draw = ImageDraw.Draw(img)
                    
                    # Add text
                    try:
                        font = ImageFont.truetype("arial.ttf", 40)
                    except:
                        font = ImageFont.load_default()
                    
                    text = f"Scene {scene.id}\n{scene.title}"
                    draw.text((50, 250), text, fill='black', font=font)
                    img.save(image_path)
                    
                    images.append(image_path)
                    logger.info(f"🖼️ Mock image created: {image_path}")
                else:
                    # Real DALL-E generation
                    response = await self.client.images.generate(
                        model="dall-e-3",
                        prompt=visual_prompt,
                        size="1024x1024",
                        quality="standard",
                        n=1,
                    )
                    
                    # Download image
                    import httpx
                    image_url = response.data[0].url
                    image_path = f"data/images/scene_{scene.id}.jpg"
                    os.makedirs("data/images", exist_ok=True)
                    
                    async with httpx.AsyncClient() as client:
                        img_response = await client.get(image_url)
                        with open(image_path, 'wb') as f:
                            f.write(img_response.content)
                    
                    images.append(image_path)
                    logger.info(f"🖼️ Image generated: {image_path}")
                
                # Small delay to avoid rate limits
                await asyncio.sleep(1)
            
            return images
            
        except Exception as e:
            logger.error(f"❌ Image generation error: {e}")
            return [f"data/images/scene_{i+1}_error.jpg" for i in range(len(scenes))]
    
    async def generate_audio(self, scenes: List[SceneData]) -> List[str]:
        """
        🔊 Agent 3: Audio Script Agent + TTS
        TTS per narrazione di ogni scena
        """
        try:
            audio_files = []
            
            for scene in scenes:
                if self.is_mock:
                    # Mock audio - silent file
                    audio_path = f"data/audio/scene_{scene.id}_mock.mp3"
                    os.makedirs("data/audio", exist_ok=True)
                    
                    # Create silent audio using pydub
                    from pydub import AudioSegment
                    silence = AudioSegment.silent(duration=int(scene.duration * 1000))
                    silence.export(audio_path, format="mp3")
                    
                    audio_files.append(audio_path)
                    logger.info(f"🔊 Mock audio created: {audio_path}")
                else:
                    # Real TTS with OpenAI
                    response = await self.client.audio.speech.create(
                        model="tts-1",
                        voice="alloy",
                        input=scene.audio_text
                    )
                    
                    audio_path = f"data/audio/scene_{scene.id}.mp3"
                    os.makedirs("data/audio", exist_ok=True)
                    
                    with open(audio_path, 'wb') as f:
                        f.write(response.content)
                    
                    audio_files.append(audio_path)
                    logger.info(f"🔊 Audio generated: {audio_path}")
                
                await asyncio.sleep(0.5)
            
            return audio_files
            
        except Exception as e:
            logger.error(f"❌ Audio generation error: {e}")
            return [f"data/audio/scene_{i+1}_error.mp3" for i in range(len(scenes))]
    
    async def _generate_visual_prompt(self, scene: SceneData) -> str:
        """Generate DALL-E prompt for scene"""
        if self.is_mock:
            return f"A cinematic scene showing {scene.description}, movie-style, high quality"
        
        try:
            prompt = f"""
            Crea un prompt per DALL-E per generare un'immagine cinematografica di questa scena:
            
            SCENA: {scene.title}
            DESCRIZIONE: {scene.description}
            
            Il prompt deve essere in inglese, cinematografico, e includere:
            - Stile visivo (cinematic, movie-style)
            - Lighting e mood
            - Composizione
            - Qualità (high quality, detailed)
            
            Rispondi solo con il prompt, massimo 400 caratteri.
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=100
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"❌ Visual prompt error: {e}")
            return f"Cinematic scene: {scene.description}, movie-style, high quality"
    
    def _mock_scene_analysis(self, story_text: str) -> List[SceneData]:
        """Mock scene analysis for development"""
        # Simple scene detection based on paragraphs
        paragraphs = [p.strip() for p in story_text.split('\n\n') if p.strip()]
        
        if len(paragraphs) < 3:
            # Split long text into chunks
            words = story_text.split()
            chunk_size = len(words) // 3
            paragraphs = [
                ' '.join(words[i:i+chunk_size]) 
                for i in range(0, len(words), chunk_size)
            ][:3]
        
        scenes = []
        for i, paragraph in enumerate(paragraphs[:5]):  # Max 5 scenes
            scenes.append(SceneData(
                id=i + 1,
                title=f"Scene {i + 1}",
                description=paragraph[:200] + "..." if len(paragraph) > 200 else paragraph,
                dialogue=None,
                visual_prompt="",
                audio_text=paragraph[:500],  # Limit for TTS
                duration=60  # 1 minute per scene
            ))
        
        logger.info(f"📝 Mock analysis: {len(scenes)} scenes")
        return scenes
