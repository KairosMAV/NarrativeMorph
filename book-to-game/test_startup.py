"""
Test startup event manually
"""
import sys
import os
import asyncio

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_startup():
    """Test the startup event manually"""
    try:
        print("🧪 Testing startup event manually...")
        
        # Import the startup function
        from src.api.main import startup_event, service
        
        print(f"📊 Service before startup: {service}")
        
        # Run the startup event
        await startup_event()
        
        # Import service again to check if it was set
        from src.api.main import service as service_after
        print(f"📊 Service after startup: {service_after}")
        
        if service_after:
            print("✅ Startup event completed successfully!")
            return True
        else:
            print("❌ Service was not initialized")
            return False
            
    except Exception as e:
        print(f"❌ Error in startup event: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_startup())
    if result:
        print("🎯 Startup event test passed")
    else:
        print("🚫 Startup event test failed")
