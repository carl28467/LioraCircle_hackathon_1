import requests
import json

url = "http://localhost:8000/chat"
payload = {
    "message": "Hi",
    "user_id": "test_user",
    "context": {
        "profile": {
            "full_name": "Test User",
            "onboarding_completed": False,
            "profile_data": {}
        }
    },
    "attachments": []
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
