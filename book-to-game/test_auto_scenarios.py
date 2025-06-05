#!/usr/bin/env python3
"""
Test automatico di tutti gli scenari book-to-game
"""
import requests
import json
import time
import asyncio
import sys
import os

# Add the src directory to Python path  
sys.path.insert(0, os.path.dirname(__file__))

from src.services.book_to_game_service import BookToGameService

API_BASE_URL = "http://127.0.0.1:8002"

# Test scenarios
SCENARIOS = {
    "minimal": {
        "name": "Minimal Scene Test",
        "scenes": [
            {
                "scene_number": 1,
                "title": "Test Scene",
                "content": "A simple test scene",
                "characters": ["Character1"],
                "setting": "Test Setting",
                "key_events": ["Event1"],
                "educational_content": "Basic",
                "themes": ["Test"]
            }
        ]
    },
    
    "fairy_tale": {
        "name": "Classic Fairy Tale",
        "scenes": [
            {
                "scene_number": 1,
                "title": "The Magic Forest",
                "content": "Little Red Riding Hood walks through an enchanted forest where animals can talk.",
                "characters": ["Little Red Riding Hood", "Talking Rabbit", "Wise Oak Tree"],
                "setting": "Magical forest with talking animals and ancient trees",
                "key_events": ["Meeting the talking rabbit", "Learning forest wisdom"],
                "educational_content": "Forest ecology and animal behavior",
                "themes": ["Nature", "Friendship", "Wisdom", "Adventure"]
            }
        ]
    }
}

def test_api_scenario(scenario_name: str, scenario_data: dict):
    """Test a specific scenario via API"""
    print(f"📖 Testing API: {scenario_data['name']}")
    
    request_data = {
        "scenes": scenario_data["scenes"],
        "project_config": {
            "project_name": f"{scenario_name.title()}Game",
            "target_platforms": ["Unity3D", "AR"],
            "ar_features_enabled": True,
            "minigames_enabled": True
        }
    }
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game",
            json=request_data,
            timeout=60
        )
        
        end_time = time.time()
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ API Success in {end_time - start_time:.2f}s")
            print(f"   📊 Generated {len(result.get('unity_project_files', {}))} Unity files")
            return True
        else:
            print(f"   ❌ API Failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ API Exception: {e}")
        return False

async def test_service_scenario(scenario_name: str, scenario_data: dict):
    """Test a specific scenario via direct service"""
    print(f"🔧 Testing Service: {scenario_data['name']}")
    
    try:
        service = BookToGameService("mock-api-key", "gpt-4")
        
        start_time = time.time()
        
        result = await service.transform_scenes_to_game(
            scenes=scenario_data["scenes"],
            project_config={
                "project_name": f"{scenario_name.title()}Game",
                "target_platforms": ["Unity3D", "AR"],
                "ar_features_enabled": True,
                "minigames_enabled": True
            }
        )
        
        end_time = time.time()
        
        print(f"   ✅ Service Success in {end_time - start_time:.2f}s")
        print(f"   📊 Generated {len(result.get('unity_project_files', {}))} Unity files")
        return True
        
    except Exception as e:
        print(f"   ❌ Service Exception: {e}")
        return False

def check_api_health():
    """Check if API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        return response.status_code == 200
    except:
        return False

async def main():
    """Main function"""
    print("🎮 AUTOMATED BOOK-TO-GAME TESTING")
    print("="*50)
    
    # Test results tracking
    api_results = []
    service_results = []
    
    # Check API availability
    api_available = check_api_health()
    if api_available:
        print("✅ API Server is running")
    else:
        print("⚠️ API Server not available")
    
    print("\n🧪 Testing all scenarios...")
    
    for scenario_name, scenario_data in SCENARIOS.items():
        print(f"\n--- {scenario_data['name']} ---")
        
        # Test API if available
        if api_available:
            api_success = test_api_scenario(scenario_name, scenario_data)
            api_results.append((scenario_name, api_success))
        
        # Test direct service
        service_success = await test_service_scenario(scenario_name, scenario_data)
        service_results.append((scenario_name, service_success))
    
    # Print summary
    print("\n" + "="*50)
    print("📊 FINAL RESULTS")
    print("="*50)
    
    if api_results:
        print("\nAPI Tests:")
        api_passed = sum(1 for _, success in api_results if success)
        for scenario, success in api_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {scenario}: {status}")
        print(f"API Success Rate: {api_passed}/{len(api_results)} ({api_passed/len(api_results)*100:.1f}%)")
    
    if service_results:
        print("\nDirect Service Tests:")
        service_passed = sum(1 for _, success in service_results if success)
        for scenario, success in service_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {scenario}: {status}")
        print(f"Service Success Rate: {service_passed}/{len(service_results)} ({service_passed/len(service_results)*100:.1f}%)")
    
    # Overall assessment
    total_tests = len(api_results) + len(service_results)
    total_passed = sum(1 for _, success in api_results + service_results if success)
    
    if total_tests > 0:
        overall_rate = total_passed / total_tests * 100
        print(f"\nOverall Success Rate: {total_passed}/{total_tests} ({overall_rate:.1f}%)")
        
        if overall_rate == 100:
            print("🎉 PERFECT! All tests passed!")
            print("🚀 The mock system is ready for hackathon!")
        elif overall_rate >= 80:
            print("✅ Excellent! System is working well!")
        else:
            print("⚠️ Some issues detected. Check logs above.")
    
    print("\n💡 Next steps:")
    print("1. If all tests passed: Ready for demo!")
    print("2. To test web interface: Open http://127.0.0.1:8002/docs")
    print("3. To stop server: Press Ctrl+C in server terminal")

if __name__ == "__main__":
    asyncio.run(main())
