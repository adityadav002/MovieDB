import ast
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
import gc

def convert(obj):
    try:
        return [item['name'] for item in ast.literal_eval(obj)]
    except (ValueError, SyntaxError):
        return []

def fetch_cast(obj):
    try:
        return [item['name'] for item in ast.literal_eval(obj)[:5]]
    except (ValueError, SyntaxError):
        return []

def fetch_director(obj):
    try:
        for item in ast.literal_eval(obj):
            if item['job'] == 'Director':
                return [item['name']]
        return []
    except (ValueError, SyntaxError):
        return []

def run_preprocessing(movies_path="tmdb_5000_movies.csv", credits_path="tmdb_5000_credits.csv"):
    """
    Reads the datasets, cleans data, computes features, and returns the models required for recommendation.
    Does NOT compute the NxN similarity matrix.
    Returns:
        final_movies: pandas DataFrame with id, title, and scores.
        feature_matrix: scipy.sparse matrix representing TF-IDF vectors (float32).
        movie_index: dict mapping movie title to its index in the feature matrix.
        vectorizer: trained TfidfVectorizer (optional, but good to have if needed later).
    """
    print("Loading datasets...")
    movies = pd.read_csv(movies_path)
    credits = pd.read_csv(credits_path)

    movies = movies.merge(credits, on="title")
    
    # Keep only necessary columns
    columns_to_keep = [
        "id", "title", "overview", "genres", "keywords", 
        "cast", "crew", "vote_average", "vote_count", "popularity"
    ]
    movies = movies[columns_to_keep].copy()
    movies.dropna(inplace=True)
    movies.reset_index(drop=True, inplace=True)

    print(f"Movies Loaded: {len(movies)}")
    print("Processing movie metadata...")

    movies["genres"] = movies["genres"].apply(convert)
    movies["keywords"] = movies["keywords"].apply(convert)
    movies["cast"] = movies["cast"].apply(fetch_cast)
    movies["crew"] = movies["crew"].apply(fetch_director)
    movies["overview"] = movies["overview"].apply(lambda x: str(x).split())

    for column in ["genres", "keywords", "cast", "crew"]:
        movies[column] = movies[column].apply(lambda x: [str(item).replace(" ", "") for item in x])

    movies["tags"] = (
        movies["genres"] * 3 +
        movies["keywords"] * 3 +
        movies["crew"] * 1 +
        movies["cast"] * 2 +
        movies["overview"] * 3
    )

    movies["tags"] = movies["tags"].apply(lambda x: " ".join(x).lower())

    # Free up memory
    movies.drop(columns=["overview", "genres", "keywords", "cast", "crew"], inplace=True)
    gc.collect()

    print("Generating TF-IDF vectors...")
    # Use float32 to save memory
    tfidf = TfidfVectorizer(
        max_features=10000,
        stop_words="english",
        ngram_range=(1, 2),
        dtype=np.float32
    )

    feature_matrix = tfidf.fit_transform(movies["tags"])
    
    # Drop tags to save memory, we only need the tfidf vectors now
    movies.drop(columns=["tags"], inplace=True)

    print("Calculating scores...")
    scaler = MinMaxScaler()
    movies["rating_score"] = scaler.fit_transform(movies[["vote_average"]])
    movies["popularity_score"] = scaler.fit_transform(movies[["popularity"]])
    movies["vote_score"] = scaler.fit_transform(movies[["vote_count"]])

    final_movies = movies[["id", "title", "rating_score", "popularity_score", "vote_score"]].copy()

    # Create movie index lookup for O(1) searches
    movie_index = {title: idx for idx, title in enumerate(final_movies["title"])}

    return final_movies, feature_matrix, movie_index, tfidf

