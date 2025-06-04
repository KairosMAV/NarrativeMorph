#!/usr/bin/env python3
"""
Test the agent mock system directly
"""
import sys
import os
import asyncio

# Add the src directory to Python path  
sys.path.insert(0, os.path.dirname(__file__))

from src.agents.unity_code_agent import UnityCodeAgent

async def test_mock_agent():
    """Test agent in mock mode"""
    print("🧪 Testing Unity Code Agent in mock mode...")
    
    # Initialize with mock key
    agent = UnityCodeAgent("mock-api-key", "gpt-4")
    
    print(f"🔍 Mock mode: {agent.is_mock_mode}")
    print(f"🔍 Client type: {type(agent.client)}")
    
    # Test scene data
    scene_data = {
        "title": "Test Scene",
        "content": "A simple test scene for validation",
        "characters": ["Test Character"],
        "setting": "Test Environment"
    }
    
    try:
        print("📤 Generating scene controller...")
        result = await agent.generate_scene_controller(scene_data)
        print(f"✅ Generated script length: {len(result)}")
        print(f"🔍 Script preview: {result[:200]}...")
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_mock_agent())
