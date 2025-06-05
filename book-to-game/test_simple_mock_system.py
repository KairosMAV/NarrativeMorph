#!/usr/bin/env python3
"""
Test completo del sistema book-to-game con API mock (corretto)
"""
import sys
import os
import asyncio
import json
import requests
import time
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the src directory to Python path  
sys.path.insert(0, os.path.dirname(__file__))

from src.services.book_to_game_service import BookToGameService
from src.agents.agent_coordinator import AgentCoordinator

# Test data samples
SAMPLE_SCENES = [
    {
        "scene_number": 1,
        "title": "The Mysterious Library",
        "content": "Emma discovers an ancient library hidden behind a bookshelf in her grandmother's house.",
        "characters": ["Emma", "Grandmother", "Ancient Librarian"],
        "setting": "Hidden magical library with floating books and glowing shelves",
        "key_events": ["Discovery of secret passage", "First encounter with magic"],
        "educational_content": "History of ancient civilizations",
        "themes": ["Discovery", "Knowledge", "Magic"],
        "mood": "mysterious and wonder-filled"
    }
]

SAMPLE_PROJECT_CONFIG = {
    "target_platforms": ["Unity3D", "AR", "Mobile"],
    "educational_standards": ["Common Core", "NGSS"],
    "target_age_groups": ["8-12"],
    "project_name": "EmmasAdventure",
    "ar_features_enabled": True,
    "minigames_enabled": True,
    "multiplayer_enabled": False
}

class MockSystemTester:
    """Tester semplificato per il sistema mock"""
    
    def __init__(self):
        self.api_base_url = "http://127.0.0.1:8002"
        self.test_results = {}
        
    async def test_service_direct(self):
        """Test diretto del servizio senza API"""
        print("\n" + "="*60)
        print("🧪 TESTING DIRECT SERVICE (MOCK MODE)")
        print("="*60)
        
        try:
            service = BookToGameService("mock-api-key", "gpt-4")
            print(f"✅ Service initialized")
            print(f"🔍 Mock mode: {service.coordinator.unity_agent.is_mock_mode}")
            
            print("\n📤 Testing transformation...")
            result = await service.transform_scenes_to_game(
                scenes=SAMPLE_SCENES,
                project_config=SAMPLE_PROJECT_CONFIG
            )
            
            print(f"✅ Transformation completed!")
            print(f"📊 Generated files: {len(result.get('unity_project_files', {}))}")
            print(f"📊 Game scenes: {len(result.get('game_scenes', []))}")
            
            self.test_results['direct_service'] = True
            return result
            
        except Exception as e:
            print(f"❌ Direct service test failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results['direct_service'] = False
            return None
    
    def test_api_health(self):
        """Test API health check"""
        print("\n" + "="*60)
        print("🧪 TESTING API HEALTH CHECK")
        print("="*60)
        
        try:
            response = requests.get(f"{self.api_base_url}/", timeout=10)
            print(f"✅ API Health Check: {response.status_code}")
            print(f"📝 Response: {response.json()}")
            self.test_results['api_health'] = response.status_code == 200
            return response.status_code == 200
        except Exception as e:
            print(f"❌ API Health Check failed: {e}")
            self.test_results['api_health'] = False
            return False
    
    async def test_individual_agents(self):
        """Test individual agents in mock mode"""
        print("\n" + "="*60)
        print("🧪 TESTING INDIVIDUAL AGENTS")
        print("="*60)
        
        try:
            coordinator = AgentCoordinator("mock-api-key", "gpt-4")
            
            # Test Unity agent
            print("🎮 Testing Unity Code Agent...")
            unity_result = await coordinator.unity_agent.generate_scene_controller(SAMPLE_SCENES[0])
            print(f"   ✅ Generated {len(unity_result)} characters of Unity code")
              # Test Game Design agent
            print("🎨 Testing Game Design Agent...")
            design_result = await coordinator.design_agent.analyze_scene(SAMPLE_SCENES[0])
            print(f"   ✅ Generated game design: {len(str(design_result))} characters")
            
            # Test Asset Generation agent
            print("🖼️ Testing Asset Generation Agent...")
            asset_result = await coordinator.asset_agent.generate_scene_assets(SAMPLE_SCENES[0])
            print(f"   ✅ Generated asset specs: {len(str(asset_result))} characters")
            
            # Test Quality Assurance agent
            print("🔍 Testing Quality Assurance Agent...")
            qa_result = await coordinator.qa_agent.review_scene_implementation({
                'scene_data': SAMPLE_SCENES[0],
                'unity_code': unity_result,
                'game_design': design_result,
                'assets': asset_result
            })
            print(f"   ✅ QA Review score: {qa_result.get('overall_score', 'N/A')}")
            
            self.test_results['individual_agents'] = True
            return True
            
        except Exception as e:
            print(f"❌ Individual agents test failed: {e}")
            import traceback
            traceback.print_exc()
            self.test_results['individual_agents'] = False
            return False
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        
        if total_tests > 0:
            print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")
        
        print("\nDetailed Results:")
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if passed_tests == total_tests and total_tests > 0:
            print("\n🎉 ALL TESTS PASSED! The mock system is working perfectly!")
            print("🚀 Ready for hackathon development and demos!")
        else:
            print(f"\n⚠️ Some tests failed or no tests ran. Check the logs above.")

async def main():
    """Run all tests"""
    print("🚀 STARTING COMPLETE MOCK SYSTEM TESTING")
    print("📝 This will test the entire book-to-game pipeline with mock APIs")
    
    tester = MockSystemTester()
    
    # Test 1: Direct service
    await tester.test_service_direct()
    
    # Test 2: API health (if API is running)
    if tester.test_api_health():
        print("✅ API is running!")
    else:
        print("\n⚠️ API not running. Skipping API tests.")
        print("💡 To test the API, run: python start_mock_server.py")
    
    # Test 3: Individual agents
    await tester.test_individual_agents()
    
    # Print summary
    tester.print_summary()

if __name__ == "__main__":
    asyncio.run(main())
