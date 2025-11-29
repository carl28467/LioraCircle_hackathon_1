import requests
import json
import time

url = "http://localhost:8000/chat"
user_id = f"test_user_completion_{int(time.time())}"

def send_message(message, context_profile_data={}):
    payload = {
        "message": message,
        "user_id": user_id,
        "context": {
            "profile": {
                "full_name": "Test User",
                "onboarding_completed": False,
                "profile_data": context_profile_data,
                "role": "pioneer",
                "suggest_completion": context_profile_data.get("suggest_completion", False)
            }
        },
        "attachments": []
    }
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        print(f"Request failed: {e}")
        return None

print(f"--- Starting Test Session: {user_id} ---")

# 1. User introduces themselves
print("\nUser: Hi, I'm John, 30 years old.")
resp1 = send_message("Hi, I'm John, 30 years old.")
current_profile_data = resp1['metadata']['updates'].get('profile_data', {})

# 2. User asks to finish
print("\nUser: finish")
resp2 = send_message("finish", current_profile_data)
current_profile_data.update(resp2['metadata']['updates'].get('profile_data', {}))
if resp2['metadata']['updates'].get('suggest_completion'):
    current_profile_data['suggest_completion'] = True

# 3. User confirms with the new string
print("\nUser: Yes, everything is correct")
resp3 = send_message("Yes, everything is correct", current_profile_data)
print(f"Liora: {resp3['response']}")
print(f"Updates: {resp3['metadata']['updates']}")

if resp3['metadata']['updates'].get('onboarding_completed'):
    print("\nSUCCESS: Onboarding completed.")
    if resp3['metadata']['updates'].get('family_code'):
        print(f"SUCCESS: Family code generated: {resp3['metadata']['updates']['family_code']}")
    else:
        print("FAILURE: Family code NOT generated.")
else:
    print("\nFAILURE: Onboarding NOT completed.")
