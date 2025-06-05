#!/usr/bin/env python3
"""
Test completo del sistema book-to-game con API mock
Questo script testa tutto il flusso senza utilizzare API reali
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
        "content": "Emma discovers an ancient library hidden behind a bookshelf in her grandmother's house. The books seem to whisper secrets of forgotten magical realms.",
        "characters": ["Emma", "Grandmother", "Ancient Librarian"],
        "setting": "Hidden magical library with floating books and glowing shelves",
        "key_events": ["Discovery of secret passage", "First encounter with magic", "Meeting the Librarian"],
        "educational_content": "History of ancient civilizations and their knowledge preservation methods",
        "themes": ["Discovery", "Knowledge", "Magic", "Family legacy"],
        "mood": "mysterious and wonder-filled",
        "interactive_elements": ["Book selection puzzle", "Magical door unlocking", "Character dialogue choices"]
    },
    {
        "scene_number": 2,
        "title": "The Enchanted Forest",
        "content": "Guided by a talking owl, Emma enters an enchanted forest where trees can move and animals speak in riddles about environmental conservation.",
        "characters": ["Emma", "Wise Owl", "Tree Guardian", "Forest Animals"],
        "setting": "Living forest with moving trees, speaking animals, and magical clearings",
        "key_events": ["Meeting the Owl guide", "Learning from Tree Guardian", "Solving animal riddles"],
        "educational_content": "Environmental science and ecosystem preservation",
        "themes": ["Nature", "Conservation", "Wisdom", "Communication"],
        "mood": "mystical and educational",
        "interactive_elements": ["Animal riddle mini-games", "Tree planting simulation", "Environmental choices"]
    },
    {
        "scene_number": 3,
        "title": "The Crystal Caverns",
        "content": "Deep underground, Emma discovers crystal caverns that hold the memories of the Earth. Each crystal shows geological history and teaches about mineral formation.",
        "characters": ["Emma", "Crystal Guardian", "Earth Spirits"],
        "setting": "Magnificent crystal caves with glowing formations and underground rivers",
        "key_events": ["Crystal memory viewing", "Learning geological processes", "Earning the Earth Guardian's trust"],
        "educational_content": "Geology, mineral formation, and Earth's history",
        "themes": ["Earth science", "Time", "Memory", "Respect for nature"],
        "mood": "awe-inspiring and educational",
        "interactive_elements": ["Crystal matching puzzles", "Geological timeline game", "Mining simulation"]
    }
]

SAMPLE_PROJECT_CONFIG = {
    "target_platforms": ["Unity3D", "AR", "Mobile"],
    "educational_standards": ["Common Core", "NGSS", "CSTA"],
    "target_age_groups": ["8-12"],
    "project_name": "EmmasAdventure",
    "ar_features_enabled": True,
    "minigames_enabled": True,
    "multiplayer_enabled": False
}

class MockSystemTester:
    """Tester completo per il sistema mock"""
    
    def __init__(self):
        self.api_base_url = "http://127.0.0.1:8002"
        self.test_results = {}
        
    async def test_service_direct(self):
        """Test diretto del servizio senza API"""
        print("\n" + "="*60)
        print("🧪 TESTING DIRECT SERVICE (MOCK MODE)")
        print("="*60)
        
        try:
            # Initialize service with mock key
            service = BookToGameService("mock-api-key", "gpt-4")
            
            print(f"✅ Service initialized")
            print(f"🔍 Mock mode: {service.coordinator.unity_agent.is_mock_mode}")
            
            # Test transformation
            print("\n📤 Testing transformation...")
            result = await service.transform_scenes_to_game(
                scenes=SAMPLE_SCENES,
                project_config=SAMPLE_PROJECT_CONFIG
            )
            
            print(f"✅ Transformation completed!")
            print(f"📊 Generated files: {len(result.get('unity_project_files', {}))}")
            print(f"📊 Game scenes: {len(result.get('game_scenes', []))}")
            print(f"📊 AR features: {len(result.get('ar_features', []))}")
            
            # Verify content
            unity_files = result.get('unity_project_files', {})
            if unity_files:
                print(f"📁 Sample files generated:")
                for filename in list(unity_files.keys())[:3]:
                    print(f"   - {filename} ({len(unity_files[filename])} characters)")
            
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
    
    def test_api_transformation(self):
        """Test API transformation endpoint"""
        print("\n" + "="*60)
        print("🧪 TESTING API TRANSFORMATION")
        print("="*60)
        
        request_data = {
            "scenes": SAMPLE_SCENES,
            "project_config": SAMPLE_PROJECT_CONFIG
        }
        
        try:
            print("📤 Sending transformation request...")
            start_time = time.time()
            
            response = requests.post(
                f"{self.api_base_url}/transform/book-to-game",
                json=request_data,
                timeout=60
            )
            
            end_time = time.time()
            print(f"⏱️ Request completed in {end_time - start_time:.2f} seconds")
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Transformation successful!")
                print(f"📊 Generated Unity files: {len(result.get('unity_project_files', {}))}")
                print(f"📊 Game scenes: {len(result.get('game_scenes', []))}")
                print(f"📊 Educational content: {len(result.get('educational_content', []))}")
                
                # Show sample generated content
                unity_files = result.get('unity_project_files', {})
                if unity_files:
                    print(f"\n📁 Sample generated files:")
                    for filename in list(unity_files.keys())[:3]:
                        content_length = len(unity_files[filename])
                        print(f"   - {filename}: {content_length} characters")
                        if 'SceneController' in filename:
                            preview = unity_files[filename][:200] + "..."
                            print(f"     Preview: {preview}")
                
                self.test_results['api_transformation'] = True
                return result
            else:
                print(f"❌ API request failed: {response.text}")
                self.test_results['api_transformation'] = False
                return None
                
        except Exception as e:
                        print(f"❌ API transformation test failed: {e}")
            self.test_results['api_transformation'] = False
            return None
    
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
            design_result = await coordinator.game_design_agent.analyze_scene(SAMPLE_SCENES[0])
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
    
    def test_mock_performance(self):
        """Test mock system performance"""
        print("\n" + "="*60)
        print("🧪 TESTING MOCK PERFORMANCE")
        print("="*60)
        
        # Test multiple concurrent requests
        import concurrent.futures
        import threading
        
        def single_request():
            try:
                response = requests.post(
                    f"{self.api_base_url}/transform/book-to-game",
                    json={
                        "scenes": [SAMPLE_SCENES[0]],  # Single scene for speed
                        "project_config": SAMPLE_PROJECT_CONFIG
                    },
                    timeout=30
                )
                return response.status_code == 200
            except:
                return False
        
        print("📤 Testing 5 concurrent requests...")
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(single_request) for _ in range(5)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        end_time = time.time()
        success_rate = sum(results) / len(results) * 100
        
        print(f"⏱️ Completed 5 requests in {end_time - start_time:.2f} seconds")
        print(f"📊 Success rate: {success_rate}%")
        
        self.test_results['performance'] = success_rate >= 80
        return success_rate >= 80
    
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
        print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")
        
        print("\nDetailed Results:")
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED! The mock system is working perfectly!")
            print("🚀 Ready for hackathon development and demos!")
        else:
            print(f"\n⚠️ {total_tests - passed_tests} test(s) failed. Check the logs above.")

async def main():
    """Run all tests"""
    print("🚀 STARTING COMPLETE MOCK SYSTEM TESTING")
    print("📝 This will test the entire book-to-game pipeline with mock APIs")
    
    tester = MockSystemTester()
    
    # Test 1: Direct service
    await tester.test_service_direct()
    
    # Test 2: API health (if API is running)
    if tester.test_api_health():
        # Test 3: API transformation
        tester.test_api_transformation()
        
        # Test 4: Performance
        tester.test_mock_performance()
    else:
        print("\n⚠️ API not running. Skipping API tests.")
        print("💡 To test the API, run: python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8002")
      # Test 5: Individual agents
    await tester.test_individual_agents()
    
    # Print summary
    tester.print_summary()

if __name__ == "__main__":
    asyncio.run(main())
