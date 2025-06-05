"""
Replicate API Service
Gestisce l'integrazione con Replicate API per generazione di immagini e video
Segue il pattern async del text-chunker per consistenza
"""
import asyncio
import os
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ReplicateService:
    """Servizio per l'integrazione con Replicate API"""
    
    def __init__(self):
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        self.is_mock_mode = (not self.api_token or 
                           self.api_token in ["your-replicate-api-token-here", "mock-token"])
        
        if self.is_mock_mode:
            logger.info("Replicate service initialized in MOCK mode")
            self.client = None
        else:
            try:
                import replicate
                self.client = replicate
                os.environ["REPLICATE_API_TOKEN"] = self.api_token
                logger.info("Replicate service initialized in PRODUCTION mode")
            except ImportError:
                logger.warning("Replicate package not installed. Falling back to mock mode.")
                self.is_mock_mode = True
                self.client = None
    
    def _process_replicate_output(self, output):
        """
        Process Replicate output to handle FileOutput objects and make them JSON serializable
        """
        if isinstance(output, list):
            # Handle list of outputs (common for image generation)
            processed_list = []
            for item in output:
                if hasattr(item, 'url'):
                    # FileOutput object with URL attribute
                    processed_list.append(str(item.url))
                elif hasattr(item, '__str__'):
                    # Any object that can be converted to string
                    processed_list.append(str(item))
                else:
                    processed_list.append(item)
            return processed_list
        elif hasattr(output, 'url'):
            # Single FileOutput object
            return str(output.url)
        elif hasattr(output, '__str__'):
            # Any object that can be converted to string
            return str(output)
        else:
            # Return as-is for primitive types
            return output
    
    async def _call_replicate_model(self, model_name: str, input_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Helper method to call Replicate models asynchronously
        Follows the same async pattern as text-chunker's _call_llm method
        """
        if self.is_mock_mode:
            return await self._generate_mock_response(model_name, input_params)
        
        try:            # Use asyncio.to_thread for blocking I/O, same pattern as text-chunker
            result = await asyncio.to_thread(
                self.client.run,
                model_name,
                input=input_params
            )
            
            # Convert FileOutput objects to strings for JSON serialization
            processed_result = self._process_replicate_output(result)
            return {"status": "success", "output": processed_result}
            
        except Exception as e:
            logger.error(f"Error calling Replicate model {model_name}: {e}")
            # Fallback to mock response on error
            return await self._generate_mock_response(model_name, input_params)
    
    async def _generate_mock_response(self, model_name: str, input_params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock responses for development mode"""
        
        # Simulate API delay
        await asyncio.sleep(0.5)
        
        if "flux" in model_name.lower() or "image" in model_name.lower():
            return {
                "status": "mock",
                "output": [
                    "https://via.placeholder.com/1024x1024/4A90E2/FFFFFF?text=Generated+Scene+Image"
                ],
                "mock_metadata": {
                    "prompt": input_params.get("prompt", ""),
                    "model": model_name,
                    "note": "This is a mock image URL for development"
                }
            }
        
        elif "video" in model_name.lower():
            return {
                "status": "mock", 
                "output": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                "mock_metadata": {
                    "prompt": input_params.get("prompt", ""),
                    "model": model_name,
                    "note": "This is a mock video URL for development"
                }
            }
        
        else:
            return {
                "status": "mock",
                "output": "Mock response for development mode",
                "mock_metadata": {
                    "model": model_name,
                    "input": input_params
                }
            }
    
    async def generate_scene_image(self, prompt: str, style: str = "cinematic", aspect_ratio: str = "16:9") -> Dict[str, Any]:
        """Generate scene image using Flux model"""
        
        enhanced_prompt = f"""
        {prompt}
        
        Style: {style}, high-quality, detailed, professional illustration,
        dramatic lighting, Unity game engine compatible, {aspect_ratio} aspect ratio,
        educational content appropriate, book illustration style
        """
        
        model_name = "black-forest-labs/flux-schnell"
        input_params = {
            "prompt": enhanced_prompt,
            "aspect_ratio": aspect_ratio,
            "output_format": "png",
            "output_quality": 90
        }
        
        logger.info(f"Generating scene image with prompt: {prompt[:50]}...")
        result = await self._call_replicate_model(model_name, input_params)
        
        return {
            "image_url": result.get("output", [""])[0] if isinstance(result.get("output"), list) else result.get("output", ""),
            "prompt_used": enhanced_prompt,
            "model": model_name,
            "generation_status": result.get("status", "unknown"),
            "metadata": result.get("mock_metadata", {})
        }
    
    async def generate_character_image(self, character_description: str, style: str = "realistic") -> Dict[str, Any]:
        """Generate character image"""
        
        enhanced_prompt = f"""
        Character portrait: {character_description}
        
        Style: {style}, high-quality character design, detailed facial features,
        educational game character, appropriate for all ages, Unity compatible,
        clear background or simple environment, character focus, portrait orientation
        """
        
        model_name = "black-forest-labs/flux-schnell"
        input_params = {
            "prompt": enhanced_prompt,
            "aspect_ratio": "3:4",  # Portrait orientation for characters
            "output_format": "png",
            "output_quality": 90
        }
        
        logger.info(f"Generating character image: {character_description[:50]}...")
        result = await self._call_replicate_model(model_name, input_params)
        
        return {
            "image_url": result.get("output", [""])[0] if isinstance(result.get("output"), list) else result.get("output", ""),
            "prompt_used": enhanced_prompt,
            "model": model_name,
            "generation_status": result.get("status", "unknown"),
            "character_description": character_description,
            "metadata": result.get("mock_metadata", {})
        }
    
    async def generate_scene_environment(self, environment_description: str, mood: str = "neutral") -> Dict[str, Any]:
        """Generate environment/background image"""
        
        enhanced_prompt = f"""
        Environment scene: {environment_description}
        
        Mood: {mood}, atmospheric, detailed environment, Unity game background,
        cinematic lighting, educational content appropriate, wide shot,
        immersive setting, {mood} atmosphere, high-quality game art style
        """
        
        model_name = "black-forest-labs/flux-schnell"
        input_params = {
            "prompt": enhanced_prompt,
            "aspect_ratio": "16:9",  # Landscape for environments
            "output_format": "png",
            "output_quality": 90
        }
        
        logger.info(f"Generating environment image: {environment_description[:50]}...")
        result = await self._call_replicate_model(model_name, input_params)
        
        return {
            "image_url": result.get("output", [""])[0] if isinstance(result.get("output"), list) else result.get("output", ""),
            "prompt_used": enhanced_prompt,
            "model": model_name,
            "generation_status": result.get("status", "unknown"),
            "environment_description": environment_description,
            "mood": mood,
            "metadata": result.get("mock_metadata", {})
        }
    
    async def generate_scene_video(self, image_url: str, motion_prompt: str = "subtle movement") -> Dict[str, Any]:
        """Generate video from image using Stable Video Diffusion"""
        
        # Note: This would use a video generation model like Stable Video Diffusion
        model_name = "stability-ai/stable-video-diffusion-img2vid-xt"
        input_params = {
            "input_image": image_url,
            "motion_bucket_id": 127,
            "cond_aug": 0.02,
            "decoding_t": 2,
            "num_frames": 25,  # Short video for educational content
            "fps": 6  # Lower FPS for educational content
        }
        
        logger.info(f"Generating video from image: {image_url}")
        result = await self._call_replicate_model(model_name, input_params)
        
        return {
            "video_url": result.get("output", ""),
            "source_image": image_url,
            "motion_prompt": motion_prompt,
            "model": model_name,
            "generation_status": result.get("status", "unknown"),
            "metadata": result.get("mock_metadata", {})
        }
    
    async def generate_scene_assets(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate complete asset package for a scene
        Combines multiple Replicate calls for comprehensive scene assets
        """
        logger.info("Generating complete scene asset package")
        
        # Extract scene information
        setting = scene_data.get('ambientazione', '')
        characters = scene_data.get('personaggi', '')
        mood = scene_data.get('mood_vibe', 'neutral')
        elements = scene_data.get('elementi_narrativi', '')
        
        assets = {}
        
        try:
            # Generate environment image
            if setting:
                env_asset = await self.generate_scene_environment(setting, mood)
                assets['environment'] = env_asset
                
                # Generate video from environment image if successful
                if env_asset.get('image_url'):
                    video_asset = await self.generate_scene_video(
                        env_asset['image_url'], 
                        f"Atmospheric movement for {mood} scene"
                    )
                    assets['environment_video'] = video_asset
            
            # Generate character images if characters are mentioned
            if characters:
                character_asset = await self.generate_character_image(characters)
                assets['character'] = character_asset
            
            # Generate additional narrative element image
            if elements:
                narrative_prompt = f"{setting} with {elements}, {mood} atmosphere"
                narrative_asset = await self.generate_scene_image(narrative_prompt, "book illustration")
                assets['narrative_scene'] = narrative_asset
            
            # Generation summary
            assets['generation_summary'] = {
                "total_assets": len(assets),
                "asset_types": list(assets.keys()),
                "scene_processed": {
                    "setting": setting,
                    "characters": characters,
                    "mood": mood,
                    "elements": elements
                },
                "generation_status": "success"
            }
            
            logger.info(f"Successfully generated {len(assets)} scene assets")
            return assets
            
        except Exception as e:
            logger.error(f"Error generating scene assets: {e}")
            return {
                "error": str(e),
                "generation_summary": {
                    "total_assets": 0,
                    "generation_status": "failed"
                }
            }
