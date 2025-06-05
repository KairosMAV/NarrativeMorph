#!/usr/bin/env python3
"""
Comprehensive test script for both text-chunker and book-to-game services
"""
import requests
import json
import time
import asyncio
from typing import Dict, Any, List

# Service URLs
TEXT_CHUNKER_URL = "http://127.0.0.1:8001"
BOOK_TO_GAME_URL = "http://127.0.0.1:8002"

# Test story
TEST_STORY = """
Once upon a time, in a magical forest, there lived a young fairy named Luna. She had shimmering wings that sparkled like stars in the moonlight. Every night, Luna would fly through the trees, sprinkling magic dust to help the forest creatures dream.

One evening, Luna discovered that the Dream Tree, the source of all peaceful dreams in the forest, was beginning to wither. Without it, all the creatures would have nightmares forever. Luna knew she had to find the legendary Crystal of Sweet Dreams to save the tree.

Her journey took her through dangerous paths filled with thorny vines and shadow creatures. But Luna was brave and determined. With the help of a wise old owl named Orion, she learned that the crystal was hidden in the Cave of Echoes, guarded by a sleeping dragon.

Luna approached the dragon carefully and discovered it wasn't evil - it was just lonely. She sang a beautiful lullaby that filled the dragon's heart with joy. Grateful for the friendship, the dragon gave Luna the Crystal of Sweet Dreams.

Luna returned to the Dream Tree and placed the crystal at its roots. The tree immediately burst with new life, its leaves glowing with magical light. From that night on, all creatures in the forest had the most wonderful dreams, and Luna became known as the Guardian of Dreams.
"""

