# 🏗️ IMPLEMENTAZIONE MVP - STEP BY STEP

## 1. CONSOLIDAMENTO BACKEND (6h) - Con CrewAI
### Integrare text-chunker + CrewAI
```python
# narrative-morph-api/app/main.py
from fastapi import FastAPI, BackgroundTasks, WebSocket
from .services.text_processor import TextChunkerService
from .agents.crew_workflow import StoryToCinemaAgent
import uuid
import asyncio

app = FastAPI(title="Narrative Morph API")

# Global instances
story_agent = StoryToCinemaAgent()
active_jobs = {}  # In-memory job tracking

@app.post("/transform-story/")
async def transform_story(
    story: TextInput, 
    background_tasks: BackgroundTasks
):
    """Main endpoint: Story → Video pipeline"""
    
    # 1. Extract scenes (riuso text-chunker esistente)
    scenes = await TextChunkerService.extract_scenes(story.text)
    
    if not scenes:
        raise HTTPException(400, "No scenes could be extracted from story")
    
    # 2. Start CrewAI orchestration
    job_id = str(uuid.uuid4())
    active_jobs[job_id] = {
        "status": "processing",
        "progress": 0,
        "scenes_count": len(scenes),
        "current_step": "initializing"
    }
    
    # Background processing with CrewAI
    background_tasks.add_task(
        process_story_with_crew, 
        job_id, scenes
    )
    
    return {
        "job_id": job_id, 
        "status": "processing",
        "scenes_count": len(scenes),
        "estimated_time": f"{len(scenes) * 2}min"
    }

async def process_story_with_crew(job_id: str, scenes: List[Scene]):
    """Background task per CrewAI processing"""
    try:
        # Update status
        active_jobs[job_id].update({
            "status": "processing",
            "current_step": "generating_visuals",
            "progress": 10
        })
        
        # Execute CrewAI workflow
        result = await story_agent.process_story(scenes)
        
        # Update completion
        active_jobs[job_id].update({
            "status": "completed",
            "progress": 100,
            "video_url": result["video_url"],
            "quality_score": result.get("quality_score"),
            "current_step": "finished"
        })
        
    except Exception as e:
        active_jobs[job_id].update({
            "status": "failed",
            "error": str(e),
            "current_step": "error"
        })

@app.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """Check processing status"""
    if job_id not in active_jobs:
        raise HTTPException(404, "Job not found")
    
    return active_jobs[job_id]

@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """Real-time updates via WebSocket"""
    await websocket.accept()
    
    while True:
        if job_id in active_jobs:
            await websocket.send_json(active_jobs[job_id])
            
            # Close if completed or failed
            if active_jobs[job_id]["status"] in ["completed", "failed"]:
                break
                
        await asyncio.sleep(2)  # Update every 2 seconds
    
    await websocket.close()
```

