"""
Mock response system for development mode when OpenAI API is not available
"""
import json
import asyncio
from typing import Dict, Any, List


class MockOpenAIClient:
    """Mock OpenAI client for development mode"""
    
    def __init__(self):
        self.chat = MockChatCompletions()


class MockChatCompletions:
    """Mock chat completions for development"""
    
    def __init__(self):
        self.completions = self
    
    async def create(self, model: str, messages: List[Dict], temperature: float = 0.7, **kwargs) -> 'MockResponse':
        """Create a mock response based on the message content"""
        
        # Simulate API delay
        await asyncio.sleep(0.5)
        
        user_message = ""
        for msg in messages:
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
        
        # Generate mock response based on the request type
        mock_content = self._generate_mock_response(user_message)
        
        return MockResponse(mock_content)
    
    def _generate_mock_response(self, user_message: str) -> str:
        """Generate appropriate mock response based on user message content"""
        
        message_lower = user_message.lower()
        
        # Game design responses
        if "design minigame" in message_lower or "game design" in message_lower:
            return json.dumps({
                "game_type": "Interactive Quiz",
                "description": "A character-driven quiz game where players answer questions about the scene",
                "mechanics": {
                    "primary": "Question-Answer",
                    "secondary": "Character Interaction",
                    "difficulty": "adaptive"
                },
                "ui_elements": [
                    "Question display",
                    "Multiple choice buttons",
                    "Character avatars",
                    "Progress indicator"
                ],
                "educational_value": {
                    "reading_comprehension": "High",
                    "critical_thinking": "Medium",
                    "retention": "High"
                }
            })
        
        # Progression system
        elif "progression system" in message_lower:
            return json.dumps({
                "progression_type": "Scene-based Linear",
                "unlock_mechanism": "Completion-based",
                "checkpoints": [
                    {"scene_id": 1, "required_score": 80},
                    {"scene_id": 2, "required_score": 75},
                    {"scene_id": 3, "required_score": 85}
                ],
                "rewards": {
                    "completion_badges": True,
                    "character_unlocks": True,
                    "bonus_content": True
                }
            })
        
        # AR experience design
        elif "ar experience" in message_lower or "augmented reality" in message_lower:
            return json.dumps({
                "ar_type": "Scene Overlay",
                "ar_elements": [
                    {
                        "type": "3D Character Models",
                        "description": "Interactive character representations",
                        "interaction": "Touch to hear dialogue"
                    },
                    {
                        "type": "Environmental Effects",
                        "description": "Weather and atmosphere simulation",
                        "interaction": "Automatic based on scene mood"
                    }
                ],
                "ar_requirements": {
                    "minimum_android_version": "7.0",
                    "arcore_required": True,
                    "lighting_conditions": "Indoor/Outdoor"
                }
            })
        
        # Unity script generation
        elif "unity script" in message_lower or "c# script" in message_lower:
            return '''using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Generated scene controller for interactive literary experience
/// </summary>
public class SceneController : MonoBehaviour
{
    [Header("Scene Configuration")]
    public string sceneName = "MockScene";
    public string sceneDescription = "A mock scene for development testing";
    
    [Header("Interactive Elements")]
    public GameObject[] characterPrefabs;
    public AudioSource ambientAudio;
    
    void Start()
    {
        InitializeScene();
        SetupInteractiveElements();
    }
    
    void InitializeScene()
    {
        Debug.Log($"Initializing scene: {sceneName}");
    }
    
    void SetupInteractiveElements()
    {
        // Setup interactive elements for the scene
    }
    
    public void OnSceneComplete()
    {
        // Handle scene completion
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
    }
}'''
        
        # Asset specifications
        elif "asset specification" in message_lower:
            return json.dumps({
                "3d_models": [
                    {
                        "name": "Character_Protagonist",
                        "type": "Humanoid",
                        "poly_count": "5000-8000",
                        "textures": ["Diffuse", "Normal", "Roughness"],
                        "animations": ["Idle", "Walk", "Talk", "Gesture"]
                    }
                ],
                "audio_assets": [
                    {
                        "name": "Ambient_Medieval",
                        "type": "Environmental",
                        "format": "WAV",
                        "duration": "2-3 minutes (looping)"
                    }
                ],
                "ui_elements": [
                    {
                        "name": "DialoguePanel",
                        "type": "UI Canvas",
                        "resolution": "1920x1080",
                        "style": "Medieval theme"
                    }
                ]
            })
        
        # Quality assurance
        elif "test" in message_lower or "quality" in message_lower:
            return json.dumps({
                "test_scenarios": [
                    {
                        "test_name": "Scene Navigation",
                        "description": "Verify smooth transition between scenes",
                        "expected_result": "Scene loads within 3 seconds",
                        "priority": "High"
                    },
                    {
                        "test_name": "Character Interaction",
                        "description": "Test character dialogue system",
                        "expected_result": "Dialogue appears correctly and is readable",
                        "priority": "High"
                    }
                ],
                "performance_benchmarks": {
                    "target_fps": "60",
                    "memory_usage": "< 2GB",
                    "loading_time": "< 5 seconds"
                }
            })
        
        # Default response
        else:
            return json.dumps({
                "response": "Mock response for development mode",
                "status": "success",
                "message": "This is a placeholder response generated for development purposes",
                "data": {
                    "generated_at": "2024-development",
                    "mode": "mock"
                }
            })


class MockResponse:
    """Mock response object that mimics OpenAI response structure"""
    
    def __init__(self, content: str):
        self.choices = [MockChoice(content)]


class MockChoice:
    """Mock choice object"""
    
    def __init__(self, content: str):
        self.message = MockMessage(content)


class MockMessage:
    """Mock message object"""
    
    def __init__(self, content: str):
        self.content = content
