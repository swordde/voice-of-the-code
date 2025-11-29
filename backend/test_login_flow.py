import requests
import random
import string

def get_random_string(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

base_url = "http://127.0.0.1:8000/auth"
email = f"test_login_{get_random_string(5)}@example.com"
password = "password123"

print(f"1. Registering user: {email}")
reg_data = {
    "username": "testuser",
    "email": email,
    "password": password
}

try:
    reg_response = requests.post(f"{base_url}/register", json=reg_data)
    print(f"Register Status: {reg_response.status_code}")
    if reg_response.status_code != 200:
        print(f"Register Failed: {reg_response.text}")
        exit(1)
    
    print("2. Logging in...")
    login_data = {
        "email": email,
        "password": password
    }
    login_response = requests.post(f"{base_url}/login", json=login_data)
    print(f"Login Status: {login_response.status_code}")
    if login_response.status_code == 200:
        print("Login Successful!")
        print(f"Token: {login_response.json().get('access_token')[:20]}...")
    else:
        print(f"Login Failed: {login_response.text}")

except Exception as e:
    print(f"Error: {e}")