## 2. CREWAI ORCHESTRATOR (8h) - Più Veloce!
### 4 Agenti Specializzati
```python
# app/agents/crew_workflow.py
from crewai import Agent, Task, Crew, Process
from crewai.tools import DallETool, ElevenLabsTool, FFmpegTool

class StoryToCinemaAgent:
    def __init__(self):
        # Agenti specializzati
        self.image_agent = Agent(
            role="Visual Story Director",
            goal="Create stunning visual representations for each story scene",
            backstory="Expert in cinematography and visual storytelling",
            tools=[DallETool()],
            llm=ChatOpenAI(model="gpt-4")
        )
        
        self.audio_agent = Agent(
            role="Narrative Voice Artist", 
            goal="Generate engaging narration audio for scenes",
            backstory="Professional voice actor with storytelling expertise",
            tools=[ElevenLabsTool()],
            llm=ChatOpenAI(model="gpt-4")
        )
        
        self.video_agent = Agent(
            role="Video Assembly Director",
            goal="Combine images and audio into cohesive video narrative",
            backstory="Expert video editor with timing and pacing mastery",
            tools=[FFmpegTool()],
            llm=ChatOpenAI(model="gpt-4")
        )
        
        self.quality_agent = Agent(
            role="Quality Assurance Specialist",
            goal="Ensure high quality output and narrative coherence",
            backstory="Critical eye for storytelling quality and technical standards",
            llm=ChatOpenAI(model="gpt-4")
        )
    
    def create_tasks(self, scenes: List[Scene]):
        tasks = []
        
        # Task 1: Generate Images
        image_task = Task(
            description=f"""
            Create visual representations for {len(scenes)} story scenes.
            Scenes data: {scenes}
            
            For each scene, generate a high-quality image that captures:
            - Setting and environment: {scene.ambientazione}
            - Characters and their appearance: {scene.personaggi}
            - Mood and atmosphere: {scene.mood_vibe}
            - Key narrative elements: {scene.elementi_narrativi}
            
            Return: List of image URLs and descriptions
            """,
            agent=self.image_agent,
            expected_output="JSON with scene_id, image_url, image_description for each scene"
        )
        
        # Task 2: Generate Audio Narration
        audio_task = Task(
            description=f"""
            Create engaging narration audio for {len(scenes)} scenes.
            Use the scene descriptions and generated images as reference.
            
            Generate natural, flowing narration that:
            - Describes the visual scene
            - Advances the story
            - Matches the mood: {scene.mood_vibe}
            - Highlights key actions: {scene.azione_in_corso}
            
            Return: List of audio files with timing information
            """,
            agent=self.audio_agent,
            expected_output="JSON with scene_id, audio_url, duration, transcript",
            context=[image_task]  # Depends on images
        )
        
        # Task 3: Assemble Video
        video_task = Task(
            description="""
            Combine generated images and audio into a cohesive video narrative.
            
            Create a video that:
            - Syncs images with corresponding audio
            - Uses smooth transitions between scenes
            - Maintains consistent timing and pacing
            - Includes subtle visual effects if appropriate
            
            Return: Final video file URL and metadata
            """,
            agent=self.video_agent,
            expected_output="JSON with video_url, duration, scene_timestamps",
            context=[image_task, audio_task]  # Depends on both
        )
        
        # Task 4: Quality Check
        quality_task = Task(
            description="""
            Review the final video for quality and narrative coherence.
            
            Check for:
            - Audio-visual synchronization
            - Story flow and pacing
            - Technical quality issues
            - Narrative consistency
            
            If issues found, provide specific feedback for improvements.
            """,
            agent=self.quality_agent,
            expected_output="Quality report with score and improvement suggestions",
            context=[video_task]
        )
        
        return [image_task, audio_task, video_task, quality_task]
    
    async def process_story(self, scenes: List[Scene]) -> dict:
        """Main orchestration method"""
        tasks = self.create_tasks(scenes)
        
        # Create crew with sequential process
        crew = Crew(
            agents=[self.image_agent, self.audio_agent, self.video_agent, self.quality_agent],
            tasks=tasks,
            process=Process.sequential,  # One task at a time
            verbose=True,  # For demo visibility
            memory=True   # Agents remember context
        )
        
        # Execute the workflow
        result = crew.kickoff()
        
        return {
            "status": "completed",
            "video_url": result.get("video_url"),
            "quality_score": result.get("quality_score"),
            "processing_log": crew.get_usage_metrics()
        }
```

## 3. FRONTEND DASHBOARD (12h) - Ridotto con CrewAI
### React + WebSocket per Real-time
```tsx
// src/components/StoryProcessor.tsx
export function StoryProcessor() {
  const [jobStatus, setJobStatus] = useState<JobStatus>();
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setJobStatus(update);
    };
  }, []);
  
  return (
    <div>
      <StoryUpload onSubmit={handleSubmit} />
      <ProgressTracker status={jobStatus} />
      <VideoPlayer url={jobStatus?.video_url} />
    </div>
  );
}
```

## 4. DEPLOYMENT SEMPLIFICATO
### Docker Compose Single Stack
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./narrative-morph-api
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./storage:/app/storage
  
  ui:
    build: ./narrative-morph-ui
    ports:
      - "3000:3000"
    depends_on:
      - api
```
