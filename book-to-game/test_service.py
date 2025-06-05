"""
Minimal test of the main API module to identify issues
"""
import asyncio
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_service_initialization():
    """Test if the service can be initialized properly"""
    try:
        from src.services.book_to_game_service import BookToGameService
        from src.api.constants import DEFAULT_MODEL
        
        print("✅ Imports successful")
        
        # Test service initialization
        service = BookToGameService("test-api-key", DEFAULT_MODEL)
        print("✅ Service initialization successful")
        
        # Test a simple transformation
        test_scenes = [{
            'elementi_narrativi': 'Test scene',
            'personaggi': 'Test characters',
            'ambientazione': "Test setting",
            'mood_vibe': 'Test mood',
            'azione_in_corso': "Test action"
        }]
        
        result = await service.transform_book_to_game(test_scenes)
        print("✅ Service transformation successful")
        print(f"📊 Result type: {type(result)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_service_initialization())
    if success:
        print("🎯 Service test passed - issue might be with FastAPI route registration")
    else:
        print("🚫 Service test failed - this is the root cause")
