"""
Asset Generation Agent
Genera asset 3D, texture, audio e altri contenuti per Unity
Integrato con Replicate API per generazione di immagini e video
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
            logger.info("Asset Generation Agent OpenAI client configured with custom headers for OpenRouter.")        # Initialize Replicate service with lazy loading to avoid circular imports
        self._replicate_service = None
            
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
    
    @property
    def replicate_service(self):
        """Lazy loading of ReplicateService to avoid circular imports"""
        if self._replicate_service is None:
            from ..services.replicate_service import ReplicateService
            self._replicate_service = ReplicateService()
            logger.info(f"Replicate service initialized (Mock mode: {self._replicate_service.is_mock_mode})")
        return self._replicate_service
    
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
        
        # Replicate-powered asset generation methods
    async def generate_visual_assets_with_replicate(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate visual assets using Replicate API
        Following the async pattern from text-chunker and other agents
        """
        logger.info("Generating visual assets using Replicate API")
        
        try:
            # Generate complete asset package using Replicate service
            replicate_assets = await self.replicate_service.generate_scene_assets(scene_data)
            
            # Also generate technical specifications using OpenAI
            asset_specs = await self.generate_3d_asset_specs(scene_data)
            
            # Combine Replicate-generated assets with technical specifications
            combined_assets = {
                "generated_assets": replicate_assets,
                "technical_specifications": asset_specs,
                "integration_guidelines": {
                    "environment_image": {
                        "usage": "Background texture or skybox",
                        "format": "JPG/PNG",
                        "resolution": "1920x1080",
                        "optimization": "Compress for mobile platforms"
                    },
                    "character_image": {
                        "usage": "Character reference or texture",
                        "format": "PNG with alpha",
                        "resolution": "1024x1024", 
                        "optimization": "Use for character card UI"
                    },
                    "video_asset": {
                        "usage": "Cinematic cutscene or background animation",
                        "format": "MP4",
                        "optimization": "Mobile-friendly compression"
                    }
                },
                "unity_import_instructions": {
                    "environment": [
                        "Import as Texture2D",
                        "Set texture type to Default",
                        "Enable 'Generate Mip Maps'",
                        "Assign to environment material"
                    ],
                    "character": [
                        "Import as Texture2D",
                        "Set texture type to Default",
                        "Apply to character material",
                        "Use for UI portrait if needed"
                    ],
                    "video": [
                        "Import as VideoClip",
                        "Set compression to H.264",
                        "Assign to VideoPlayer component",
                        "Configure for platform optimization"
                    ]
                }
            }
            
            logger.info(f"Successfully generated {replicate_assets.get('generation_summary', {}).get('total_assets', 0)} visual assets")
            return combined_assets
            
        except Exception as e:
            logger.error(f"Error generating visual assets with Replicate: {e}")
            # Fallback to specifications only if Replicate fails
            return {
                "error": str(e),
                "fallback_specifications": await self.generate_3d_asset_specs(scene_data),
                "status": "partial_success"
            }
    
    async def generate_character_assets(self, character_description: str, style: str = "realistic") -> Dict[str, Any]:
        """Generate character-specific assets using Replicate"""
        logger.info(f"Generating character assets for: {character_description}")
        
        try:
            # Generate character image using Replicate
            character_asset = await self.replicate_service.generate_character_image(character_description, style)
            
            # Generate technical specifications for the character
            char_prompt = f"""
            Create detailed technical specifications for this character: {character_description}
            Style: {style}
            
            Generate specifications for:
            - 3D model requirements (poly count, rigging)
            - Texture maps needed (diffuse, normal, roughness)
            - Animation set (idle, walk, talk, gesture)
            - Unity controller setup
            - Mobile optimization guidelines
            
            Return JSON with detailed specifications.
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": char_prompt}
                ],
                temperature=0.7
            )
            
            import json
            tech_specs = json.loads(response.choices[0].message.content)
            
            return {
                "generated_image": character_asset,
                "technical_specifications": tech_specs,
                "unity_integration": {
                    "image_usage": "Character portrait, reference, or texture base",
                    "recommended_workflow": [
                        "Use generated image as character reference",
                        "Create 3D model based on specifications",
                        "Apply generated image as texture base",
                        "Implement suggested animation set"
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating character assets: {e}")
            raise
    
    async def generate_environment_assets(self, environment_description: str, mood: str = "neutral") -> Dict[str, Any]:
        """Generate environment-specific assets using Replicate"""
        logger.info(f"Generating environment assets for: {environment_description}")
        
        try:
            # Generate environment image using Replicate
            env_asset = await self.replicate_service.generate_scene_environment(environment_description, mood)
            
            # Generate technical specifications
            env_prompt = f"""
            Create environment asset specifications for: {environment_description}
            Mood: {mood}
            
            Generate specifications for:
            - Level layout and architecture
            - Lighting setup and atmospheric effects
            - Prop and decoration requirements
            - Interactive elements placement
            - Performance optimization for mobile/AR
            
            Return JSON with detailed environment specifications.
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a {self.role}. {self.backstory}"},
                    {"role": "user", "content": env_prompt}
                ],
                temperature=0.7
            )
            
            import json
            env_specs = json.loads(response.choices[0].message.content)
            
            return {
                "generated_image": env_asset,
                "technical_specifications": env_specs,
                "unity_integration": {
                    "image_usage": "Skybox, background plane, or texture reference",
                    "implementation_suggestions": [
                        "Use as skybox material for outdoor scenes",
                        "Apply to background quad for 2.5D setup",
                        "Extract color palette for lighting setup",
                        "Use as reference for 3D environment modeling"
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating environment assets: {e}")
            raise
