"""
🤖 NarrativeMorph - CrewAI Agents
Specialized AI agents for story-to-video transformation
"""
from crewai import Agent, Task, Crew
from crewai.tools import BaseTool
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class StoryAnalyzerAgent:
    """Agent specialized in analyzing narrative structure"""
    
    def __init__(self):
        self.agent = Agent(
            role='Story Analyst',
            goal='Analyze narrative text and extract meaningful story elements',
            backstory="""You are an expert narrative analyst with deep understanding of 
            storytelling structure, character development, and scene composition. You excel 
            at breaking down complex narratives into their fundamental components.""",
            verbose=True,
            allow_delegation=False
        )
    
    def create_analysis_task(self, text: str) -> Task:
        """Create a task to analyze story structure"""
        return Task(
            description=f"""
            Analyze the following narrative text and extract:
            1. Main characters and their roles
            2. Key scenes and their emotional tone
            3. Setting and atmosphere descriptions
            4. Dialogue and character interactions
            5. Action sequences and plot points
            
            Text to analyze:
            {text}
            
            Provide structured output that can be used for video generation.
            """,
            agent=self.agent,
            expected_output="Structured analysis with characters, scenes, settings, and actions"
        )


class SceneDirectorAgent:
    """Agent specialized in creating cinematic scene descriptions"""
    
    def __init__(self):
        self.agent = Agent(
            role='Scene Director',
            goal='Transform narrative elements into detailed visual scene descriptions',
            backstory="""You are a visionary film director with expertise in translating 
            written narratives into compelling visual scenes. You understand camera angles, 
            lighting, composition, and how to create emotional impact through visual storytelling.""",
            verbose=True,
            allow_delegation=False
        )
    
    def create_scene_task(self, scene_data: Dict[str, Any]) -> Task:
        """Create a task to generate scene directions"""
        return Task(
            description=f"""
            Based on the narrative analysis, create detailed scene directions for video generation:
            
            Scene Elements:
            - Characters: {scene_data.get('personaggi', '')}
            - Setting: {scene_data.get('ambientazione', '')}
            - Actions: {scene_data.get('azioni', '')}
            - Emotions: {scene_data.get('emozioni', '')}
            - Dialogue: {scene_data.get('dialoghi', '')}
            
            Generate:
            1. Camera angles and movements
            2. Lighting and atmosphere
            3. Character positioning and expressions
            4. Environmental details
            5. Pacing and timing suggestions
            
            Create prompts suitable for AI video generation.
            """,
            agent=self.agent,
            expected_output="Detailed scene directions with camera work, lighting, and visual composition"
        )


class VideoPromptAgent:
    """Agent specialized in creating optimized prompts for CogVideoX"""
    
    def __init__(self):
        self.agent = Agent(
            role='Video Prompt Engineer',
            goal='Create optimized prompts for AI video generation models',
            backstory="""You are an expert in AI video generation models, particularly 
            CogVideoX. You understand how to craft prompts that produce high-quality, 
            coherent video content that matches narrative requirements.""",
            verbose=True,
            allow_delegation=False
        )
    
    def create_prompt_task(self, scene_directions: str) -> Task:
        """Create a task to generate video prompts"""
        return Task(
            description=f"""
            Based on the scene directions, create optimized prompts for CogVideoX:
            
            Scene Directions:
            {scene_directions}
            
            Generate:
            1. Main video prompt (clear, descriptive, under 200 characters)
            2. Style specifications (cinematic, realistic, etc.)
            3. Technical parameters (resolution, duration, etc.)
            4. Negative prompts (what to avoid)
            5. Quality enhancers
            
            Ensure prompts are optimized for CogVideoX model capabilities.
            """,
            agent=self.agent,
            expected_output="Optimized video generation prompts with technical specifications"
        )


class UnityScriptAgent:
    """Agent specialized in creating Unity interactive experiences"""
    
    def __init__(self):
        self.agent = Agent(
            role='Unity Developer',
            goal='Create interactive Unity experiences from narrative content',
            backstory="""You are an experienced Unity developer specializing in narrative-driven 
            interactive experiences. You understand how to create engaging interactive content 
            that allows users to explore and interact with story elements.""",
            verbose=True,
            allow_delegation=False
        )
    
    def create_unity_task(self, project_data: Dict[str, Any]) -> Task:
        """Create a task to generate Unity project specifications"""
        return Task(
            description=f"""
            Create Unity project specifications for an interactive narrative experience:
            
            Project Data:
            - Title: {project_data.get('title', '')}
            - Scenes: {project_data.get('total_scenes', 0)}
            - Characters: {project_data.get('characters', [])}
            
            Generate:
            1. Scene hierarchy and organization
            2. Interactive elements and mechanics
            3. User interface design
            4. Navigation and progression system
            5. Asset requirements and specifications
            
            Create a comprehensive Unity project structure.
            """,
            agent=self.agent,
            expected_output="Unity project specifications with interactive elements and scene structure"
        )


class NarrativeMorphCrew:
    """Main crew orchestrator for the NarrativeMorph pipeline"""
    
    def __init__(self):
        self.story_analyzer = StoryAnalyzerAgent()
        self.scene_director = SceneDirectorAgent()
        self.video_prompt_agent = VideoPromptAgent()
        self.unity_script_agent = UnityScriptAgent()
        
        self.crew = Crew(
            agents=[
                self.story_analyzer.agent,
                self.scene_director.agent,
                self.video_prompt_agent.agent,
                self.unity_script_agent.agent
            ],
            verbose=2
        )
    
    async def process_narrative(self, text: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process narrative through the complete pipeline"""
        try:
            logger.info("Starting narrative processing with CrewAI")
            
            # Step 1: Analyze story structure
            analysis_task = self.story_analyzer.create_analysis_task(text)
            
            # Step 2: Create scene directions
            # This would be done for each scene extracted from the text
            
            # Step 3: Generate video prompts
            # This would be done for each scene
            
            # Step 4: Create Unity specifications
            unity_task = self.unity_script_agent.create_unity_task(project_data)
            
            # Execute crew (simplified for hackathon)
            logger.info("Executing CrewAI tasks...")
            
            # For hackathon, return mock results
            return {
                "story_analysis": "Narrative analysis completed",
                "scene_directions": "Scene directions generated",
                "video_prompts": "Video prompts created",
                "unity_specs": "Unity specifications generated"
            }
            
        except Exception as e:
            logger.error(f"Error in CrewAI processing: {e}")
            raise


# Global crew instance
narrative_crew = NarrativeMorphCrew()
