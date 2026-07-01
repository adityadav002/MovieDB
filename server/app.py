import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from cache_manager import CacheManager
from recommendation_engine import RecommendationEngine

app = Flask(__name__)
CORS(
    app,
    origins=[
        "http://localhost:5173",
        os.getenv("CLIENT_URL", "http://localhost:5173")
    ],
    supports_credentials=True
)

# Initialize Recommendation Engine
engine = None

try:
    print("Initializing application...")
    # This will generate cache if it doesn't exist or is invalid
    movies_df, feature_matrix, movie_index, vectorizer = CacheManager.ensure_cache()
    
    engine = RecommendationEngine(movies_df, feature_matrix, movie_index)
    print("Recommendation engine initialized successfully.")
except Exception as e:
    print(f"Failed to initialize recommendation engine: {e}")

@app.route("/recommend", methods=["POST"])
def get_recommendations():
    try:
        data = request.get_json()
        if not data or "movie" not in data:
            return jsonify({"success": False, "message": "Missing 'movie' in request body"}), 400
        
        movie_name = data.get("movie")
        
        if engine is None or not engine.is_ready:
            return jsonify({
                "success": False, 
                "message": "Recommendation engine is not available."
            }), 503
            
        result = engine.recommend(movie_name)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
    except Exception as e:
        print(f"Error during recommendation: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok", 
        "engine_ready": engine is not None and engine.is_ready
    }), 200

if __name__ == "__main__":
    # Use a production-ready WSGI server in production, but here we provide standard app.run
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)