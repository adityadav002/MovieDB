import time
from sklearn.metrics.pairwise import cosine_similarity
from utils import fetch_tmdb_movie_details, fetch_tmdb_search

class RecommendationEngine:
    def __init__(self, movies_df, feature_matrix, embeddings_matrix, movie_index, pipeline):
        self.movies = movies_df
        self.feature_matrix = feature_matrix
        self.embeddings_matrix = embeddings_matrix
        self.movie_index = movie_index
        self.pipeline = pipeline
        self.is_ready = True
        
        # Simple in-memory cache for TMDB details to speed up N+1 prevention
        self.tmdb_cache = {}

    def get_tmdb_details(self, movie_id):
        if movie_id in self.tmdb_cache:
            return self.tmdb_cache[movie_id]
        
        data = fetch_tmdb_movie_details(movie_id)
        if data:
            self.tmdb_cache[movie_id] = data
        return data

    def recommend(self, movie_name, tmdb_id=None, top_n=10, threshold=0.35):
        if not self.is_ready:
            return {"success": False, "message": "Recommendation engine is not initialized."}

        is_new_movie = False
        target_idx = None
        target_tfidf_vec = None
        target_emb_vec = None
        
        # 1. Determine if movie is in local dataset or if it's external
        if movie_name in self.movie_index:
            target_idx = self.movie_index[movie_name]
            target_tfidf_vec = self.feature_matrix[target_idx]
            target_emb_vec = [self.embeddings_matrix[target_idx]]
            print(f"Using local dataset vectors for: {movie_name}")
        else:
            is_new_movie = True
            print(f"Movie '{movie_name}' not in local dataset. Fetching external representation...")
            
            # Use tmdb_id if provided, otherwise search
            movie_data = None
            if tmdb_id:
                movie_data = fetch_tmdb_movie_details(tmdb_id)
            else:
                search_res = fetch_tmdb_search(movie_name)
                if search_res:
                    movie_data = fetch_tmdb_movie_details(search_res["id"])
                    
            if not movie_data:
                return {"success": False, "message": f"Movie '{movie_name}' not found locally or on TMDB."}
                
            movie_name = movie_data.get("title", movie_name)
            target_tfidf_vec, emb_np = self.pipeline.process_query(movie_data)
            target_emb_vec = emb_np

        # 2. Calculate Similarities
        tfidf_distances = cosine_similarity(target_tfidf_vec, self.feature_matrix).flatten()
        emb_distances = cosine_similarity(target_emb_vec, self.embeddings_matrix).flatten()

        recommendations = []
        base_title = movie_name.lower().split(":")[0].strip()

        # 3. Hybrid Scoring
        for i in range(len(self.movies)):
            if not is_new_movie and i == target_idx:
                continue # Skip the target movie itself
                
            sim_lexical = tfidf_distances[i]
            sim_semantic = emb_distances[i]
            
            target_title = self.movies.iloc[i]["title"].lower()
            target_base = target_title.split(":")[0].strip()
            
            # Prevent exact title matches (e.g., if a new movie has the exact same name as an old one)
            if is_new_movie and target_title == movie_name.lower():
                continue

            franchise_boost = 0.0
            if base_title and target_base and (base_title in target_title or target_base in movie_name.lower()):
                franchise_boost = 0.10 
                
            rating = self.movies.iloc[i]["rating_score"]
            popularity = self.movies.iloc[i]["popularity_score"]

            # Hybrid Score weights: 50% semantic, 30% lexical, 10% rating, 10% popularity
            final_score = (sim_semantic * 0.50) + (sim_lexical * 0.30) + (rating * 0.10) + (popularity * 0.10) + franchise_boost
            
            if final_score >= threshold:
                recommendations.append({
                    "index": i,
                    "movie_id": int(self.movies.iloc[i]["id"]),
                    "title": self.movies.iloc[i]["title"],
                    "score": final_score,
                    "sim_semantic": sim_semantic,
                    "sim_lexical": sim_lexical
                })

        # 4. Diversity Re-ranking & Filtering
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        diverse_results = []
        franchise_counts = {}
        
        for rec in recommendations:
            t_base = rec["title"].lower().split(":")[0].strip()
            count = franchise_counts.get(t_base, 0)
            
            if count < 2: # Max 2 movies from the same exact franchise
                diverse_results.append(rec)
                franchise_counts[t_base] = count + 1
                
            if len(diverse_results) >= top_n:
                break
                
        # 5. Metadata Enrichment (Eliminating N+1 on frontend)
        final_results = []
        for rec in diverse_results:
            details = self.get_tmdb_details(rec["movie_id"])
            if details:
                poster = details.get("poster_path")
                final_results.append({
                    "id": rec["movie_id"],
                    "title": details.get("title", rec["title"]),
                    "poster": f"https://image.tmdb.org/t/p/w500{poster}" if poster else "/no_poster_found.png",
                    "rating": details.get("vote_average", 0),
                    "year": details.get("release_date", "Unknown")[:4] if details.get("release_date") else "Unknown",
                    "score": round(rec["score"], 4),
                    "reason": "Similar semantic themes" if rec["sim_semantic"] > 0.4 else "Shared keywords and genres"
                })
            else:
                # Fallback if TMDB fails
                final_results.append({
                    "id": rec["movie_id"],
                    "title": rec["title"],
                    "poster": "/no_poster_found.png",
                    "rating": "N/A",
                    "year": "N/A",
                    "score": round(rec["score"], 4),
                    "reason": "Similar metadata"
                })

        return {
            "success": True,
            "movie": movie_name,
            "recommendations": final_results
        }
