# 🛠️ CREWAI TOOLS IMPLEMENTATION

## Custom Tools per il Pipeline

### 1. DALL-E Tool
```python
# app/tools/dalle_tool.py
from crewai.tools import BaseTool
from openai import OpenAI
import os

class DalleTool(BaseTool):
    name: str = "DALL-E Image Generator"
    description: str = "Generate high-quality images from scene descriptions"
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def _run(self, scene_description: str, style: str = "cinematic") -> str:
        """Generate image using DALL-E 3"""
        
        # Enhanced prompt per risultati migliori
        enhanced_prompt = f"""
        {scene_description}
        
        Style: {style}, high-quality, detailed, professional photography,
        dramatic lighting, cinematic composition, 4K resolution
        """
        
        try:
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=enhanced_prompt,
                size="1792x1024",  # Widescreen per video
                quality="hd",
                n=1
            )
            
            image_url = response.data[0].url
            return {
                "image_url": image_url,
                "prompt_used": enhanced_prompt,
                "model": "dall-e-3"
            }
            
        except Exception as e:
            return {"error": f"Image generation failed: {str(e)}"}
```

### 2. ElevenLabs TTS Tool  
```python
# app/tools/elevenlabs_tool.py
from crewai.tools import BaseTool
import requests
import os

class ElevenLabsTool(BaseTool):
    name: str = "ElevenLabs TTS"
    description: str = "Convert scene descriptions to natural speech"
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default narrator voice
    
    def _run(self, text: str, voice_style: str = "narrative") -> dict:
        """Generate speech from text"""
        
        # API call to ElevenLabs
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5,
                "style": 0.3 if voice_style == "narrative" else 0.7
            }
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                # Save audio file
                audio_filename = f"audio_{hash(text)}.mp3"
                audio_path = f"storage/audio/{audio_filename}"
                
                with open(audio_path, 'wb') as f:
                    f.write(response.content)
                
                return {
                    "audio_url": f"/storage/audio/{audio_filename}",
                    "duration": self._estimate_duration(text),
                    "text": text
                }
            else:
                return {"error": f"TTS failed: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"TTS error: {str(e)}"}
    
    def _estimate_duration(self, text: str) -> float:
        """Estimate audio duration (rough calculation)"""
        words = len(text.split())
        return words / 2.5  # ~2.5 words per second average
```

### 3. FFmpeg Video Assembly Tool
```python
# app/tools/ffmpeg_tool.py
from crewai.tools import BaseTool
import subprocess
import os
import json

class FFmpegTool(BaseTool):
    name: str = "FFmpeg Video Assembler"
    description: str = "Combine images and audio into video narrative"
    
    def _run(self, scenes_data: list) -> dict:
        """Assemble video from scenes"""
        
        try:
            # Prepare FFmpeg inputs
            input_files = []
            filter_complex = []
            
            for i, scene in enumerate(scenes_data):
                image_path = scene["image_path"] 
                audio_path = scene["audio_path"]
                duration = scene["audio_duration"]
                
                # Add image input (loop for duration)
                input_files.extend([
                    "-loop", "1",
                    "-t", str(duration),
                    "-i", image_path,
                    "-i", audio_path
                ])
                
                # Video filter for this scene
                filter_complex.append(
                    f"[{i*2}:v]scale=1920:1080:force_original_aspect_ratio=increase,"
                    f"crop=1920:1080,setpts=PTS-STARTPTS,fade=in:0:30,fade=out:{int(duration*30-30)}:30[v{i}];"
                )
                
                # Audio filter
                filter_complex.append(f"[{i*2+1}:a]asetpts=PTS-STARTPTS[a{i}];")
            
            # Concatenate all scenes
            video_concat = "".join([f"[v{i}]" for i in range(len(scenes_data))])
            audio_concat = "".join([f"[a{i}]" for i in range(len(scenes_data))])
            
            filter_complex.append(f"{video_concat}concat=n={len(scenes_data)}:v=1:a=0[outv];")
            filter_complex.append(f"{audio_concat}concat=n={len(scenes_data)}:v=0:a=1[outa]")
            
            # Output file
            output_path = f"storage/videos/story_{hash(str(scenes_data))}.mp4"
            
            # FFmpeg command
            cmd = [
                "ffmpeg", "-y",  # Overwrite output
                *input_files,
                "-filter_complex", "".join(filter_complex),
                "-map", "[outv]",
                "-map", "[outa]", 
                "-c:v", "libx264",
                "-c:a", "aac",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",  # Web optimization
                output_path
            ]
            
            # Execute FFmpeg
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return {
                    "video_url": f"/storage/videos/{os.path.basename(output_path)}",
                    "duration": sum(scene["audio_duration"] for scene in scenes_data),
                    "scenes_count": len(scenes_data),
                    "resolution": "1920x1080"
                }
            else:
                return {"error": f"FFmpeg failed: {result.stderr}"}
                
        except Exception as e:
            return {"error": f"Video assembly error: {str(e)}"}
```

## CrewAI Process Flow

### Sequential Process (Raccomandato per MVP)
```python
# I task vengono eseguiti in sequenza:
# 1. Image Generation (parallelo per scene)
# 2. Audio Generation (usa images come context) 
# 3. Video Assembly (usa images + audio)
# 4. Quality Check (valida output finale)

process = Process.sequential
```

### Hierarchical Process (Per versioni avanzate)
```python
# Un Manager Agent coordina Worker Agents
# Utile per workflow più complessi con decisioni dinamiche

process = Process.hierarchical
manager_llm = ChatOpenAI(model="gpt-4", temperature=0.2)
```

## Vantaggi CrewAI per Demo

1. **Conversation Logs**: Puoi mostrare le "conversazioni" tra agenti
2. **Built-in Retry**: Automatic retry su failures
3. **Memory Persistence**: Gli agenti ricordano context precedenti
4. **Tool Integration**: Plug & play con tools esterni
5. **Progress Tracking**: Built-in progress monitoring

## Timeline Aggiornata con CrewAI

- **Setup**: 2 ore (vs 8 ore con LangGraph)
- **Tools Development**: 4 ore
- **Integration**: 2 ore  
- **Testing & Debug**: 4 ore

**Total: 12 ore** invece di 20+ con LangGraph!
