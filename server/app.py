import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from cache_manager import CacheManager
from recommendation_engine import RecommendationEngine

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "https://moviedb-sf9j.onrender.com"
            ]
        }
    },
    supports_credentials=True
)   

# Initialize Recommendation Engine
engine = None

try:
    print("Initializing application...")
    print("Loading cache...")
    # This will generate cache if it doesn't exist or is invalid
    movies_df, feature_matrix, movie_index, pipeline = CacheManager.ensure_cache()
    
    engine = RecommendationEngine(movies_df, feature_matrix, movie_index, pipeline)
    print("Recommendation engine initialized successfully.")
except Exception as e:
    print(f"Failed to initialize recommendation engine: {e}")
    traceback.print_exc()

@app.route("/recommend", methods=["POST"])
def get_recommendations():
    try:
        print("===== RECOMMEND API HIT =====")
        data = request.get_json()
        print("REQUEST DATA:", data)

        if not data or "movie" not in data:
            return jsonify({"success": False, "message": "Missing 'movie' in request body"}), 400
        
        movie_name = data.get("movie")
        tmdb_id = data.get("tmdb_id")
        
        if engine is None or not engine.is_ready:
            return jsonify({
                "success": False, 
                "message": "Recommendation engine is not available due to a server initialization error."
            }), 503
            
        result = engine.recommend(movie_name, tmdb_id=tmdb_id)
        print("ENGINE RESULT:", "Success" if result.get("success") else "Failed")
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
    except Exception as e:
        print(f"Failed during recommendation generation: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/search", methods=["GET"])
def search_movies():
    try:
        q = request.args.get("q", "").strip().lower()
        if not q:
            return jsonify({"results": []}), 200
            
        if engine is None or not engine.is_ready:
            return jsonify({"results": [], "message": "Engine not ready"}), 503
            
        results = []
        import pandas as pd
        
        for idx, row in engine.movies.iterrows():
            title = str(row.get("title", ""))
            title_lower = title.lower()
            
            score = 0
            if title_lower == q:
                score = 100
            elif title_lower.startswith(q):
                score = 90
            elif f" {q} " in f" {title_lower} " or f" {q}:" in f" {title_lower} " or f" {q}-" in f" {title_lower} ":
                score = 80
            elif q in title_lower:
                score = 70
                
            if score > 0:
                results.append({
                    "id": row["id"],
                    "title": title,
                    "release_year": str(row.get("release_date", "Unknown"))[:4],
                    "poster_path": row.get("poster_path") if "poster_path" in engine.movies.columns else None,
                    "score": score
                })
                
        # Sort by score (desc), then title length (asc)
        results.sort(key=lambda x: (-x["score"], len(x["title"])))
        
        final_results = []
        for r in results[:10]:
            poster = r["poster_path"]
            movie_id_str = str(r["id"])
            
            # Fallback to tmdb_cache if poster is not in dataframe
            if (pd.isna(poster) or not poster or str(poster) == "Unknown") and engine and hasattr(engine, "tmdb_cache"):
                cached_data = engine.tmdb_cache.get(movie_id_str)
                if isinstance(cached_data, dict):
                    poster = cached_data.get("poster_path")

            if pd.notna(poster) and poster and str(poster) != "Unknown":
                poster_url = str(poster)
                if not poster_url.startswith("http") and not poster_url.startswith("/"):
                    poster_url = "/" + poster_url
                if not poster_url.startswith("http"):
                    poster_url = f"https://image.tmdb.org/t/p/w500{poster_url}"
            else:
                poster_url = "/no_poster_found.png"
                
            final_results.append({
                "id": int(r["id"]),
                "title": r["title"],
                "release_year": r["release_year"],
                "poster": poster_url
            })
            
        return jsonify({"results": final_results}), 200
    except Exception as e:
        print(f"Failed during search: {e}")
        return jsonify({"results": [], "message": "Internal server error"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok", 
        "engine_ready": engine is not None and engine.is_ready
    }), 200

if __name__ == "__main__":
    print("Starting Flask server...")
    # Force port 5000 because the frontend hardcodes requests to localhost:5000
    app.run(host="0.0.0.0", port=5000, debug=False)