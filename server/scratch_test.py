import ast
import pandas as pd
import numpy as from numpy
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

def convert(obj):
    names = []
    for item in ast.literal_eval(obj):
        names.append(item['name'])
    return names

def fetch_cast(obj):
    actors = []
    for item in ast.literal_eval(obj)[:5]:
        actors.append(item['name'])
    return actors

def fetch_director(obj):
    for item in ast.literal_eval(obj):
        if item['job'] == 'Director':
            return [item['name']]
    return []

# 1. Load Data
movies = pd.read_csv("tmdb_5000_movies.csv")
credits = pd.read_csv("tmdb_5000_credits.csv")
movies = movies.merge(credits, on="title")
movies = movies[["id", "title", "overview", "genres", "keywords", "cast", "crew", "vote_average", "vote_count", "popularity"]]
movies.dropna(inplace=True)
movies.reset_index(drop=True, inplace=True)

movies["genres"] = movies["genres"].apply(convert)
movies["keywords"] = movies["keywords"].apply(convert)
movies["cast"] = movies["cast"].apply(fetch_cast)
movies["crew"] = movies["crew"].apply(fetch_director)
movies["overview_words"] = movies["overview"].apply(lambda x: x.split())

for column in ["genres", "keywords", "cast", "crew"]:
    movies[column] = movies[column].apply(lambda x: [item.replace(" ", "") for item in x])

def get_recs(movie_name, tags_col, top_n=10):
    tfidf = TfidfVectorizer(max_features=10000, stop_words="english", ngram_range=(1, 2))
    vectors = tfidf.fit_transform(movies[tags_col])
    similarity = cosine_similarity(vectors)
    
    scaler = MinMaxScaler()
    movies["rating_score"] = scaler.fit_transform(movies[["vote_average"]])
    movies["popularity_score"] = scaler.fit_transform(movies[["popularity"]])
    movies["vote_score"] = scaler.fit_transform(movies[["vote_count"]])
    
    if movie_name not in movies["title"].values:
        return []
    
    movie_index = movies[movies["title"] == movie_name].index[0]
    distances = similarity[movie_index]
    recommendations = []
    for idx, similarity_score in enumerate(distances):
        if idx == movie_index: continue
        final_score = (similarity_score * 0.80 + 
                       movies.iloc[idx]["rating_score"] * 0.10 + 
                       movies.iloc[idx]["popularity_score"] * 0.05 + 
                       movies.iloc[idx]["vote_score"] * 0.05)
        recommendations.append((movies.iloc[idx]["title"], final_score))
    recommendations.sort(key=lambda x: x[1], reverse=True)
    return [r[0] for r in recommendations[:top_n]]

print("=== ZOMBIELAND ORIGINAL RECS ===")
movies["tags_original"] = (movies["genres"] * 4 + movies["keywords"] * 4 + movies["crew"] * 4 + movies["cast"] * 3 + movies["overview_words"])
movies["tags_original"] = movies["tags_original"].apply(lambda x: " ".join(x).lower())
print(get_recs("Zombieland", "tags_original", 10))

print("\n=== ZOMBIELAND NEW RECS ===")
# Adjust weights: Genres (x3), Keywords (x4), Cast (x2), Crew (x1), Overview (x2)
movies["tags_new"] = (movies["genres"] * 3 + movies["keywords"] * 4 + movies["crew"] * 1 + movies["cast"] * 2 + movies["overview_words"] * 2)
movies["tags_new"] = movies["tags_new"].apply(lambda x: " ".join(x).lower())
print(get_recs("Zombieland", "tags_new", 10))
