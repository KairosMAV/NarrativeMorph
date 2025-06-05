import requests
import json

# Test different endpoints to see which ones work
base_url = "http://localhost:8000"

endpoints_to_test = [
    "/",
    "/docs",
    "/openapi.json",
    "/transform/book-to-game"
]

for endpoint in endpoints_to_test:
    try:
        if endpoint == "/transform/book-to-game":
            # POST request
            test_data = {"scenes": [{"test": "data"}]}
            response = requests.post(f"{base_url}{endpoint}", json=test_data)
        else:
            # GET request
            response = requests.get(f"{base_url}{endpoint}")
        
        print(f"{endpoint}: {response.status_code}")
        if response.status_code == 404:
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"{endpoint}: Error - {e}")
