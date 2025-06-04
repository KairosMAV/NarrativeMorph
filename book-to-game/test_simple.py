import requests
import json

# Test the transformation endpoint
url = "http://localhost:8000/transform/book-to-game"
test_data = {
    "scenes": [
        {
            'elementi_narrativi': 'Test scene',
            'personaggi': 'Test characters',
            'ambientazione': "Test setting",
            'mood_vibe': 'Test mood',
            'azione_in_corso': "Test action"
        }
    ]
}

try:
    response = requests.post(url, json=test_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
