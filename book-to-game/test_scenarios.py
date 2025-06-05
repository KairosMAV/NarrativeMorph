#!/usr/bin/env python3
"""
Quick test scenarios for the book-to-game mock system
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
                "content": "Little Red Riding Hood walks through an enchanted forest where animals can talk and trees have faces.",
                "characters": ["Little Red Riding Hood", "Talking Rabbit", "Wise Oak Tree"],
                "setting": "Magical forest with talking animals and ancient trees",
                "key_events": ["Meeting the talking rabbit", "Learning forest wisdom", "Finding the hidden path"],
                "educational_content": "Forest ecology and animal behavior",
                "themes": ["Nature", "Friendship", "Wisdom", "Adventure"],
                "mood": "whimsical and educational",
                "interactive_elements": ["Animal conversation choices", "Path selection puzzle", "Tree riddles"]
            },
            {
                "scene_number": 2,
                "title": "Grandmother's Cottage",
                "content": "The cottage is filled with magical cooking tools that teach about nutrition and healthy eating.",
                "characters": ["Little Red Riding Hood", "Grandmother", "Magic Kitchen Tools"],
                "setting": "Cozy cottage with enchanted kitchen",
                "key_events": ["Learning about nutrition", "Cooking together", "Sharing meal wisdom"],
                "educational_content": "Nutrition science and healthy cooking",
                "themes": ["Health", "Family", "Cooking", "Science"],
                "mood": "warm and educational",
                "interactive_elements": ["Recipe mixing game", "Nutrition quiz", "Ingredient matching"]
            }
        ]
    },
    
    "space_adventure": {
        "name": "Space Science Adventure",
        "scenes": [
            {
                "scene_number": 1,
                "title": "Launch to Mars",
                "content": "Captain Luna and her crew prepare for a mission to Mars, learning about rocket science and space physics.",
                "characters": ["Captain Luna", "Engineer Bot", "Mission Control"],
                "setting": "High-tech space station with view of Earth",
                "key_events": ["Pre-flight calculations", "Rocket launch sequence", "Space physics demonstration"],
                "educational_content": "Physics, astronomy, and space technology",
                "themes": ["Science", "Exploration", "Technology", "Teamwork"],
                "mood": "exciting and educational",
                "interactive_elements": ["Launch sequence simulation", "Physics puzzles", "Mission planning"]
            }
        ]
    },
    
    "historical": {
        "name": "Ancient Egypt Explorer",
        "scenes": [
            {
                "scene_number": 1,
                "title": "Inside the Pyramid",
                "content": "Young archaeologist discovers hieroglyphs that come to life and teach about ancient Egyptian civilization.",
                "characters": ["Young Archaeologist", "Animated Hieroglyphs", "Ancient Scribe"],
                "setting": "Inside a mysterious pyramid with glowing hieroglyphs",
                "key_events": ["Deciphering hieroglyphs", "Learning about pyramids", "Meeting ancient spirits"],
                "educational_content": "Ancient history, archaeology, and Egyptian culture",
                "themes": ["History", "Discovery", "Culture", "Mystery"],
                "mood": "mysterious and educational",
                "interactive_elements": ["Hieroglyph translation game", "Pyramid building simulation", "Historical timeline"]
            }
        ]
    }
}

def test_api_scenario(scenario_name: str, scenario_data: dict):
    """Test a specific scenario via API"""
    print(f"\n📖 Testing: {scenario_data['name']}")
    print("-" * 40)
    
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
            print(f"✅ Success in {end_time - start_time:.2f}s")
            print(f"📊 Generated {len(result.get('unity_project_files', {}))} Unity files")
            print(f"📊 Created {len(result.get('game_scenes', []))} game scenes")
            
            # Show sample files
            unity_files = result.get('unity_project_files', {})
            if unity_files:
                print("📁 Sample generated files:")
                for filename in list(unity_files.keys())[:2]:
                    print(f"   - {filename}")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

async def test_service_scenario(scenario_name: str, scenario_data: dict):
    """Test a specific scenario via direct service"""
    print(f"\n🔧 Direct Service Test: {scenario_data['name']}")
    print("-" * 40)
    
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
        
        print(f"✅ Success in {end_time - start_time:.2f}s")
        print(f"📊 Generated {len(result.get('unity_project_files', {}))} Unity files")
        print(f"📊 Created {len(result.get('game_scenes', []))} game scenes")
        
        return True
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_api_health():
    """Check if API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    """Main function"""
    print("🎮 BOOK-TO-GAME SCENARIO TESTER")
    print("="*50)
    
    # Check what tests to run
    test_mode = input("Choose test mode:\n1. API tests (requires running server)\n2. Direct service tests\n3. Both\nEnter choice (1/2/3): ").strip()
    
    if test_mode not in ["1", "2", "3"]:
        test_mode = "2"
        print("Invalid choice, defaulting to direct service tests")
    
    # Choose scenario
    print("\nAvailable scenarios:")
    for i, (key, scenario) in enumerate(SCENARIOS.items(), 1):
        print(f"{i}. {scenario['name']} ({key})")
    
    scenario_choice = input("Enter scenario number (or 'all' for all scenarios): ").strip()
    
    if scenario_choice.lower() == "all":
        scenarios_to_test = list(SCENARIOS.items())
    else:
        try:
            idx = int(scenario_choice) - 1
            if 0 <= idx < len(SCENARIOS):
                scenarios_to_test = [list(SCENARIOS.items())[idx]]
            else:
                print("Invalid scenario number, testing all scenarios")
                scenarios_to_test = list(SCENARIOS.items())
        except ValueError:
            print("Invalid input, testing all scenarios")
            scenarios_to_test = list(SCENARIOS.items())
    
    # Run tests
    results = {"api": [], "service": []}
    
    for scenario_name, scenario_data in scenarios_to_test:
        if test_mode in ["1", "3"]:
            # Test API
            if check_api_health():
                success = test_api_scenario(scenario_name, scenario_data)
                results["api"].append((scenario_name, success))
            else:
                print(f"\n❌ API not available for {scenario_name}")
                print("💡 Start the API with: python start_mock_server.py")
                results["api"].append((scenario_name, False))
        
        if test_mode in ["2", "3"]:
            # Test direct service
            success = asyncio.run(test_service_scenario(scenario_name, scenario_data))
            results["service"].append((scenario_name, success))
    
    # Print summary
    print("\n" + "="*50)
    print("📊 TEST RESULTS SUMMARY")
    print("="*50)
    
    if results["api"]:
        print("\nAPI Tests:")
        for scenario, success in results["api"]:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {scenario}: {status}")
    
    if results["service"]:
        print("\nDirect Service Tests:")
        for scenario, success in results["service"]:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {scenario}: {status}")
    
    # Overall success rate
    all_results = []
    if results["api"]:
        all_results.extend([r[1] for r in results["api"]])
    if results["service"]:
        all_results.extend([r[1] for r in results["service"]])
    
    if all_results:
        success_rate = sum(all_results) / len(all_results) * 100
        print(f"\nOverall Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("🎉 All tests passed! The mock system is working perfectly!")
        elif success_rate >= 80:
            print("✅ Good! Most tests passed. Minor issues detected.")
        else:
            print("⚠️ Several tests failed. Check the logs above.")

if __name__ == "__main__":
    main()
