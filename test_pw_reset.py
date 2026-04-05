import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_password_reset():
    # 1. Request Reset
    print("Testing Password Reset Request...")
    res = requests.post(f"{BASE_URL}/auth/password-reset/", json={"email": "tester2@example.com"})
    print("Request Status:", res.status_code)
    print("Request Response:", res.json())
    assert res.status_code == 200

    print("\n✅ Password reset request successful. A token should be logged or sent.")

if __name__ == "__main__":
    test_password_reset()
