"""
Unity Code Generation Agent
Genera script C# per Unity basati sulle scene analizzate dal text-chunker
"""
from typing import List, Dict, Any
from openai import OpenAI
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class UnityCodeAgent:
    """Agente specializzato nella generazione di codice Unity C#"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.api_key = openai_api_key
        self.model = model
        self.is_mock_mode = (not openai_api_key or 
                           openai_api_key in ["mock-api-key", "test-api-key", "your-api-key-here"])
        
        if self.is_mock_mode:
            from ..utils.mock_openai import MockOpenAIClient
            self.client = MockOpenAIClient()
            logger.info("Unity Code Agent initialized in MOCK mode")
        else:
            # Get base URL from environment for OpenRouter support
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            logger.info(f"Unity Code Agent initializing OpenAI client in PRODUCTION mode. Base URL: {base_url}, Model: {self.model}")
            # Adding HTTP-Referer and X-Title headers as per OpenRouter documentation
            self.client = OpenAI(
                api_key=openai_api_key,
                base_url=base_url,
                default_headers={
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "BookToGame"
                }
            )
            logger.info("Unity Code Agent OpenAI client configured with custom headers for OpenRouter.")
            
        self.role = "Unity C# Developer Expert"
        self.goal = "Generate clean, efficient Unity C# scripts for interactive scenes"
        self.backstory = """You are a senior Unity developer with 10+ years of experience.
        You've shipped multiple AAA games and understand best practices for:
        - Scene management and transitions
        - Character controllers and AI
        - AR/VR interactions
        - Performance optimization
        - Clean architecture patterns"""
    
    async def generate_scene_controller(self, scene_data: Dict[str, Any]) -> str:
        """Genera un controller Unity per una scena specifica"""
        
        prompt = f"""
        Generate a Unity C# script for a scene controller based on this scene data:
        
        Scene Elements: {scene_data.get('elementi_narrativi', '')}
        Characters: {scene_data.get('personaggi', '')}
        Setting: {scene_data.get('ambientazione', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        Action: {scene_data.get('azione_in_corso', '')}
        
        Requirements:
        - Create a SceneController MonoBehaviour
        - Include character spawn points and management
        - Add environmental effects based on mood
        - Implement interaction triggers
        - Use modern Unity practices (2022.3+)
        - Include XML documentation
        - Follow SOLID principles
        
        Make it modular and easily extensible for AR features.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            code = response.choices[0].message.content
            logger.info(f"Generated scene controller for scene with mood: {scene_data.get('mood_vibe', 'unknown')}")
            return code
            
        except Exception as e:
            logger.error(f"Error generating scene controller: {e}")
            raise
    
    async def generate_character_controller(self, character_data: str) -> str:
        """Genera un controller per un personaggio specifico"""
        
        prompt = f"""
        Generate a Unity C# character controller script for this character:
        
        Character Description: {character_data}
        
        Requirements:
        - Create a CharacterController MonoBehaviour
        - Include basic movement and animation
        - Add dialogue system integration
        - Include emotion/mood system
        - Support for AR interaction
        - Use Unity's new Input System
        - Include state machine for behavior
        - XML documentation
        
        Make it compatible with both traditional and AR gameplay.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating character controller: {e}")
            raise
    
    async def generate_interaction_system(self, scene_action: str) -> str:
        """Genera sistema di interazione basato sull'azione della scena"""
        
        prompt = f"""
        Generate a Unity C# interaction system for this scene action:
        
        Scene Action: {scene_action}
        
        Requirements:
        - Create an InteractionSystem MonoBehaviour
        - Support both touch/click and AR gestures
        - Include feedback systems (visual, audio, haptic)
        - Event-driven architecture
        - Support for multiple interaction types
        - Integration with scene progression
        - Performance optimized
        - XML documentation
        
        Focus on creating engaging, intuitive interactions.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating interaction system: {e}")
            raise
    
    async def generate_ar_features(self, scene_data: Dict[str, Any]) -> str:
        """Genera features AR specifiche per la scena"""
        
        prompt = f"""
        Generate Unity C# scripts for AR features based on this scene:
        
        Setting: {scene_data.get('ambientazione', '')}
        Elements: {scene_data.get('elementi_narrativi', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        
        Requirements:
        - Use Unity's AR Foundation
        - Plane detection and anchoring
        - Object placement and manipulation
        - Lighting estimation integration
        - Occlusion handling
        - Performance optimization for mobile
        - Support for both Android and iOS
        - XML documentation
        
        Create immersive AR experiences that bring the literary scene to life.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating AR features: {e}")
            raise
