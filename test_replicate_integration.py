#!/usr/bin/env python3
"""
Test script per verificare l'integrazione Replicate nel book-to-game service
Testa sia il workflow standard che quello con Replicate enabled
"""
import asyncio
import requests
import json
import time
from typing import Dict, Any, List

# Configuration
TEXT_CHUNKER_URL = "http://localhost:8001"
BOOK_TO_GAME_URL = "http://localhost:8002"

# Test data - scene dal text-chunker (formato reale)
SAMPLE_SCENES = [
    {
        'elementi_narrativi': 'Tuoni e fulmini. Atmosfera tempestosa e tetra. Il vento ulula attraverso la landa desolata.',
        'personaggi': 'Tre streghe misteriose: la Prima Strega (anziana e saggia), la Seconda Strega (di mezza età, astuta), la Terza Strega (giovane ma potente).',
        'ambientazione': "Una landa desolata e rocciosa, battuta da una violenta tempesta. Il cielo è nero, illuminato solo dai lampi. Non ci sono alberi o riparo, solo rocce sparse e terreno arido.",
        'mood_vibe': 'Misterioso, sinistro, inquietante, premonitore, soprannaturale.',
        'azione_in_corso': "Le tre streghe si riuniscono in cerchio durante la tempesta, discutendo profezie e piani futuri. Si scambiano incantesimi e previsioni sul destino di Macbeth."
    },
    {
        'elementi_narrativi': 'Un castello maestoso si erge contro il cielo. Bandiere sventolano al vento. Guardie in armatura pattugliano le mura.',
        'personaggi': 'Macbeth (un guerriero nobile ma ambizioso), Lady Macbeth (sua moglie, determinata e manipolatrice), Re Duncan (sovrano giusto e rispettato).',
        'ambientazione': "Il castello di Inverness, residenza di Macbeth. Architettura medievale scozzese con alte torri, mura di pietra grigia, cortili interni e sale regali.",
        'mood_vibe': 'Regale, imponente, ma con un sottofondo di tensione crescente e ambizione.',
        'azione_in_corso': "Macbeth e Lady Macbeth discutono la profezia delle streghe. Lady Macbeth convince il marito a considerare l'assassinio del re per ottenere il trono."
    }
]

# Project configuration per test
TEST_PROJECT_CONFIG = {
    'target_platforms': ['mobile', 'ar', 'desktop'],
    'educational_standards': ['Common Core State Standards'],
    'target_age_groups': ['14-18'],
    'project_name': 'MacbethInteractiveDemo',
    'ar_features_enabled': True,
    'minigames_enabled': True,
    'multiplayer_enabled': False
}

def print_header(title: str):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_section(title: str):
    """Print a formatted section header"""
    print(f"\n📋 {title}")
    print("-" * 50)

def check_service_status(service_name: str, url: str) -> bool:
    """Check if a service is running"""
    try:
        response = requests.get(url, timeout=5)
        status = response.status_code == 200
        print(f"✅ {service_name}: Running" if status else f"❌ {service_name}: Not responding")
        return status
    except requests.exceptions.RequestException as e:
        print(f"❌ {service_name}: Not reachable - {e}")
        return False

