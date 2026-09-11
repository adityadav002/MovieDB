import time
import json
import os
import re
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from utils import fetch_tmdb_movie_details, fetch_tmdb_search

TMDB_CACHE_FILE = "cache/tmdb_cache.json"

THEMATIC_KEYWORDS = {
    "superhero", "super power", "comic book", "marvel comic", "dc comic", 
    "based on comic book", "based on comic", "vigilante", "masked hero", 
    "superhuman", "crime fighting", "hero"
}

class RecommendationEngine:
    def __init__(self, movies_df, feature_matrices, movie_index, pipeline):
        self.movies = movies_df
        self.feature_matrices = feature_matrices
        self.movie_index = movie_index
        self.pipeline = pipeline
        self.is_ready = True
        self.tmdb_cache = self._load_tmdb_cache()

    def _load_tmdb_cache(self):
        if os.path.exists(TMDB_CACHE_FILE):
            try:
                with open(TMDB_CACHE_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}
        
    def _save_tmdb_cache(self):
        try:
            if not os.path.exists("cache"):
                os.makedirs("cache")
            with open(TMDB_CACHE_FILE, "w") as f:
                json.dump(self.tmdb_cache, f)
        except Exception as e:
            pass

    def get_tmdb_details(self, movie_id):
        movie_id_str = str(movie_id)
        if movie_id_str in self.tmdb_cache:
            if self.tmdb_cache[movie_id_str] == "FAILED":
                return None, "cache_failed"
            return self.tmdb_cache[movie_id_str], "cache_success"
        
        data = fetch_tmdb_movie_details(movie_id)
        if data:
            self.tmdb_cache[movie_id_str] = data
            self._save_tmdb_cache()
            return data, "tmdb_success"
        else:
            self.tmdb_cache[movie_id_str] = "FAILED"
            self._save_tmdb_cache()
            return None, "tmdb_failed"

    def _calculate_title_similarity(self, target_title, candidate_title):
        def clean_title(t):
            t = t.lower().split(":")[0].strip()
            t = re.sub(r'[^\w\s]', ' ', t)
            t = re.sub(r'\b(part|vol|volume|chapter|episode)\s*\w+\b', '', t)
            t = re.sub(r'\b(ii|iii|iv|v|vi|vii|viii|ix|x|\d+)\b', '', t)
            return " ".join(t.split())
            
        target_p = clean_title(target_title)
        candidate_p = clean_title(candidate_title)
        
        # 1. EXACT BASE TITLE MATCH
        if target_p == candidate_p and target_p:
            return 1.0
            
        # 2. FRANCHISE MATCH (Sequel/Expansion)
        if target_p in candidate_p and target_p:
            if len(target_p.split()) >= 2 or candidate_p.startswith(target_p):
                return 0.85
            
        # 3. FRANCHISE MATCH (Prequel/Base) 
        if candidate_p in target_p and candidate_p:
            if len(candidate_p.split()) >= 2 or target_p.startswith(candidate_p):
                return 0.85
                
        # 4. TOKEN OVERLAP
        set_target = set(target_p.split())
        set_candidate = set(candidate_p.split())
        
        stop_words = {"the", "and", "or", "of", "in", "a", "an", "to"}
        generic_words = {"man", "men", "woman", "women", "boy", "girl", "movie", "film", 
                         "story", "one", "day", "night", "time", "world", "life", "return", 
                         "returns", "dark", "light", "new"}
                         
        set_target = {w for w in set_target if w not in stop_words}
        set_candidate = {w for w in set_candidate if w not in stop_words}
        
        if not set_target or not set_candidate:
            return 0.0
            
        intersection = set_target.intersection(set_candidate)
        
        # If intersection only contains generic words (e.g., 'man' in 'Spider-Man' and 'The Man'), zero it out!
        if intersection and all(w in generic_words for w in intersection):
            return 0.0
            
        union = set_target.union(set_candidate)
        sim = len(intersection) / len(union)
        
        # 5. PENALIZE WEAK MATCHES (e.g., 0.5 -> 0.25)
        return sim ** 2

    def _calculate_jaccard(self, target_vec, matrix):
        intersection = matrix.dot(target_vec.T).toarray().flatten()
        sum_target = target_vec.sum()
        sum_matrix = np.asarray(matrix.sum(axis=1)).flatten()
        union = sum_target + sum_matrix - intersection
        union[union == 0] = 1 
        return intersection / union

    def recommend(self, movie_name, tmdb_id=None, top_n=20):
        if not self.is_ready:
            return {"success": False, "message": "Recommendation engine is not initialized."}

        is_new_movie = False
        target_idx = None
        target_matrices = None
        
        if movie_name in self.movie_index:
            target_idx = self.movie_index[movie_name]
            target_matrices = {
                "genres": self.feature_matrices["genres"][target_idx],
                "keywords": self.feature_matrices["keywords"][target_idx],
                "cast": self.feature_matrices["cast"][target_idx],
                "director": self.feature_matrices["director"][target_idx],
                "overview": self.feature_matrices["overview"][target_idx]
            }
        else:
            is_new_movie = True
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
            target_matrices = self.pipeline.process_query(movie_data)

        sim_genres = self._calculate_jaccard(target_matrices["genres"], self.feature_matrices["genres"])
        sim_keywords = self._calculate_jaccard(target_matrices["keywords"], self.feature_matrices["keywords"])
        sim_cast = self._calculate_jaccard(target_matrices["cast"], self.feature_matrices["cast"])
        sim_director = self._calculate_jaccard(target_matrices["director"], self.feature_matrices["director"])
        sim_overview = cosine_similarity(target_matrices["overview"], self.feature_matrices["overview"]).flatten()

        target_keyword_indices = target_matrices["keywords"].nonzero()[1]
        target_keyword_words = [self.pipeline.cv_keywords.get_feature_names_out()[i] for i in target_keyword_indices]
        is_target_thematic = any(any(tk in kw.replace(" ", "") for kw in target_keyword_words) for tk in THEMATIC_KEYWORDS)

        recommendations = []
        seen_identities = set()

        for i in range(len(self.movies)):
            if not is_new_movie and i == target_idx:
                continue
                
            target_title = self.movies.iloc[i]["title"]
            
            dataset_year = self.movies.iloc[i].get("release_date", "Unknown")
            if str(dataset_year) != "Unknown" and str(dataset_year) != "nan":
                dataset_year = str(dataset_year)[:4]
            else:
                dataset_year = "Unknown"
                
            identity = f"{target_title.lower().strip()}_{dataset_year}"
            if identity in seen_identities:
                continue
            seen_identities.add(identity)

            sim_title = self._calculate_title_similarity(movie_name, target_title)
            if is_new_movie and target_title.lower() == movie_name.lower():
                continue

            candidate_keyword_str = str(self.movies.iloc[i].get("keywords", ""))
            is_candidate_thematic = any(tk.replace(" ", "") in candidate_keyword_str.lower() for tk in THEMATIC_KEYWORDS)

            s_title = sim_title
            s_key = sim_keywords[i]
            s_genre = sim_genres[i]
            s_cast = sim_cast[i]
            s_dir = sim_director[i]
            s_over = sim_overview[i]

            score_title = s_title * 3.0
            score_keywords = s_key * 2.5
            score_genres = s_genre * 2.0
            score_cast = s_cast * 1.5
            score_director = s_dir * 1.5
            score_overview = s_over * 0.5
            
            thematic_score = 0.0
            if is_target_thematic and is_candidate_thematic:
                thematic_score = 1.5 
            
            penalty = 0.0
            if s_key < 0.05 and s_title == 0.0:
                penalty -= 1.5
                
            rating = self.movies.iloc[i]["rating_score"] * 0.15
            popularity = self.movies.iloc[i]["popularity_score"] * 0.05
            vote_score = self.movies.iloc[i]["vote_score"] * 0.05
            score_metadata = rating + popularity + vote_score

            final_score = score_title + score_keywords + score_genres + score_cast + score_director + score_overview + thematic_score + score_metadata + penalty
            
            if final_score > 0.4:
                recommendations.append({
                    "index": i,
                    "movie_id": int(self.movies.iloc[i]["id"]),
                    "title": target_title,
                    "dataset_year": dataset_year,
                    "final_score": final_score,
                    "sim_title": s_title,
                    "sim_keywords": s_key,
                    "sim_genres": s_genre,
                    "sim_cast": s_cast,
                    "sim_director": s_dir,
                    "sim_overview": s_over,
                    "thematic_score": thematic_score,
                    "sim_metadata": score_metadata
                })

        recommendations.sort(key=lambda x: x["final_score"], reverse=True)
        diverse_results = []
        franchise_counts = {}
        
        print(f"\nREQUEST MOVIE: {movie_name}")
        print("TOP RECOMMENDATIONS:")
        
        for idx, rec in enumerate(recommendations):
            t_base = rec["title"].lower().split(":")[0].strip()
            count = franchise_counts.get(t_base, 0)
            
            if count < 3: 
                diverse_results.append(rec)
                franchise_counts[t_base] = count + 1
                
                if len(diverse_results) <= 20:
                    print(f"\n{len(diverse_results)}. {rec['title']}")
                    print(f"   Final: {rec['final_score']:.2f}")
                    print(f"   Title: {rec['sim_title']:.2f} | Keyword: {rec['sim_keywords']:.2f} | Genre: {rec['sim_genres']:.2f}")
                    print(f"   Cast: {rec['sim_cast']:.2f} | Director: {rec['sim_director']:.2f} | Overview: {rec['sim_overview']:.2f}")
                    print(f"   Thematic Boost: {rec['thematic_score']:.2f}")
                
            if len(diverse_results) >= top_n:
                break
                
        final_results = []
        for rec in diverse_results[:10]:
            idx = rec["index"]
            dataset_rating = self.movies.iloc[idx].get("vote_average", "N/A")
            dataset_year = self.movies.iloc[idx].get("release_date", "Unknown")
            if str(dataset_year) != "Unknown" and str(dataset_year) != "nan":
                dataset_year = str(dataset_year)[:4]
            else:
                dataset_year = "Unknown"
                
            dataset_poster = self.movies.iloc[idx].get("poster_path") if "poster_path" in self.movies.columns else None
            
            poster_url = None
            source = "none"
            
            if pd.notna(dataset_poster) and dataset_poster and dataset_poster != "Unknown":
                poster_url = str(dataset_poster)
                if not poster_url.startswith("http") and not poster_url.startswith("/"):
                    # Add slash if missing for tmdb format
                    if not poster_url.startswith("/"):
                        poster_url = "/" + poster_url
                if not poster_url.startswith("http"):
                    poster_url = f"https://image.tmdb.org/t/p/w500{poster_url}"
                source = "local_dataset"

            details, tmdb_source = self.get_tmdb_details(rec["movie_id"])
            
            if details:
                if not poster_url:
                    poster = details.get("poster_path")
                    if poster:
                        poster_url = f"https://image.tmdb.org/t/p/w500{poster}"
                        source = tmdb_source
            elif not poster_url:
                source = tmdb_source
                
            if not poster_url:
                poster_url = "/no_poster_found.png"
                
            print(f"POSTER DEBUG | Title: {rec['title']} | Local ID: {idx} | TMDB ID: {rec['movie_id']} | "
                  f"Poster Path: {dataset_poster} | Final URL: {poster_url} | Source: {source}")

            if details:
                final_results.append({
                    "id": rec["movie_id"],
                    "title": details.get("title", rec["title"]),
                    "poster": poster_url,
                    "rating": details.get("vote_average", dataset_rating),
                    "year": details.get("release_date", "Unknown")[:4] if details.get("release_date") else dataset_year,
                    "score": round(rec["final_score"], 4),
                    "reason": "Shared franchise, keywords, and metadata"
                })
            else:
                final_results.append({
                    "id": rec["movie_id"],
                    "title": rec["title"],
                    "poster": poster_url,
                    "rating": dataset_rating,
                    "year": dataset_year,
                    "score": round(rec["final_score"], 4),
                    "reason": "Shared metadata"
                })

        return {
            "success": True,
            "movie": movie_name,
            "recommendations": final_results
        }
