"""
Debug script to check FastAPI routes and startup issues
"""
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def check_app_routes():
    """Check what routes are registered in the FastAPI app"""
    try:
        from src.api.main import app
        
        print("🔍 Checking FastAPI app routes...")
        print(f"App type: {type(app)}")
        
        # List all routes
        print("\n📋 Registered routes:")
        for route in app.routes:
            if hasattr(route, 'path') and hasattr(route, 'methods'):
                print(f"  {route.methods} {route.path}")
        
        # Check if startup events are registered
        print(f"\n🚀 Startup events: {len(app.router.on_startup)}")
        print(f"📤 Shutdown events: {len(app.router.on_shutdown)}")
        
        # Check if the service is accessible
        from src.api.main import service
        print(f"\n🔧 Global service: {service}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking app: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = check_app_routes()
    if not success:
        print("🚫 Failed to check app routes - there may be import issues")
