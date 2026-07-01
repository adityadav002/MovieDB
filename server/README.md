# Movie Recommendation System — Backend (Flask)

A production-ready, content-based movie recommendation microservice. It uses TF-IDF vectorization and dynamic cosine similarity to serve instant recommendations without ever storing a massive NxN similarity matrix.

---

## Architecture Overview

```
server/
├── app.py                   # Flask application and API routes
├── recommendation_engine.py # Dynamic cosine similarity engine
├── preprocessing.py         # Dataset cleaning, feature engineering, TF-IDF
├── cache_manager.py         # Smart cache validation, generation, and loading
├── utils.py                 # SHA-256 hashing utilities
├── requirements.txt         # Python dependencies
├── Procfile                 # Render / Heroku start command
├── .gitignore               # Excludes cache/ and ML artifacts
├── tmdb_5000_movies.csv     # Source dataset (movies)
├── tmdb_5000_credits.csv    # Source dataset (credits)
└── cache/                   # Auto-generated, never committed to Git
    ├── movies_processed.joblib
    ├── feature_matrix.joblib
    ├── movie_index.joblib
    ├── vectorizer.joblib
    └── metadata.json
```

---

## How It Works

### Recommendation Flow

1. A POST request arrives at `/recommend` with a movie title.
2. The engine looks up the movie's index in a prebuilt dictionary (O(1)).
3. It extracts the movie's TF-IDF vector from the sparse feature matrix.
4. It computes `cosine_similarity(target_vector, full_matrix)` — a 1×N operation that takes **~2ms** for ~4800 movies.
5. Franchise boost and adaptive weighting are applied.
6. Top-N results are returned as JSON.

**Key insight**: The old system stored the full NxN cosine similarity matrix (~119 MB). The new system stores only the sparse TF-IDF feature matrix (~2 MB) and computes similarity on-the-fly in milliseconds.

### Automatic Cache Generation

On every startup, the `CacheManager` runs the following logic:

```
Start Application
      ↓
  Check cache/
      ↓
  Cache valid? (files exist + SHA-256 hash of CSVs matches metadata.json)
     /     \
   YES      NO
    ↓        ↓
Load cache  Run preprocessing pipeline
    ↓        ↓
            Save sparse matrix, movie index, vectorizer, metadata
             ↓
           Load cache
    ↓        ↓
  Start API server
```

### Cache Validation

The cache is validated using:
- **File existence**: All required `.joblib` files and `metadata.json` must exist in `cache/`.
- **SHA-256 hash**: A combined hash of `tmdb_5000_movies.csv` and `tmdb_5000_credits.csv` is compared against the hash stored in `metadata.json`.
- **Cache version**: A version string in `metadata.json` is checked. Bumping `CACHE_VERSION` in `cache_manager.py` forces regeneration.

If any check fails, the cache is regenerated automatically.

### Cache Regeneration Triggers

The cache regenerates when:
- The `cache/` directory is missing or empty.
- Any required artifact file is missing.
- `tmdb_5000_movies.csv` or `tmdb_5000_credits.csv` is modified (hash mismatch).
- `CACHE_VERSION` is bumped in `cache_manager.py`.
- `metadata.json` is corrupted or unreadable.

---

## Installation & Local Development

### Prerequisites
- Python 3.9+
- pip

### Setup

```bash
cd server

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate          # macOS/Linux
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

On the **first run**, the cache will be generated automatically (takes ~10–15 seconds). Subsequent starts load the cache instantly.

The server runs on `http://localhost:5000` by default.

---

## API Endpoints

### `POST /recommend`

Get movie recommendations.

**Request body:**
```json
{
  "movie": "The Dark Knight"
}
```

**Response (200):**
```json
{
  "success": true,
  "movie": "The Dark Knight",
  "recommendations": [
    { "movie_id": 155, "score": 0.8523 },
    { "movie_id": 49026, "score": 0.7891 }
  ]
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Movie 'Unknown Movie' not found."
}
```

### `GET /health`

Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "engine_ready": true
}
```

---

## Deploying on Render

1. Push your repository to GitHub. The `cache/` directory is in `.gitignore` — only source code and CSVs are pushed.
2. Create a new **Web Service** on Render.
3. Set the **Root Directory** to `server`.
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `gunicorn app:app` (or use the existing `Procfile`).

When Render starts, the backend will detect the missing cache and build it automatically before serving any requests. No manual preprocessing step is needed.

---

## Updating the Dataset

1. Replace `tmdb_5000_movies.csv` and/or `tmdb_5000_credits.csv` with updated versions.
2. Restart the server.
3. The `CacheManager` will detect the file hash change and regenerate the cache automatically.

Alternatively, delete the `cache/` directory and restart.

---

## Storage Comparison

| Artifact | Old System | New System |
|---|---|---|
| `similarity.joblib` (NxN matrix) | ~119 MB | **Not generated** |
| `feature_matrix.joblib` (sparse TF-IDF) | N/A | ~2 MB |
| `movies_processed.joblib` | ~0.5 MB | ~0.5 MB |
| `movie_index.joblib` | N/A | ~0.1 MB |
| `vectorizer.joblib` | N/A | ~0.3 MB |
| **Total** | **~120 MB** | **~3 MB** |

**Storage reduction: ~97%**
