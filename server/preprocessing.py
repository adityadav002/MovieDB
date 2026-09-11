import ast
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import MinMaxScaler
import gc

class PreprocessingPipeline:
    def __init__(self):
        self.tfidf_overview = TfidfVectorizer(max_features=5000, stop_words="english", dtype=np.float32)
        self.cv_keywords = CountVectorizer(binary=True, dtype=np.float32)
        self.cv_genres = CountVectorizer(binary=True, dtype=np.float32)
        self.cv_cast = CountVectorizer(binary=True, dtype=np.float32)
        self.cv_director = CountVectorizer(binary=True, dtype=np.float32)
        
        self.scaler_rating = MinMaxScaler()
        self.scaler_popularity = MinMaxScaler()
        self.scaler_votes = MinMaxScaler()

    @staticmethod
    def _parse_list(obj, limit=None):
        if pd.isna(obj) or not obj:
            return []
        try:
            items = ast.literal_eval(obj) if isinstance(obj, str) else obj
            names = [item.get('name', '') for item in items if isinstance(item, dict)] if items else []
            return names[:limit] if limit else names
        except Exception:
            return []

    @staticmethod
    def _parse_director(obj):
        if pd.isna(obj) or not obj:
            return []
        try:
            items = ast.literal_eval(obj) if isinstance(obj, str) else obj
            if not items:
                return []
            for item in items:
                if isinstance(item, dict) and item.get('job') == 'Director':
                    return [item.get('name', '')]
        except Exception:
            pass
        return []

    def prepare_text_features(self, row):
        # Safe getters
        genres = row.get("genres", [])
        keywords = row.get("keywords", [])
        cast = row.get("cast", [])
        crew = row.get("crew", [])
        overview = str(row.get("overview", "")) if pd.notna(row.get("overview")) else ""

        def clean_list(lst):
            return " ".join([str(x).replace(" ", "") for x in lst if pd.notna(x)])

        return {
            "genres": clean_list(genres),
            "keywords": clean_list(keywords),
            "cast": clean_list(cast),
            "director": clean_list(crew),
            "overview": overview
        }

    def process_dataset(self, movies_path="tmdb_5000_movies.csv", credits_path="tmdb_5000_credits.csv"):
        print("Loading datasets...")
        movies = pd.read_csv(movies_path)
        credits = pd.read_csv(credits_path)
        movies = movies.merge(credits, on="title")
        
        columns_to_keep = ["id", "title", "overview", "genres", "keywords", "cast", "crew", "vote_average", "vote_count", "popularity"]
        for col in ["release_date", "poster_path"]:
            if col in movies.columns:
                columns_to_keep.append(col)
            else:
                movies[col] = "Unknown" if col == "release_date" else None
                columns_to_keep.append(col)
            
        movies = movies[columns_to_keep].copy()
        movies.dropna(subset=["title", "id"], inplace=True)
        movies.reset_index(drop=True, inplace=True)
        
        print(f"Movies Loaded: {len(movies)}")
        print("Parsing metadata safely...")
        movies["genres"] = movies["genres"].apply(self._parse_list)
        movies["keywords"] = movies["keywords"].apply(self._parse_list)
        movies["cast"] = movies["cast"].apply(lambda x: self._parse_list(x, limit=5))
        movies["crew"] = movies["crew"].apply(self._parse_director)
        
        print("Preparing text features...")
        docs = {"genres": [], "keywords": [], "cast": [], "director": [], "overview": []}
        
        for _, row in movies.iterrows():
            features = self.prepare_text_features(row)
            for k in docs.keys():
                docs[k].append(features[k])
            
        print("Generating feature matrices...")
        feature_matrices = {
            "genres": self.cv_genres.fit_transform(docs["genres"]),
            "keywords": self.cv_keywords.fit_transform(docs["keywords"]),
            "cast": self.cv_cast.fit_transform(docs["cast"]),
            "director": self.cv_director.fit_transform(docs["director"]),
            "overview": self.tfidf_overview.fit_transform(docs["overview"])
        }
        
        del docs
        gc.collect()
        
        print("Calculating normalized scores...")
        movies["rating_score"] = self.scaler_rating.fit_transform(movies[["vote_average"]].fillna(0))
        movies["popularity_score"] = self.scaler_popularity.fit_transform(movies[["popularity"]].fillna(0))
        movies["vote_score"] = self.scaler_votes.fit_transform(movies[["vote_count"]].fillna(0))
        
        final_cols = ["id", "title", "rating_score", "popularity_score", "vote_score", "vote_average", "release_date"]
        if "poster_path" in movies.columns:
            final_cols.append("poster_path")
            
        final_movies = movies[final_cols].copy()
        movie_index = {title: idx for idx, title in enumerate(final_movies["title"])}
        
        return final_movies, feature_matrices, movie_index

    def process_query(self, tmdb_data):
        genres_data = tmdb_data.get("genres", [])
        keywords_data = tmdb_data.get("keywords", {}).get("keywords", [])
        cast_data = tmdb_data.get("credits", {}).get("cast", [])[:5]
        crew_data = tmdb_data.get("credits", {}).get("crew", [])
        
        row = {
            "title": tmdb_data.get("title", ""),
            "overview": tmdb_data.get("overview", ""),
            "genres": [g.get("name", "") for g in genres_data if isinstance(g, dict)],
            "keywords": [k.get("name", "") for k in keywords_data if isinstance(k, dict)],
            "cast": [c.get("name", "") for c in cast_data if isinstance(c, dict)],
            "crew": [c.get("name", "") for c in crew_data if isinstance(c, dict) and c.get("job") == "Director"],
        }
        
        features = self.prepare_text_features(row)
        
        query_matrices = {
            "genres": self.cv_genres.transform([features["genres"]]),
            "keywords": self.cv_keywords.transform([features["keywords"]]),
            "cast": self.cv_cast.transform([features["cast"]]),
            "director": self.cv_director.transform([features["director"]]),
            "overview": self.tfidf_overview.transform([features["overview"]])
        }
        
        return query_matrices
