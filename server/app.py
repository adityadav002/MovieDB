import ast
import os
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(
    app,
    origins=[
        "http://localhost:5173",
        os.getenv("CLIENT_URL")
    ],
    supports_credentials=True
)

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

print("Loading datasets...")
movies = pd.read_csv("tmdb_5000_movies.csv")
credits = pd.read_csv("tmdb_5000_credits.csv")

movies = movies.merge(
    credits,
    on="title"
)

movies = movies[
    [
        "id",
        "title",
        "overview",
        "genres",
        "keywords",
        "cast",
        "crew",
        "vote_average",
        "vote_count",
        "popularity"
    ]
]
movies.dropna(inplace=True)
movies.reset_index(drop=True, inplace=True)

print(f"Movies Loaded: {len(movies)}")

print("Processing movie metadata...")
movies["genres"] = movies["genres"].apply(convert)
movies["keywords"] = movies["keywords"].apply(convert)
movies["cast"] = movies["cast"].apply(fetch_cast)
movies["crew"] = movies["crew"].apply(fetch_director)
movies["overview"] = movies["overview"].apply(
    lambda x: x.split()
)

for column in ["genres", "keywords", "cast", "crew"]:
    movies[column] = movies[column].apply(
        lambda x: [item.replace(" ", "") for item in x]
    )

movies["tags"] = (
    movies["genres"] * 4 +
    movies["keywords"] * 4 +
    movies["crew"] * 4 +
    movies["cast"] * 3 +
    movies["overview"]
)

movies["tags"] = movies["tags"].apply(
    lambda x: " ".join(x).lower()
)

print("Generating TF-IDF vectors...")
tfidf = TfidfVectorizer(
    max_features=10000,
    stop_words="english",
    ngram_range=(1, 2)
)

vectors = tfidf.fit_transform(
    movies["tags"]
)

print("Calculating similarity matrix...")
similarity = cosine_similarity(vectors)
scaler = MinMaxScaler()
movies["rating_score"] = scaler.fit_transform(
    movies[["vote_average"]]
)

movies["popularity_score"] = scaler.fit_transform(
    movies[["popularity"]]
)

movies["vote_score"] = scaler.fit_transform(
    movies[["vote_count"]]
)

def recommend(movie_name, top_n=10):

    if movie_name not in movies["title"].values:
        return {
            "success": False,
            "message": f"Movie '{movie_name}' not found."
        }

    movie_index = movies[
        movies["title"] == movie_name
    ].index[0]

    distances = similarity[movie_index]

    recommendations = []

    for idx, similarity_score in enumerate(distances):

        if idx == movie_index:
            continue

        final_score = (
    similarity_score * 0.80 +
    movies.iloc[idx]["rating_score"] * 0.10 +
    movies.iloc[idx]["popularity_score"] * 0.05 +
    movies.iloc[idx]["vote_score"] * 0.05
)

        recommendations.append(
            (
                idx,
                final_score
            )
        )

    recommendations.sort(
        key=lambda x: x[1],
        reverse=True
    )

    recommendations = recommendations[:top_n]

    results = []

    for idx, score in recommendations:

        results.append({
            "movie_id": int(
                movies.iloc[idx]["id"]
            ),
            "score": round(score, 4)
        })

    return {
        "success": True,
        "movie": movie_name,
        "recommendations": results
    }

@app.route("/recommend", methods=["POST"])
def get_recommendations():
    data = request.get_json()
    movie_name = data.get("movie")
    result = recommend(movie_name)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)


# import pickle

# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)

# CORS(
#     app,
#     origins=["http://localhost:5173"],
#     supports_credentials=True
# )


# print("Loading pickle files...")

# movies = pickle.load(
#     open("movies.pkl", "rb")
# )

# similarity = pickle.load(
#     open("similarity.pkl", "rb")
# )

# print(f"Movies Loaded: {len(movies)}")


# def recommend(movie_name, top_n=10):

#     if movie_name not in movies["title"].values:
#         return {
#             "success": False,
#             "message": f"Movie '{movie_name}' not found."
#         }

#     movie_index = movies[
#         movies["title"] == movie_name
#     ].index[0]

#     distances = similarity[movie_index]

#     recommendations = []

#     for idx, similarity_score in enumerate(distances):

#         if idx == movie_index:
#             continue

#         final_score = (
#             similarity_score * 0.80 +
#             movies.iloc[idx]["rating_score"] * 0.10 +
#             movies.iloc[idx]["popularity_score"] * 0.05 +
#             movies.iloc[idx]["vote_score"] * 0.05
#         )

#         recommendations.append(
#             (
#                 idx,
#                 final_score
#             )
#         )

#     recommendations.sort(
#         key=lambda x: x[1],
#         reverse=True
#     )

#     recommendations = recommendations[:top_n]

#     results = []

#     for idx, score in recommendations:

#         results.append(
#             {
#                 "movie_id": int(
#                     movies.iloc[idx]["id"]
#                 ),
#                 "score": round(
#                     score,
#                     4
#                 )
#             }
#         )

#     return {
#         "success": True,
#         "movie": movie_name,
#         "recommendations": results
#     }


# @app.route("/recommend", methods=["POST"])
# def get_recommendations():

#     data = request.get_json()

#     movie_name = data.get("movie")

#     result = recommend(movie_name)

#     return jsonify(result)


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000)