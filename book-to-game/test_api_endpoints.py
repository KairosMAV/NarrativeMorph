#!/usr/bin/env python3
"""
Test script for the Book to Game API endpoints
"""
import requests
import json
import sys
import time

API_BASE_URL = "http://127.0.0.1:8002"

def test_basic_endpoints():
    """Test basic API endpoints"""
    print("🧪 Testing basic endpoints...")
    
    # Test root endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"✅ Root endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False
    
    # Test health endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"✅ Health endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
        return False
    
    # Test config templates
    try:
        response = requests.get(f"{API_BASE_URL}/config/templates")
        templates = response.json()
        print(f"✅ Config templates: {response.status_code}")
        print(f"   Available templates: {list(templates.keys())}")
    except Exception as e:
        print(f"❌ Config templates failed: {e}")
        return False
    
    return True

def test_transformation_endpoint():
    """Test the main transformation endpoint"""
    print("\n🧪 Testing transformation endpoint...")
    
    # Sample scene data (mimicking text-chunker output)
    sample_scenes = [
        {
            "scene_number": 1,
            "title": "The Enchanted Forest",
            "content": "Alice finds herself in a magical forest where the trees whisper ancient secrets. She must solve a riddle to proceed deeper into the woods.",
            "characters": ["Alice", "Talking Oak Tree"],
            "setting": "Enchanted Forest",
            "key_events": ["Alice enters forest", "Tree poses riddle", "Alice solves riddle"],
            "educational_content": "Critical thinking and problem solving",
            "themes": ["Adventure", "Mystery", "Nature"]
        },
        {
            "scene_number": 2,
            "title": "The Crystal Cave",
            "content": "Alice discovers a cave filled with glowing crystals. Each crystal contains a mathematical equation that must be solved to unlock the cave's treasure.",
            "characters": ["Alice", "Crystal Guardian"],
            "setting": "Crystal Cave",
            "key_events": ["Alice enters cave", "Discovers crystal puzzles", "Solves equations", "Finds treasure"],
            "educational_content": "Basic algebra and geometry",
            "themes": ["Education", "Discovery", "Mathematics"]
        }
    ]
    
    # Test with default configuration
    request_data = {
        "scenes": sample_scenes
    }
    
    try:
        print("📤 Sending transformation request...")
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=request_data,
            timeout=60  # Give it time for the mock responses
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Transformation successful!")
            print(f"   Project name: {result.get('project_name', 'Unknown')}")
            print(f"   Unity files: {len(result.get('unity_project_files', {}))}")
            print(f"   Generated scenes: {len(result.get('generated_scenes', []))}")
            
            # Show some file types generated
            if 'unity_project_files' in result:
                file_types = set()
                for file_path in result['unity_project_files'].keys():
                    ext = file_path.split('.')[-1] if '.' in file_path else 'no_ext'
                    file_types.add(ext)
                print(f"   File types generated: {sorted(file_types)}")
            
            return True
        else:
            print(f"❌ Transformation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - this might be normal for mock responses")
        return False
    except Exception as e:
        print(f"❌ Transformation failed: {e}")
        return False

def test_transformation_with_config():
    """Test transformation with custom configuration"""
    print("\n🧪 Testing transformation with custom config...")
    
    sample_scenes = [
        {
            "scene_number": 1,
            "title": "AR Adventure Begins",
            "content": "An AR adventure where students explore historical landmarks through their mobile devices.",
            "characters": ["Student Explorer", "Historical Guide"],
            "setting": "Ancient Rome",
            "key_events": ["AR activation", "Historical exploration", "Quiz completion"],
            "educational_content": "Ancient history and AR technology",
            "themes": ["History", "Technology", "Education"]
        }
    ]
    
    # Custom configuration for AR experience
    project_config = {
        "target_platforms": ["mobile", "ar"],
        "educational_standards": ["Common Core"],
        "target_age_groups": ["13-18"],
        "project_name": "ARHistoryAdventure",
        "ar_features_enabled": True,
        "minigames_enabled": True,
        "multiplayer_enabled": False
    }
    
    request_data = {
        "scenes": sample_scenes,
        "project_config": project_config
    }
    
    try:
        print("📤 Sending AR transformation request...")
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=request_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ AR Transformation successful!")
            print(f"   Project name: {result.get('project_name', 'Unknown')}")
            print(f"   Target platforms: {result.get('project_summary', {}).get('target_platforms', [])}")
            print(f"   AR features: {result.get('project_summary', {}).get('ar_features_enabled', False)}")
            return True
        else:
            print(f"❌ AR Transformation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ AR Transformation failed: {e}")
        return False

def main():
    """Run all API tests"""
    print("🚀 Starting Book to Game API Tests")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    time.sleep(2)
    
    success_count = 0
    total_tests = 3
    
    # Test basic endpoints
    if test_basic_endpoints():
        success_count += 1
    
    # Test transformation
    if test_transformation_endpoint():
        success_count += 1
    
    # Test transformation with config
    if test_transformation_with_config():
        success_count += 1
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! API is working correctly.")
        return True
    else:
        print("⚠️ Some tests failed. Check the logs above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