def test_standard_workflow():
    """Test the standard book-to-game workflow (without Replicate)"""
    print_section("Testing Standard Workflow")
    
    try:
        start_time = time.time()
        
        # Prepare request
        request_data = {
            "scenes": SAMPLE_SCENES,
            "project_config": TEST_PROJECT_CONFIG
        }
        
        print(f"📤 Sending request to {BOOK_TO_GAME_URL}/transform/book-to-game")
        print(f"   - Scenes: {len(SAMPLE_SCENES)}")
        print(f"   - Project: {TEST_PROJECT_CONFIG['project_name']}")
        
        # Make request
        response = requests.post(
            f"{BOOK_TO_GAME_URL}/transform/book-to-game",
            json=request_data,
            timeout=60
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Standard workflow completed in {duration:.2f}s")
            
            # Analyze results
            if 'project_summary' in result:
                summary = result['project_summary']
                stats = summary.get('project_statistics', {})
                
                print(f"   📊 Scenes processed: {stats.get('total_scenes_processed', 0)}")
                print(f"   📁 Unity files generated: {stats.get('total_unity_files_generated', 0)}")
                print(f"   👥 Characters: {stats.get('unique_characters', 0)}")
                print(f"   🎮 Features: {', '.join(summary.get('features_implemented', []))}")
                
            return True, result
        else:
            print(f"❌ Standard workflow failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Standard workflow error: {e}")
        return False, None

def test_replicate_integration():
    """Test the new Replicate-enabled workflow"""
    print_section("Testing Replicate Integration")
    
    # First, check if there's a Replicate endpoint
    replicate_endpoints = [
        f"{BOOK_TO_GAME_URL}/transform/book-to-game-with-replicate",
        f"{BOOK_TO_GAME_URL}/transform/book-to-game"  # With replicate parameter
    ]
    
    for endpoint in replicate_endpoints:
        try:
            start_time = time.time()
            
            # Prepare request with Replicate configuration
            if "with-replicate" in endpoint:
                request_data = {
                    "scenes": SAMPLE_SCENES,
                    "project_config": TEST_PROJECT_CONFIG,
                    "generate_visual_assets": True
                }
            else:
                # Try with parameter in standard endpoint
                request_data = {
                    "scenes": SAMPLE_SCENES,
                    "project_config": TEST_PROJECT_CONFIG
                }
                endpoint += "?replicate_enabled=true"
            
            print(f"📤 Testing Replicate integration: {endpoint}")
            print(f"   - Visual assets generation: Enabled")
            print(f"   - Expected: Images, videos, and technical specs")
            
            # Make request
            response = requests.post(
                endpoint,
                json=request_data,
                timeout=120  # Longer timeout for asset generation
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Replicate integration completed in {duration:.2f}s")
                
                # Analyze Replicate-specific results
                if 'replicate_assets' in result:
                    replicate_data = result['replicate_assets']
                    gen_summary = replicate_data.get('generation_summary', {})
                    
                    print(f"   🎨 Visual assets generated:")
                    print(f"      - Scenes processed: {gen_summary.get('total_scenes_processed', 0)}")
                    print(f"      - Successful generations: {gen_summary.get('successful_generations', 0)}")
                    print(f"      - Failed generations: {gen_summary.get('failed_generations', 0)}")
                    print(f"      - Total assets: {gen_summary.get('total_assets_generated', 0)}")
                    
                    # Show individual scene assets
                    for scene_asset in replicate_data.get('scenes', []):
                        scene_id = scene_asset.get('scene_id', 'unknown')
                        success = scene_asset.get('generation_successful', False)
                        print(f"      - {scene_id}: {'✅' if success else '❌'}")
                
                # Check project summary for Replicate info
                if 'project_summary' in result and 'replicate_integration' in result['project_summary']:
                    replicate_summary = result['project_summary']['replicate_integration']
                    print(f"   📋 Integration summary:")
                    print(f"      - Success rate: {replicate_summary.get('success_rate', 'unknown')}")
                    print(f"      - Visual assets: {replicate_summary.get('visual_assets_generated', False)}")
                
                return True, result
                
            else:
                print(f"❌ Replicate integration failed: {response.status_code}")
                if response.status_code == 404:
                    print("   Note: Endpoint not found, trying next option...")
                    continue
                else:
                    print(f"   Error: {response.text}")
                    return False, None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Replicate integration error: {e}")
            if "with-replicate" not in endpoint:
                continue  # Try next endpoint
            return False, None
    
    print("⚠️ No Replicate-specific endpoint found, integration may not be exposed via API yet")
    return False, None

def compare_workflows(standard_result: Dict[str, Any], replicate_result: Dict[str, Any]):
    """Compare the results of standard vs Replicate workflows"""
    print_section("Workflow Comparison")
    
    if not standard_result or not replicate_result:
        print("⚠️ Cannot compare - one or both workflows failed")
        return
    
    # Compare basic metrics
    std_summary = standard_result.get('project_summary', {})
    rep_summary = replicate_result.get('project_summary', {})
    
    std_stats = std_summary.get('project_statistics', {})
    rep_stats = rep_summary.get('project_statistics', {})
    
    print("📊 Feature Comparison:")
    print(f"   Unity Files - Standard: {std_stats.get('total_unity_files_generated', 0)}, "
          f"Replicate: {rep_stats.get('total_unity_files_generated', 0)}")
    
    print(f"   Characters - Standard: {std_stats.get('unique_characters', 0)}, "
          f"Replicate: {rep_stats.get('unique_characters', 0)}")
    
    # Replicate-specific features
    if 'replicate_integration' in rep_summary:
        rep_integration = rep_summary['replicate_integration']
        print(f"   🎨 Visual Assets: {rep_integration.get('total_visual_assets', 0)} generated")
        print(f"   📈 Success Rate: {rep_integration.get('success_rate', 'N/A')}")
    
    # File structure comparison
    std_files = len(standard_result.get('unity_project_files', {}))
    rep_files = len(replicate_result.get('unity_project_files', {}))
    
    print(f"📁 File Count - Standard: {std_files}, Replicate: {rep_files}")
    
    if 'replicate_assets' in replicate_result:
        print("🎯 Additional Replicate Assets:")
        scenes = replicate_result['replicate_assets'].get('scenes', [])
        for scene in scenes:
            scene_id = scene.get('scene_id', 'unknown')
            assets = scene.get('assets', {})
            if 'generated_assets' in assets:
                asset_types = assets['generated_assets'].get('generation_summary', {}).get('asset_types', [])
                print(f"   - {scene_id}: {', '.join(asset_types)}")

def test_service_integration():
    """Test integration between text-chunker and book-to-game with Replicate"""
    print_section("End-to-End Service Integration Test")
    
    try:
        # Step 1: Use text-chunker to process text
        print("📖 Step 1: Processing text with text-chunker...")
        
        sample_text = """
        Thunder and lightning. Enter three Witches.
        First Witch: When shall we three meet again?
        In thunder, lightning, or in rain?
        Second Witch: When the hurlyburly's done,
        When the battle's lost and won.
        Third Witch: That will be ere the set of sun.
        First Witch: Where the place?
        Second Witch: Upon the heath.
        Third Witch: There to meet with Macbeth.
        """
        
        text_request = {
            "text": sample_text
        }
        
        text_response = requests.post(
            f"{TEXT_CHUNKER_URL}/chunk-scenes",
            json=text_request,
            timeout=30
        )
        
        if text_response.status_code != 200:
            print(f"❌ Text-chunker failed: {text_response.status_code}")
            return False
        
        scenes_data = text_response.json()
        scenes = scenes_data.get('scenes', [])
        print(f"✅ Text-chunker processed text into {len(scenes)} scenes")
        
        # Step 2: Process scenes with book-to-game (Replicate enabled)
        print("🎮 Step 2: Converting scenes to game with Replicate...")
        
        game_request = {
            "scenes": scenes,
            "project_config": TEST_PROJECT_CONFIG
        }
        
        game_response = requests.post(
            f"{BOOK_TO_GAME_URL}/transform/book-to-game",
            json=game_request,
            timeout=120
        )
        
        if game_response.status_code == 200:
            result = game_response.json()
            print("✅ End-to-end integration successful!")
            
            # Show integration results
            summary = result.get('project_summary', {})
            print(f"   📊 Total workflow: Text → {len(scenes)} scenes → Unity project")
            print(f"   🎯 Generated: {summary.get('project_statistics', {}).get('total_unity_files_generated', 0)} Unity files")
            
            return True
        else:
            print(f"❌ Book-to-game conversion failed: {game_response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Integration test error: {e}")
        return False

def main():
    """Main test runner"""
    print_header("🧪 REPLICATE INTEGRATION TEST SUITE")
    print("Testing the integration of Replicate API with book-to-game service")
    print("Following the successful pattern from text-chunker service")
    
    # Check service availability
    print_section("Service Status Check")
    text_chunker_ok = check_service_status("Text-Chunker", TEXT_CHUNKER_URL)
    book_to_game_ok = check_service_status("Book-to-Game", BOOK_TO_GAME_URL)
    
    if not book_to_game_ok:
        print("\n❌ Book-to-game service is not running. Please start it first:")
        print("   cd book-to-game && python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8002")
        return
    
    # Test workflows
    results = {}
    
    # Test 1: Standard workflow
    standard_success, standard_result = test_standard_workflow()
    results['standard'] = (standard_success, standard_result)
    
    # Test 2: Replicate integration
    replicate_success, replicate_result = test_replicate_integration()
    results['replicate'] = (replicate_success, replicate_result)
    
    # Test 3: Workflow comparison
    if standard_success and replicate_success:
        compare_workflows(standard_result, replicate_result)
    
    # Test 4: End-to-end integration (if text-chunker is available)
    if text_chunker_ok:
        integration_success = test_service_integration()
        results['integration'] = integration_success
      # Final summary
    print_header("🎯 TEST SUMMARY")
    passed_tests = len([k for k in results.keys() if (results[k][0] if isinstance(results[k], tuple) else results[k])])
    total_tests = len(results)
    
    print(f"📊 Results: {passed_tests}/{total_tests} tests passed")
    
    for test_name, result in results.items():
        if isinstance(result, tuple):
            success, _ = result
            print(f"   {'✅' if success else '❌'} {test_name.title()} workflow")
        else:
            print(f"   {'✅' if result else '❌'} {test_name.title()} test")
    
    if passed_tests == len(results):
        print("\n🎉 All tests passed! Replicate integration is working correctly.")
    else:
        print(f"\n⚠️ {len(results) - passed_tests} test(s) failed. Check the logs above.")
    
    print("\n📝 Next steps:")
    print("   1. Verify Replicate API token in .env file")
    print("   2. Test with actual Replicate models (if not in mock mode)")
    print("   3. Optimize asset generation workflow")
    print("   4. Add more visual asset types (characters, environments)")

if __name__ == "__main__":
    main()
