import os
import json
import joblib
from datetime import datetime
from utils import compute_combined_hash
from preprocessing import PreprocessingPipeline

CACHE_DIR = "cache"
METADATA_FILE = os.path.join(CACHE_DIR, "metadata.json")
MOVIES_FILE = os.path.join(CACHE_DIR, "movies_processed.joblib")
FEATURE_MATRIX_FILE = os.path.join(CACHE_DIR, "feature_matrix.joblib")
EMBEDDINGS_MATRIX_FILE = os.path.join(CACHE_DIR, "embeddings_matrix.joblib")
MOVIE_INDEX_FILE = os.path.join(CACHE_DIR, "movie_index.joblib")
PIPELINE_FILE = os.path.join(CACHE_DIR, "pipeline.joblib")

CSV_FILES = ["tmdb_5000_movies.csv", "tmdb_5000_credits.csv"]
CACHE_VERSION = "2.0" # Incremented for semantic embeddings support

class CacheManager:
    @staticmethod
    def is_cache_valid():
        if not os.path.exists(CACHE_DIR):
            return False

        required_files = [METADATA_FILE, MOVIES_FILE, FEATURE_MATRIX_FILE, EMBEDDINGS_MATRIX_FILE, MOVIE_INDEX_FILE, PIPELINE_FILE]
        if any(not os.path.exists(f) for f in required_files):
            return False

        try:
            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)
            
            if metadata.get("cache_version") != CACHE_VERSION:
                return False

            current_hash = compute_combined_hash(CSV_FILES)
            if metadata.get("csv_hash") != current_hash:
                return False
            
            return True
        except Exception as e:
            print(f"Error validating cache: {e}")
            return False

    @staticmethod
    def generate_cache():
        print("Cache invalid or missing. Generating new cache...")
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)

        if not all(os.path.exists(f) for f in CSV_FILES):
            raise FileNotFoundError(f"Missing required CSV files: {CSV_FILES}")

        pipeline = PreprocessingPipeline()
        movies_df, feature_matrix, embeddings_matrix, movie_index = pipeline.process_dataset(CSV_FILES[0], CSV_FILES[1])

        print("Saving artifacts to cache...")
        joblib.dump(movies_df, MOVIES_FILE, compress=3)
        joblib.dump(feature_matrix, FEATURE_MATRIX_FILE, compress=3)
        joblib.dump(embeddings_matrix, EMBEDDINGS_MATRIX_FILE, compress=3)
        joblib.dump(movie_index, MOVIE_INDEX_FILE, compress=3)
        
        # We don't want to pickle the large sentence transformer model
        pipeline.encoder = None 
        joblib.dump(pipeline, PIPELINE_FILE, compress=3)

        current_hash = compute_combined_hash(CSV_FILES)
        metadata = {
            "csv_hash": current_hash,
            "cache_version": CACHE_VERSION,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        with open(METADATA_FILE, "w") as f:
            json.dump(metadata, f, indent=4)

        print("Cache generated successfully.")

    @staticmethod
    def load_cache():
        print("Loading cached artifacts into memory...")
        movies_df = joblib.load(MOVIES_FILE)
        feature_matrix = joblib.load(FEATURE_MATRIX_FILE)
        embeddings_matrix = joblib.load(EMBEDDINGS_MATRIX_FILE)
        movie_index = joblib.load(MOVIE_INDEX_FILE)
        pipeline = joblib.load(PIPELINE_FILE)
        print("Cache loaded successfully.")
        return movies_df, feature_matrix, embeddings_matrix, movie_index, pipeline

    @staticmethod
    def ensure_cache():
        if not CacheManager.is_cache_valid():
            CacheManager.generate_cache()
        else:
            print("Valid cache found. Skipping generation.")
        
        return CacheManager.load_cache()
