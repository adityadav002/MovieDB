from sklearn.metrics.pairwise import cosine_similarity

class RecommendationEngine:
    def __init__(self, movies_df, feature_matrix, movie_index):
        """
        Initializes the recommendation engine with cached data.
        """
        self.movies = movies_df
        self.feature_matrix = feature_matrix
        self.movie_index = movie_index
        self.is_ready = True

    def recommend(self, movie_name, top_n=10):
        """
        Dynamically computes cosine similarity and returns top recommendations.
        """
        if not self.is_ready:
            return {
                "success": False,
                "message": "Recommendation engine is not initialized. Models are missing."
            }

        if movie_name not in self.movie_index:
            return {
                "success": False,
                "message": f"Movie '{movie_name}' not found."
            }

        idx = self.movie_index[movie_name]
        
        # Dynamically compute similarity only for this specific movie
        target_vector = self.feature_matrix[idx]
        distances = cosine_similarity(target_vector, self.feature_matrix).flatten()
        
        recommendations = []
        
        # Base title for franchise boosting
        base_title = movie_name.lower().split(":")[0].strip()

        for i, similarity_score in enumerate(distances):
            if i == idx:
                continue

            target_title = self.movies.iloc[i]["title"].lower()
            target_base = target_title.split(":")[0].strip()
            
            # Franchise Boost
            franchise_boost = 0.0
            if base_title and target_base and (base_title in target_title or target_base in movie_name.lower()):
                franchise_boost = 0.15 # Massive boost for direct sequels
                
            # Adaptive Weighting
            if similarity_score > 0.15:
                text_weight = 0.95
                rating_weight = 0.02
                pop_weight = 0.02
                vote_weight = 0.01
            else:
                text_weight = 0.80
                rating_weight = 0.10
                pop_weight = 0.05
                vote_weight = 0.05

            # Adjust score using precomputed metrics
            final_score = (
                similarity_score * text_weight +
                self.movies.iloc[i]["rating_score"] * rating_weight +
                self.movies.iloc[i]["popularity_score"] * pop_weight +
                self.movies.iloc[i]["vote_score"] * vote_weight +
                franchise_boost
            )
            recommendations.append((i, final_score))

        recommendations.sort(key=lambda x: x[1], reverse=True)
        recommendations = recommendations[:top_n]
        results = []

        for i, score in recommendations:
            results.append({
                "movie_id": int(self.movies.iloc[i]["id"]),
                "score": round(score, 4)
            })

        return {
            "success": True,
            "movie": movie_name,
            "recommendations": results
        }
