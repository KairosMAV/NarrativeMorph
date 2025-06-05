"""
Asset Generation Agent
Genera asset 3D, texture, audio e altri contenuti per Unity
"""
from typing import List, Dict, Any, Optional
from openai import OpenAI
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AssetGenerationAgent:
    """Agente specializzato nella generazione di asset per Unity"""
    
    def __init__(self, openai_api_key: str, model: str = "gpt-4"):
        self.api_key = openai_api_key
        self.model = model
        self.is_mock_mode = (not openai_api_key or 
                           openai_api_key in ["mock-api-key", "test-api-key", "your-api-key-here"])
        
        if self.is_mock_mode:
            from ..utils.mock_openai import MockOpenAIClient
            self.client = MockOpenAIClient()
            logger.info("Asset Generation Agent initialized in MOCK mode")
        else:
            # Get base URL from environment for OpenRouter support
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            logger.info(f"Asset Generation Agent initializing OpenAI client in PRODUCTION mode. Base URL: {base_url}, Model: {self.model}")
            # Adding HTTP-Referer and X-Title headers as per OpenRouter documentation
            self.client = OpenAI(
                api_key=openai_api_key,
                base_url=base_url,
                default_headers={
                    "HTTP-Referer": "http://localhost:8000",
                    "X-Title": "BookToGame"
                }
            )
            logger.info("Asset Generation Agent OpenAI client configured with custom headers for OpenRouter.")
            
        self.role = "Technical Artist & Asset Specialist"
        self.goal = "Generate comprehensive asset specifications for Unity projects"
        self.backstory = """You are a technical artist with extensive experience in:
        - 3D modeling and texturing workflows
        - Unity asset optimization
        - Procedural generation techniques
        - AR/VR asset requirements
        - Performance optimization
        - Cross-platform compatibility
        - Asset pipeline automation"""
    
    async def generate_3d_asset_specs(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Genera specifiche per asset 3D basati sulla scena"""
        
        prompt = f"""
        Generate detailed 3D asset specifications for this literary scene:
        
        Setting: {scene_data.get('ambientazione', '')}
        Elements: {scene_data.get('elementi_narrativi', '')}
        Characters: {scene_data.get('personaggi', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        
        Create specifications for:
        - Environment assets (buildings, terrain, props)
        - Character models and rigs
        - Interactive objects
        - Atmospheric elements
        - Lighting setup
        
        For each asset, specify:
        - Poly count targets (mobile/desktop/AR)
        - Texture resolution and formats
        - LOD (Level of Detail) requirements
        - Animation requirements
        - Material specifications
        - Collision setup
        - Optimization guidelines
        
        Return structured JSON with detailed specifications.
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
            asset_specs = json.loads(response.choices[0].message.content)
            
            logger.info("Generated 3D asset specifications")
            return asset_specs
            
        except Exception as e:
            logger.error(f"Error generating 3D asset specs: {e}")
            raise
    
    async def generate_audio_specs(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Genera specifiche per asset audio"""
        
        prompt = f"""
        Generate comprehensive audio specifications for this scene:
        
        Setting: {scene_data.get('ambientazione', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        Action: {scene_data.get('azione_in_corso', '')}
        Characters: {scene_data.get('personaggi', '')}
        
        Create specifications for:
        - Ambient soundscapes
        - Character voice acting guidelines
        - Sound effects for interactions
        - Musical themes and variations
        - Spatial audio for AR/VR
        - Dynamic audio mixing
        
        For each audio element, specify:
        - Audio format and quality requirements
        - Loop points and seamless transitions
        - Dynamic range and compression
        - Spatial audio positioning
        - Accessibility features (visual indicators)
        - Performance optimization
        
        Return structured JSON with detailed audio specifications.
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
            audio_specs = json.loads(response.choices[0].message.content)
            
            logger.info("Generated audio specifications")
            return audio_specs
            
        except Exception as e:
            logger.error(f"Error generating audio specs: {e}")
            raise
    
    async def generate_ui_asset_specs(self, game_design: Dict[str, Any]) -> Dict[str, Any]:
        """Genera specifiche per asset UI/UX"""
        
        prompt = f"""
        Generate UI/UX asset specifications for this game design:
        
        Game Type: {game_design.get('game_type', '')}
        Mechanics: {game_design.get('mechanics', '')}
        Controls: {game_design.get('controls', '')}
        
        Create specifications for:
        - HUD elements and layout
        - Menu systems and navigation
        - Interactive buttons and controls
        - Progress indicators and feedback
        - Accessibility UI elements
        - AR UI overlays
        - Responsive design for different screen sizes
        
        For each UI element, specify:
        - Visual style and theming
        - Animation and transition requirements
        - Touch/gesture interaction zones
        - Accessibility standards compliance
        - Multi-language support
        - Performance considerations
        
        Return structured JSON with detailed UI specifications.
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
            ui_specs = json.loads(response.choices[0].message.content)
            
            logger.info("Generated UI asset specifications")
            return ui_specs
            
        except Exception as e:
            logger.error(f"Error generating UI specs: {e}")
            raise
    
    async def generate_shader_specs(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Genera specifiche per shader custom"""
        
        prompt = f"""
        Generate custom shader specifications for this scene:
        
        Setting: {scene_data.get('ambientazione', '')}
        Elements: {scene_data.get('elementi_narrativi', '')}
        Mood: {scene_data.get('mood_vibe', '')}
        
        Create shader specifications for:
        - Atmospheric effects (fog, lighting, weather)
        - Character rendering (skin, clothing, hair)
        - Environmental materials (stone, wood, metal)
        - Special effects (magic, fire, water)
        - AR integration shaders
        - Performance-optimized variants
        
        For each shader, specify:
        - Shader type (surface, vertex, fragment)
        - Input parameters and properties
        - Performance requirements
        - Platform compatibility
        - Lighting model integration
        - Animation capabilities
        
        Return structured JSON with shader specifications.
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
            shader_specs = json.loads(response.choices[0].message.content)
            
            logger.info("Generated shader specifications")
            return shader_specs
            
        except Exception as e:
            logger.error(f"Error generating shader specs: {e}")
            raise
    
    async def create_asset_pipeline(self, project_specs: Dict[str, Any]) -> Dict[str, Any]:
        """Crea una pipeline per la generazione automatica degli asset"""
        
        prompt = f"""
        Create an automated asset pipeline for this Unity project.
        
        Project Requirements:
        - Target platforms: Mobile, Desktop, AR/VR
        - Asset types: 3D models, textures, audio, UI, shaders
        - Performance targets: 60fps on mid-range devices
        - File size constraints: Mobile-optimized
        
        Design a pipeline that includes:
        - Asset import and validation
        - Automatic optimization for different platforms
        - Quality assurance checks
        - Version control integration
        - Batch processing capabilities
        - Asset dependency management
        
        Return structured JSON with:
        - pipeline_stages: step-by-step process
        - automation_tools: scripts and utilities needed
        - quality_metrics: validation criteria
        - optimization_rules: platform-specific optimizations
        - workflow_integration: tool chain integration
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
            pipeline_specs = json.loads(response.choices[0].message.content)
            
            logger.info("Created asset pipeline specifications")
            return pipeline_specs
            
        except Exception as e:
            logger.error(f"Error creating asset pipeline: {e}")
            raise
