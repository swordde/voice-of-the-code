import requests
import json
import random
import string

def get_random_string(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

url = "http://127.0.0.1:8000/auth/register"
random_email = f"test_{get_random_string(5)}@example.com"
data = {
    "username": "testuser",
    "email": random_email,
    "password": "password123"
}

print(f"Attempting to register {random_email}...")

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