class ServiceTester:
    def __init__(self):
        self.results = {
            'text_chunker': {},
            'book_to_game': {},
            'integration': {}
        }
    
    def test_service_health(self, service_name: str, url: str) -> bool:
        """Test if a service is healthy"""
        try:
            response = requests.get(f"{url}/", timeout=10)
            if response.status_code == 200:
                print(f"✅ {service_name} is healthy")
                return True
            else:
                print(f"❌ {service_name} health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ {service_name} is not accessible: {e}")
            return False
    
    def test_text_chunker(self) -> Dict[str, Any]:
        """Test text-chunker service"""
        print("\n🧪 Testing Text-Chunker Service")
        print("=" * 50)
        
        # Test health
        if not self.test_service_health("Text-Chunker", TEXT_CHUNKER_URL):
            return {'status': 'failed', 'error': 'Service not accessible'}
        
        # Test scene splitting
        try:
            payload = {
                "text": TEST_STORY
            }
            
            print("📤 Sending text for scene splitting...")
            start_time = time.time()
            
            response = requests.post(
                f"{TEXT_CHUNKER_URL}/split-scenes",
                json=payload,
                timeout=60
            )
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                scenes = result.get('scenes', [])
                
                print(f"✅ Text splitting successful!")
                print(f"   📊 Generated {len(scenes)} scenes")
                print(f"   ⏱️ Processing time: {processing_time:.2f} seconds")
                
                # Display scenes info
                for i, scene in enumerate(scenes[:3], 1):  # Show first 3 scenes
                    print(f"   📝 Scene {i}: {scene.get('title', 'No title')}")
                    content_preview = scene.get('content', '')[:100] + '...' if len(scene.get('content', '')) > 100 else scene.get('content', '')
                    print(f"      Content: {content_preview}")
                
                return {
                    'status': 'success',
                    'scenes': scenes,
                    'scene_count': len(scenes),
                    'processing_time': processing_time
                }
            else:
                print(f"❌ Text splitting failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return {'status': 'failed', 'error': f"HTTP {response.status_code}: {response.text}"}
                
        except Exception as e:
            print(f"❌ Text-Chunker test failed: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    def test_book_to_game(self, scenes_data: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Test book-to-game service"""
        print("\n🎮 Testing Book-to-Game Service")
        print("=" * 50)
        
        # Test health
        if not self.test_service_health("Book-to-Game", BOOK_TO_GAME_URL):
            return {'status': 'failed', 'error': 'Service not accessible'}
        
        # Test health endpoint details
        try:
            health_response = requests.get(f"{BOOK_TO_GAME_URL}/health")
            if health_response.status_code == 200:
                health_data = health_response.json()
                print(f"   📋 Service: {health_data.get('service')}")
                print(f"   🤖 Available agents: {len(health_data.get('agents_available', []))}")
        except Exception as e:
            print(f"   ⚠️ Could not get detailed health info: {e}")
        
        # Use provided scenes or create test scenes
        if scenes_data:
            test_scenes = scenes_data
            print(f"📤 Using {len(test_scenes)} scenes from text-chunker")
        else:
            # Create simple test scenes for standalone testing
            test_scenes = [
                {
                    "scene_number": 1,
                    "title": "The Magical Forest",
                    "content": "Luna discovers her magical powers in the enchanted forest.",
                    "characters": ["Luna", "Forest Creatures"],
                    "setting": "Magical Forest",
                    "key_events": ["Discovery of powers", "Meeting forest creatures"],
                    "educational_content": "Friendship and courage",
                    "themes": ["Magic", "Adventure", "Friendship"]
                }
            ]
            print(f"📤 Using {len(test_scenes)} test scenes")
        
        # Test transformation
        try:
            payload = {
                "scenes": test_scenes,
                "project_config": {
                    "target_platforms": ["mobile", "ar"],
                    "educational_standards": ["Common Core"],
                    "target_age_groups": ["6-12"],
                    "project_name": "LunaAdventure",
                    "ar_features_enabled": True,
                    "minigames_enabled": True
                }
            }
            
            print("🔄 Sending scenes for game transformation...")
            start_time = time.time()
            
            response = requests.post(
                f"{BOOK_TO_GAME_URL}/transform/book-to-game",
                json=payload,
                timeout=120
            )
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ Game transformation successful!")
                print(f"   ⏱️ Processing time: {processing_time:.2f} seconds")
                print(f"   🎮 Project: {result.get('project_name', 'Unknown')}")
                
                # Count generated files
                unity_files = result.get('unity_project_files', {})
                print(f"   📁 Generated {len(unity_files)} Unity files")
                
                # Show file types
                file_types = {}
                for filename in unity_files.keys():
                    ext = filename.split('.')[-1] if '.' in filename else 'no_ext'
                    file_types[ext] = file_types.get(ext, 0) + 1
                
                print(f"   📊 File types: {dict(file_types)}")
                
                # Show some generated files
                print("   📝 Sample generated files:")
                for filename in list(unity_files.keys())[:5]:
                    print(f"      - {filename}")
                
                return {
                    'status': 'success',
                    'project_name': result.get('project_name'),
                    'unity_files_count': len(unity_files),
                    'file_types': file_types,
                    'processing_time': processing_time
                }
            else:
                print(f"❌ Game transformation failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return {'status': 'failed', 'error': f"HTTP {response.status_code}: {response.text}"}
                
        except Exception as e:
            print(f"❌ Book-to-Game test failed: {e}")
            return {'status': 'failed', 'error': str(e)}
    
    def test_integration_workflow(self) -> Dict[str, Any]:
        """Test the complete integration workflow"""
        print("\n🔗 Testing Complete Integration Workflow")
        print("=" * 50)
        
        # Step 1: Text-Chunker
        print("Step 1: Processing story with text-chunker...")
        chunker_result = self.test_text_chunker()
        
        if chunker_result['status'] != 'success':
            print("❌ Integration test failed at text-chunker step")
            return {'status': 'failed', 'error': 'Text-chunker failed', 'step': 'text_chunker'}
        
        # Step 2: Book-to-Game with chunker output
        print("\nStep 2: Converting scenes to Unity game...")
        scenes = chunker_result.get('scenes', [])
        
        # Convert scenes to the format expected by book-to-game
        formatted_scenes = []
        for i, scene in enumerate(scenes):
            formatted_scene = {
                "scene_number": i + 1,
                "title": scene.get('title', f'Scene {i + 1}'),
                "content": scene.get('content', ''),
                "characters": scene.get('characters', []),
                "setting": scene.get('setting', 'Unknown'),
                "key_events": scene.get('key_events', []),
                "educational_content": scene.get('educational_content', 'General'),
                "themes": scene.get('themes', ['Adventure'])
            }
            formatted_scenes.append(formatted_scene)
        
        game_result = self.test_book_to_game(formatted_scenes)
        
        if game_result['status'] != 'success':
            print("❌ Integration test failed at book-to-game step")
            return {'status': 'failed', 'error': 'Book-to-game failed', 'step': 'book_to_game'}
        
        # Integration success
        total_time = chunker_result.get('processing_time', 0) + game_result.get('processing_time', 0)
        
        print(f"\n🎉 Integration workflow completed successfully!")
        print(f"   📚 Original story → {chunker_result.get('scene_count', 0)} scenes → Unity game project")
        print(f"   ⏱️ Total processing time: {total_time:.2f} seconds")
        print(f"   🎮 Generated {game_result.get('unity_files_count', 0)} Unity files")
        
        return {
            'status': 'success',
            'total_processing_time': total_time,
            'scenes_generated': chunker_result.get('scene_count', 0),
            'unity_files_generated': game_result.get('unity_files_count', 0),
            'chunker_result': chunker_result,
            'game_result': game_result
        }
    
    def run_all_tests(self):
        """Run all tests and generate a comprehensive report"""
        print("🚀 COMPREHENSIVE SERVICE TESTING")
        print("=" * 60)
        print(f"Testing both text-chunker and book-to-game services")
        print(f"Test story length: {len(TEST_STORY)} characters")
        print()
        
        # Test individual services
        self.results['text_chunker'] = self.test_text_chunker()
        self.results['book_to_game'] = self.test_book_to_game()
        
        # Test integration
        self.results['integration'] = self.test_integration_workflow()
        
        # Generate final report
        self.generate_report()
    
    def generate_report(self):
        """Generate a final test report"""
        print("\n📊 FINAL TEST REPORT")
        print("=" * 60)
        
        # Count successes
        successes = 0
        total_tests = 3
        
        for test_name, result in self.results.items():
            status = result.get('status', 'unknown')
            if status == 'success':
                print(f"✅ {test_name.replace('_', '-').title()}: PASSED")
                successes += 1
            else:
                print(f"❌ {test_name.replace('_', '-').title()}: FAILED - {result.get('error', 'Unknown error')}")
        
        print(f"\n📈 Overall Success Rate: {successes}/{total_tests} ({successes/total_tests*100:.1f}%)")
        
        if successes == total_tests:
            print("\n🎉 ALL TESTS PASSED!")
            print("🚀 Both services are working correctly and integration is successful!")
            print("\n💡 Ready for production use:")
            print("   • Text-Chunker: Converting stories to scenes")
            print("   • Book-to-Game: Converting scenes to Unity games")
            print("   • Integration: Complete story-to-game pipeline")
        else:
            print(f"\n⚠️ {total_tests - successes} test(s) failed.")
            print("Check the errors above and ensure both services are running correctly.")
        
        # Show performance metrics if available
        integration_result = self.results.get('integration', {})
        if integration_result.get('status') == 'success':
            print(f"\n⚡ Performance Metrics:")
            print(f"   • Total processing time: {integration_result.get('total_processing_time', 0):.2f}s")
            print(f"   • Scenes generated: {integration_result.get('scenes_generated', 0)}")
            print(f"   • Unity files generated: {integration_result.get('unity_files_generated', 0)}")

def main():
    """Main function"""
    print("Starting comprehensive testing of NarrativeMorph services...")
    print("Make sure both services are running:")
    print("   • Text-Chunker: http://127.0.0.1:8001")
    print("   • Book-to-Game: http://127.0.0.1:8002")
    print()
    
    tester = ServiceTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
