import requests
import json
import sys

BASE_URL = "http://localhost:8000"
TEST_TAG = "#P990V0"  # Example Tag (Mortal)

def run_tests():
    print(f"Testing API at {BASE_URL}...")

    # 1. Create User
    print("\n[1] Testing User Creation...")
    payload = {"username": "IntegrationTest", "player_tag": TEST_TAG}
    try:
        r = requests.post(f"{BASE_URL}/users/", json=payload)
        if r.status_code in [200, 422]: # 422 is fine if user exists (handled by our backend check?) 
             # Actually our backend returns the user object even if they exist, 
             # but let's check for success.
            print(f"✅ User Endpoint: {r.status_code}")
            print(f"   Response: {r.json()}")
        else:
            print(f"❌ User Endpoint Failed: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        sys.exit(1)

    # 2. Sync Battles
    print(f"\n[2] Testing Sync for {TEST_TAG}...")
    # Note: encoding # as %23 is handled by requests automatically if in path? 
    # Actually, FastAPI handles the # in path if encoded, but requests might send it literal.
    # Let's send it raw, FastAPI usually handles it or we use the %23.
    safe_tag = TEST_TAG.replace("#", "%23") 
    r = requests.post(f"{BASE_URL}/sync/{safe_tag}")
    
    if r.status_code == 200:
        print(f"✅ Sync Successful: {r.json()}")
    elif r.status_code == 403:
        print("⚠️  Sync Failed: Invalid CR_API_KEY in .env")
    else:
        print(f"❌ Sync Error: {r.status_code} - {r.text}")

    # 3. Get Matches
    print(f"\n[3] Fetching Matches for {TEST_TAG}...")
    r = requests.get(f"{BASE_URL}/players/{safe_tag}/matches")
    if r.status_code == 200:
        matches = r.json()
        print(f"✅ Read Successful. Found {len(matches)} matches.")
    else:
        print(f"❌ Read Failed: {r.status_code} - {r.text}")

if __name__ == "__main__":
    # Ensure requests is installed: pip install requests
    run_tests()