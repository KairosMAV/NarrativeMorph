#!/usr/bin/env python3
"""
Test just the service initialization and one scene generation
"""
import sys
import os
import asyncio
import json

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(__file__))

from src.services.book_to_game_service import BookToGameService

async def test_service_mock():
    """Test the service in mock mode"""
    print("🧪 Testing BookToGameService in mock mode...")
    
    # Initialize with mock key (same as used in API)
    service = BookToGameService("mock-api-key", "gpt-4")
    
    print(f"🔍 Service initialized")
    print(f"🔍 Unity agent mock mode: {service.coordinator.unity_agent.is_mock_mode}")
    print(f"🔍 Design agent mock mode: {service.coordinator.design_agent.is_mock_mode}")
    
    # Test scene data
    sample_scenes = [
        {
            "scene_number": 1,
            "title": "Test Scene",
            "content": "A simple test scene for validation",
            "characters": ["Test Character"],
            "setting": "Test Environment",
            "key_events": ["Event 1"],
            "educational_content": "Testing",
            "themes": ["Test"]
        }
    ]
    
    try:
        print("📤 Testing transformation...")
        result = await service.transform_book_to_game(sample_scenes)
        print(f"✅ Transformation successful!")
        print(f"   Project name: {result.get('project_name', 'Unknown')}")
        print(f"   Unity files count: {len(result.get('unity_project_files', {}))}")
        return True
    except Exception as e:
        print(f"❌ Transformation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_service_mock())
