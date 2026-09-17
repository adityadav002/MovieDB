import hashlib

def compute_file_hash(filepath, chunk_size=8192):
    """
    Computes the SHA-256 hash of a file efficiently by reading it in chunks.
    """
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(chunk_size), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def compute_combined_hash(filepaths):
    """
    Computes a single combined SHA-256 hash for multiple files.
    """
    combined_hash = hashlib.sha256()
    for filepath in filepaths:
        combined_hash.update(compute_file_hash(filepath).encode('utf-8'))
    return combined_hash.hexdigest()

import os
import requests
from dotenv import load_dotenv

load_dotenv()
TMDB_API_KEY = os.environ.get("TMDB_API_KEY") or os.environ.get("VITE_API_KEY") or os.environ.get("API_KEY") or "8b4dfcdc32cc08aef3d163eb1b30bd1c"
TMDB_API_KEY = TMDB_API_KEY.strip('"').strip("'")

# Standard browser User-Agent to prevent API blocking/connection resets
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json"
}

import time

def fetch_tmdb_movie_details(movie_id, retries=3):
    if not TMDB_API_KEY:
        print("Missing TMDB_API_KEY")
        return None
        
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=credits,keywords"
    
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=5)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                time.sleep(1) # Rate limit hit
            else:
                return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching from TMDB: {e}")
            if attempt < retries - 1:
                time.sleep(1)
                
    return None

def fetch_tmdb_search(movie_title):
    if not TMDB_API_KEY:
        print("Missing TMDB_API_KEY")
        return None
    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_title}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("results"):
                return data["results"][0]  # Return top match
        else:
            print(f"TMDB API Error in search: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error searching TMDB: {e}")
    return None
