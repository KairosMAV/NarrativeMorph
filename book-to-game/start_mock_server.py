#!/usr/bin/env python3
"""
Start the Book-to-Game API server in mock mode for testing
"""
import os
import sys
import subprocess
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_mock_environment():
    """Setup environment for mock testing"""
    print("🔧 Setting up mock environment...")
    
    # Ensure we're using mock API key
    os.environ["OPENAI_API_KEY"] = "mock-api-key"
    os.environ["OPENAI_MODEL"] = "gpt-4"
    os.environ["MOCK_MODE"] = "true"
    
    print("✅ Mock environment configured")
    print(f"   - API Key: {os.environ['OPENAI_API_KEY']}")
    print(f"   - Model: {os.environ['OPENAI_MODEL']}")
    print(f"   - Mock Mode: {os.environ['MOCK_MODE']}")

def start_api_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting Book-to-Game API server...")
    print("📍 Server will be available at: http://127.0.0.1:8002")
    print("📖 API docs will be available at: http://127.0.0.1:8002/docs")
    print("\n💡 This server runs in MOCK mode - no real API calls will be made!")
    print("🔄 Press Ctrl+C to stop the server")
    
    try:
        # Start the server using uvicorn
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "src.api.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8002",
            "--reload",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🎮 BOOK-TO-GAME API SERVER (MOCK MODE)")
    print("="*50)
    
    # Setup mock environment
    setup_mock_environment()
    
    # Check if we're in the right directory
    if not os.path.exists("src/api/main.py"):
        print("❌ Error: src/api/main.py not found!")
        print("💡 Make sure you're running this from the book-to-game directory")
        sys.exit(1)
    
    # Start the server
    start_api_server()

if __name__ == "__main__":
    main()
