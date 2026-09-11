import requests
import json
import sys

URL = "http://127.0.0.1:5000/recommend"

test_movies = [
    "Spider-Man",
    "Iron Man",
    "Avatar",
    "Toy Story",
    "The Conjuring",
    "Titanic"
]

print("Running batch recommendation test...\n")

for movie in test_movies:
    try:
        response = requests.post(URL, json={"movie": movie}, timeout=10)
        if response.status_code == 200:
            print(f"✅ Tested: {movie} (Check server terminal for exact score breakdown!)")
        else:
            print(f"❌ Failed: {movie} (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing {movie}: {e}")

print("\nDone. Please check the terminal where your Flask server is running to see the detailed scoring.")
