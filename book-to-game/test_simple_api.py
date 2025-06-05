#!/usr/bin/env python3
"""
Simple API test for debugging
"""
import requests
import json

API_BASE_URL = "http://127.0.0.1:8002"

def test_simple_transformation():
    """Test with minimal data"""
    sample_scenes = [
        {
            "scene_number": 1,
            "title": "Simple Scene",
            "content": "A basic test scene",
            "characters": ["Character1"],
            "setting": "Test Setting",
            "key_events": ["Event1"],
            "educational_content": "Basic",
            "themes": ["Test"]
        }
    ]
    
    request_data = {
        "scenes": sample_scenes
    }
    
    try:
        print("📤 Sending minimal transformation request...")
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=request_data,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Got {len(result.get('unity_project_files', {}))} files")
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_simple_transformation()
