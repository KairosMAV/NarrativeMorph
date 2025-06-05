"""
Simple API test to verify the book-to-game API is working correctly
"""
import asyncio
import aiohttp
import json

async def test_api():
    """Test the book-to-game API endpoints"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Book-to-Game API")
    print("=" * 40)
    
    async with aiohttp.ClientSession() as session:
        
        # Test 1: Health check
        print("📊 Test 1: Health check...")
        try:
            async with session.get(f"{base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ Health check passed: {data['message']}")
                else:
                    print(f"   ❌ Health check failed: {response.status}")
        except Exception as e:
            print(f"   ❌ Health check error: {e}")
            return
        
        # Test 2: Book to game transformation
        print("\n🔄 Test 2: Book to game transformation...")
        
        test_scenes = [
            {
                'elementi_narrativi': 'Tuoni e fulmini. Atmosfera tempestosa e tetra.',
                'personaggi': 'Tre streghe: la Prima, la Seconda e la Terza Strega.',
                'ambientazione': "Un luogo desolato e aperto, probabilmente una landa.",
                'mood_vibe': 'Misterioso, sinistro, inquietante, premonitore.',
                'azione_in_corso': "Le tre streghe si riuniscono in un clima di tempesta."
            }
        ]
        
        test_request = {
            "scenes": test_scenes,
            "project_config": {
                "target_platforms": ["mobile", "ar"],
                "educational_standards": ["Common Core"],
                "target_age_groups": ["14-18"],
                "project_name": "TestProject",
                "ar_features_enabled": True,
                "minigames_enabled": True,
                "multiplayer_enabled": False
            }
        }
        
        try:
            async with session.post(
                f"{base_url}/transform/book-to-game",
                json=test_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ Transformation successful!")
                    print(f"   📊 Project: {data['project_summary']['project_name']}")
                    print(f"   📁 Files generated: {data['project_summary']['project_statistics']['total_unity_files_generated']}")
                    print(f"   🎮 Features: {len(data['project_summary']['features_implemented'])} implemented")
                else:
                    error_text = await response.text()
                    print(f"   ❌ Transformation failed: {response.status}")
                    print(f"   📝 Error: {error_text}")
        except Exception as e:
            print(f"   ❌ Transformation error: {e}")
        
        # Test 3: Test with invalid data
        print("\n🚫 Test 3: Error handling...")
        
        invalid_request = {
            "scenes": [],  # Empty scenes should trigger validation
            "project_config": None
        }
        
        try:
            async with session.post(
                f"{base_url}/transform/book-to-game",
                json=invalid_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status >= 400:
                    print(f"   ✅ Error handling works: {response.status}")
                else:
                    print(f"   ⚠️ Expected error but got: {response.status}")
        except Exception as e:
            print(f"   ✅ Error handling works: {e}")
    
    print("\n🎯 API tests completed!")

if __name__ == "__main__":
    asyncio.run(test_api())
