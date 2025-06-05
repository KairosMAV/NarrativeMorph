#!/usr/bin/env python3
"""
Simple server startup script that handles Python path correctly
"""
import sys
import os

# Add current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Now import and run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    from src.api.main import app
    
    print("🚀 Starting Book-to-Game API server...")
    print(f"📁 Current directory: {current_dir}")
    print(f"🐍 Python path: {sys.path[0]}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8002,
        log_level="info"
    )
