"""
Game Design Agent
Progetta meccaniche di gioco e minigame basati sulle scene del libro
"""
from typing import List, Dict, Any, Optional
from openai import OpenAI
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GameDesignAgent:
    """Agente specializzato nel design di meccaniche di gioco"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.api_key = openai_api_key
        self.model = model
        self.is_mock_mode = (not openai_api_key or 
                           openai_api_key in ["mock-api-key", "test-api-key", "your-api-key-here"])
        
        if self.is_mock_mode:
            from ..utils.mock_openai import MockOpenAIClient
            self.client = MockOpenAIClient()
            logger.info("Game Design Agent initialized in MOCK mode")
        else:
            # Get base URL from environment for OpenRouter support
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            logger.info(f"Game Design Agent initializing OpenAI client in PRODUCTION mode. Base URL: {base_url}, Model: {self.model}")
            # Adding HTTP-Referer and X-Title headers as per OpenRouter documentation
            self.client = OpenAI(
                api_key=openai_api_key,
                base_url=base_url,
                default_headers={
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "BookToGame"
                }
            )
            logger.info("Game Design Agent OpenAI client configured with custom headers for OpenRouter.")
            
        self.role = "Senior Game Designer"
        self.goal = "Create engaging game mechanics that enhance literary narratives"
        self.backstory = """You are a renowned game designer who worked on acclaimed narrative games.
        You understand how to transform literary content into engaging interactive experiences.
        Your expertise includes:
        - Narrative-driven game mechanics
        - Player engagement and flow
        - Educational game design
        - AR/VR interaction design
        - Accessibility and inclusivity
        - Playtesting and iteration"""
    
    async def design_minigame(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Progetta un minigame basato su una scena specifica"""
        
        prompt = f"""
        Design an engaging minigame based on this literary scene:
        
        Scene Elements: {scene_data.get('elementi_narrativi', '')}
        Characters: {scene_data.get('personaggi', '')}
        Setting: {scene_data.get('ambientazione', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        Action: {scene_data.get('azione_in_corso', '')}
        
        Design Requirements:
        - Create a 2-5 minute engaging minigame
        - Relate directly to the scene's narrative
        - Include clear objectives and victory conditions
        - Support both traditional and AR modes
        - Consider different skill levels
        - Include educational value
        - Specify UI/UX requirements
        - Define scoring/progression system
        
        Return a structured game design document in JSON format with:
        - game_type: (puzzle, action, exploration, dialogue, etc.)
        - objective: clear goal for the player
        - mechanics: core gameplay mechanics
        - controls: input methods for different platforms
        - difficulty_levels: adaptive difficulty options
        - ar_features: specific AR enhancements
        - educational_goals: learning objectives
        - estimated_playtime: expected duration
        - victory_conditions: how to win
        - progression: how progress is tracked
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            # Parse the JSON response
            import json
            game_design = json.loads(response.choices[0].message.content)
            
            logger.info(f"Designed {game_design.get('game_type', 'unknown')} minigame for scene")
            return game_design
            
        except Exception as e:
            logger.error(f"Error designing minigame: {e}")
            raise
    
    async def design_progression_system(self, all_scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Progetta un sistema di progressione per l'intero libro"""
        
        prompt = f"""
        Design a comprehensive progression system for a book with {len(all_scenes)} scenes.
        
        Create a system that:
        - Connects all scenes meaningfully
        - Tracks player progress through the narrative
        - Includes unlockable content and achievements
        - Supports different reading/playing styles
        - Includes character development mechanics
        - Has meaningful choices and consequences
        - Supports both individual and collaborative play
        
        Return a structured JSON with:
        - overall_structure: how scenes connect
        - progression_mechanics: XP, levels, unlocks
        - achievement_system: goals and rewards
        - character_development: how characters grow
        - choice_system: meaningful decisions
        - social_features: sharing and collaboration
        - accessibility: options for different players
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            import json
            progression_system = json.loads(response.choices[0].message.content)
            
            logger.info("Designed comprehensive progression system")
            return progression_system
            
        except Exception as e:
            logger.error(f"Error designing progression system: {e}")
            raise
    
    async def design_ar_experience(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Progetta un'esperienza AR specifica per la scena"""
        
        prompt = f"""
        Design an immersive AR experience for this literary scene:
        
        Setting: {scene_data.get('ambientazione', '')}
        Elements: {scene_data.get('elementi_narrativi', '')}
        Characters: {scene_data.get('personaggi', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        Action: {scene_data.get('azione_in_corso', '')}
        
        Design an AR experience that:
        - Brings the literary scene to life in the user's space
        - Allows meaningful interaction with characters and objects
        - Uses spatial audio and visual effects
        - Adapts to different room sizes and lighting
        - Includes guided and free exploration modes
        - Supports multiple users in shared AR
        - Has educational annotations and context
        
        Return structured JSON with:
        - ar_scene_setup: how to establish the AR environment
        - interactive_elements: what users can interact with
        - character_behaviors: how characters respond
        - environmental_effects: atmosphere and mood
        - user_interactions: gestures and actions
        - accessibility_features: options for different abilities
        - technical_requirements: device and space needs
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )
            
            import json
            ar_experience = json.loads(response.choices[0].message.content)
            
            logger.info(f"Designed AR experience for {scene_data.get('mood_vibe', 'unknown')} scene")
            return ar_experience
            
        except Exception as e:
            logger.error(f"Error designing AR experience: {e}")
            raise
    
    async def create_accessibility_guidelines(self, game_design: Dict[str, Any]) -> Dict[str, Any]:
        """Crea linee guida per l'accessibilità del gioco"""
        
        prompt = f"""
        Create comprehensive accessibility guidelines for this game design:
        
        Game Type: {game_design.get('game_type', '')}
        Mechanics: {game_design.get('mechanics', '')}
        Controls: {game_design.get('controls', '')}
        
        Create guidelines that ensure the game is accessible to:
        - Players with visual impairments
        - Players with hearing impairments
        - Players with motor disabilities
        - Players with cognitive differences
        - Players of different ages
        - Players with limited technology access
        
        Return structured JSON with specific recommendations for:
        - visual_accessibility: contrast, text size, alternative visual cues
        - audio_accessibility: subtitles, visual sound indicators
        - motor_accessibility: alternative control schemes
        - cognitive_accessibility: difficulty options, clear instructions
        - platform_accessibility: device requirements and alternatives
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
            
            import json
            accessibility_guidelines = json.loads(response.choices[0].message.content)
            
            logger.info("Created accessibility guidelines")
            return accessibility_guidelines
            
        except Exception as e:
            logger.error(f"Error creating accessibility guidelines: {e}")
            raise
