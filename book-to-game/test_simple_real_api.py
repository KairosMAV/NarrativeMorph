#!/usr/bin/env python3
"""
Simple test for real API functionality
"""
import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_simple_transformation():
    """Test with a very simple scene to verify real API functionality"""
    
    # Minimal test scene
    test_data = {
        "scenes": [
            {
                "scene_number": 1,
                "title": "Simple Test",
                "content": "A character walks in a garden.",
                "characters": ["Hero"],
                "setting": "Garden",
                "key_events": ["Walking"],
                "educational_content": "Character analysis",
                "themes": ["Nature"],
                "mood_vibe": "Peaceful",
                "elementi_narrativi": "Trees, flowers"
            }
        ],
        "project_config": {
            "target_platforms": ["mobile"],
            "educational_standards": ["Common Core Literature"],
            "target_age_groups": ["14-18"],
            "project_name": "SimpleTest",
            "ar_features_enabled": False,
            "minigames_enabled": False,
            "multiplayer_enabled": False
        }
    }
    
    print("🧪 Testing simple transformation with real APIs...")
    print(f"📤 Sending request to: {API_BASE_URL}/transform/book-to-game")
    
    try:
        start_time = time.time()
        
        # Use a longer timeout for real APIs
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=test_data,
            timeout=180,  # 3 minutes
            headers={'Content-Type': 'application/json'}
        )
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        print(f"⏱️ Request completed in {processing_time:.1f} seconds")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS! Real API transformation completed")
            
            # Check what we got back
            if 'unity_project_files' in result:
                files = result['unity_project_files']
                print(f"📁 Generated {len(files)} Unity files")
                
                # Check for actual AI-generated content
                cs_files = [f for f in files.keys() if f.endswith('.cs')]
                if cs_files:
                    sample_file = cs_files[0]
                    content = files[sample_file]
                    print(f"📝 Sample C# file: {sample_file}")
                    print(f"📏 Content length: {len(content)} characters")
                    
                    # Verify it's not mock content
                    if "Mock response" in content or "// This is a mock" in content:
                        print("⚠️  WARNING: Still receiving mock responses!")
                        return False
                    else:
                        print("✅ Content appears to be real AI-generated code")
                        
                        # Show a snippet of the generated code
                        print("\n📋 Sample of generated code:")
                        print("-" * 40)
                        print(content[:300] + "..." if len(content) > 300 else content)
                        print("-" * 40)
                        
            return True
            
        else:
            print(f"❌ FAILED with status {response.status_code}")
            print(f"Error response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - real APIs may need more time")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        print("💡 This might indicate the server crashed or API quota exceeded")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    print("🚀 SIMPLE REAL API TEST")
    print("=" * 40)
    
    # Health check first
    try:
        health_response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        if health_response.status_code == 200:
            print("✅ Server is healthy")
        else:
            print("❌ Server health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot reach server: {e}")
        return
    
    # Run the test
    success = test_simple_transformation()
    
    if success:
        print("\n🎉 REAL API TEST SUCCESSFUL!")
        print("The Book-to-Game system is working with real AI APIs!")
    else:
        print("\n❌ Real API test failed")
        print("Check server logs and API configuration")

if __name__ == "__main__":
    main()
