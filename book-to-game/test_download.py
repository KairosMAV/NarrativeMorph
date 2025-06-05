#!/usr/bin/env python3
"""
Test the download endpoint
"""
import requests
import zipfile
import io

API_BASE_URL = "http://127.0.0.1:8003"

def test_download_endpoint():
    """Test the ZIP download functionality"""
    print("📦 Testing download endpoint...")
    
    sample_scene = [{
        "scene_number": 1,
        "title": "Download Test",
        "content": "Testing the download functionality",
        "characters": ["Test Character"],
        "setting": "Test Environment",
        "key_events": ["Download test"],
        "educational_content": "File management",
        "themes": ["Testing"]
    }]
    
    request_data = {
        "scenes": sample_scene,
        "project_config": {
            "project_name": "DownloadTest",
            "target_platforms": ["desktop"]
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/transform/book-to-game/download",
            json=request_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Download successful!")
            print(f"   Content-Type: {response.headers.get('content-type')}")
            print(f"   Content-Length: {len(response.content)} bytes")
            
            # Verify it's a valid ZIP file
            try:
                zip_file = zipfile.ZipFile(io.BytesIO(response.content))
                file_list = zip_file.namelist()
                print(f"   📁 ZIP contains {len(file_list)} files")
                print("   📄 Sample files:")
                for file_name in file_list[:5]:  # Show first 5 files
                    print(f"      {file_name}")
                if len(file_list) > 5:
                    print(f"      ... and {len(file_list) - 5} more")
                zip_file.close()
                return True
            except Exception as e:
                print(f"   ❌ Invalid ZIP file: {e}")
                return False
        else:
            print(f"❌ Download failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Download error: {e}")
        return False

if __name__ == "__main__":
    if test_download_endpoint():
        print("\n🎉 Download endpoint working perfectly!")
    else:
        print("\n⚠️ Download endpoint has issues.")
