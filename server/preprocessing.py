import ast
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sentence_transformers import SentenceTransformer
import gc

class PreprocessingPipeline:
    def __init__(self):
        self.tfidf = TfidfVectorizer(max_features=10000, stop_words="english", ngram_range=(1, 2), dtype=np.float32)
        self.scaler_rating = MinMaxScaler()
        self.scaler_popularity = MinMaxScaler()
        self.scaler_votes = MinMaxScaler()
        self.encoder = None

    def _init_encoder(self):
        if self.encoder is None:
            # Lightweight and deployment friendly embedding model
            self.encoder = SentenceTransformer("all-MiniLM-L6-v2")

    @staticmethod
    def _parse_list(obj, limit=None):
        try:
            items = ast.literal_eval(obj) if isinstance(obj, str) else obj
            names = [item['name'] for item in items] if items else []
            return names[:limit] if limit else names
        except:
            return []

    @staticmethod
    def _parse_director(obj):
        try:
            items = ast.literal_eval(obj) if isinstance(obj, str) else obj
            for item in items:
                if item.get('job') == 'Director':
                    return [item['name']]
        except:
            pass
        return []

    def prepare_text_features(self, row):
        genres = " ".join([str(g).replace(" ", "") for g in row.get("genres", [])])
        keywords = " ".join([str(k).replace(" ", "") for k in row.get("keywords", [])])
        cast = " ".join([str(c).replace(" ", "") for c in row.get("cast", [])])
        crew = " ".join([str(c).replace(" ", "") for c in row.get("crew", [])])
        overview = str(row.get("overview", ""))
        
        # Tags for lexical TF-IDF
        tags = f"{genres} {keywords} {crew} {cast} {overview}".lower()
        
        # Natural language for semantic embeddings
        semantic_text = (
            f"Title: {row.get('title', '')}. "
            f"Genres: {', '.join(row.get('genres', []))}. "
            f"Cast: {', '.join(row.get('cast', []))}. "
            f"Director: {', '.join(row.get('crew', []))}. "
            f"Overview: {overview}"
        )
        
        return tags, semantic_text

    def process_dataset(self, movies_path="tmdb_5000_movies.csv", credits_path="tmdb_5000_credits.csv"):
        print("Loading datasets...")
        movies = pd.read_csv(movies_path)
        credits = pd.read_csv(credits_path)
        movies = movies.merge(credits, on="title")
        
        columns_to_keep = ["id", "title", "overview", "genres", "keywords", "cast", "crew", "vote_average", "vote_count", "popularity"]
        movies = movies[columns_to_keep].copy()
        movies.dropna(subset=["title", "id"], inplace=True)
        movies.reset_index(drop=True, inplace=True)
        
        print(f"Movies Loaded: {len(movies)}")
        print("Parsing metadata...")
        movies["genres"] = movies["genres"].apply(self._parse_list)
        movies["keywords"] = movies["keywords"].apply(self._parse_list)
        movies["cast"] = movies["cast"].apply(lambda x: self._parse_list(x, limit=5))
        movies["crew"] = movies["crew"].apply(self._parse_director)
        
        print("Preparing text features...")
        tags_list = []
        semantic_list = []
        for _, row in movies.iterrows():
            tags, semantic = self.prepare_text_features(row)
            tags_list.append(tags)
            semantic_list.append(semantic)
            
        print("Generating TF-IDF vectors...")
        tfidf_matrix = self.tfidf.fit_transform(tags_list)
        
        print("Generating Semantic Embeddings (this may download the model on first run)...")
        self._init_encoder()
        embeddings_matrix = self.encoder.encode(semantic_list, convert_to_numpy=True, show_progress_bar=True)
        
        print("Calculating normalized scores...")
        movies["rating_score"] = self.scaler_rating.fit_transform(movies[["vote_average"]].fillna(0))
        movies["popularity_score"] = self.scaler_popularity.fit_transform(movies[["popularity"]].fillna(0))
        movies["vote_score"] = self.scaler_votes.fit_transform(movies[["vote_count"]].fillna(0))
        
        final_movies = movies[["id", "title", "rating_score", "popularity_score", "vote_score"]].copy()
        movie_index = {title: idx for idx, title in enumerate(final_movies["title"])}
        
        return final_movies, tfidf_matrix, embeddings_matrix, movie_index

    def process_query(self, tmdb_data):
        """
        Process a single TMDB response dictionary into query vectors.
        """
        # TMDB's /movie/{id}?append_to_response=credits,keywords response structure
        row = {
            "title": tmdb_data.get("title", ""),
            "overview": tmdb_data.get("overview", ""),
            "genres": [g["name"] for g in tmdb_data.get("genres", [])],
            "keywords": [k["name"] for k in tmdb_data.get("keywords", {}).get("keywords", [])],
            "cast": [c["name"] for c in tmdb_data.get("credits", {}).get("cast", [])[:5]],
            "crew": [c["name"] for c in tmdb_data.get("credits", {}).get("crew", []) if c.get("job") == "Director"],
        }
        
        tags, semantic = self.prepare_text_features(row)
        
        tfidf_vec = self.tfidf.transform([tags])
        
        self._init_encoder()
        emb_vec = self.encoder.encode([semantic], convert_to_numpy=True)
        
        return tfidf_vec, emb_vec
