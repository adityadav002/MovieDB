import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const apikey = import.meta.env.VITE_API_KEY;

function Recommendations() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchMovies = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setMovies([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${value}`,
      );

      const data = await res.json();
      setMovies(data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getRecommendations = async (movieTitle) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://127.0.0.1:5000/recommend", {
        movie: movieTitle,
      });

      if (!response.data.success) {
        setRecommendations([]);
        setError(response.data.message);
        return;
      }

      const recommendationData = response.data.recommendations;

      const moviesWithDetails = await Promise.all(
        recommendationData.map(async (movie) => {
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.movie_id}?api_key=${apikey}`,
          );

          const tmdbMovie = await tmdbResponse.json();

          return {
            _id: tmdbMovie.id,
            title: tmdbMovie.title,
            poster: tmdbMovie.poster_path
              ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Image",
            rating: tmdbMovie.vote_average,
            release_date: tmdbMovie.release_date,
            score: movie.score,
          };
        }),
      );

      setRecommendations(moviesWithDetails);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <br />
      <br />
      <br />

      <h1>🎬 Movie Recommendation System</h1>

      <input
        type="text"
        placeholder="Search movie..."
        value={query}
        onChange={searchMovies}
        style={{
          padding: "10px",
          width: "400px",
          marginBottom: "20px",
        }}
      />

      {/* SEARCH RESULTS */}
      {movies.length > 0 && (
        <>
          <h2>Search Results</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => getRecommendations(movie.title)}
                style={{
                  cursor: "pointer",
                  border: "1px solid #ddd",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/300x450"
                  }
                  alt={movie.title}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                  }}
                />

                <h4>{movie.title}</h4>
              </div>
            ))}
          </div>
        </>
      )}

      <hr style={{ margin: "40px 0" }} />
      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <>
          <h2>Recommended Movies</h2>
          <div className="movie-grid">
            {recommendations.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img src={movie.poster} alt={movie.title} />

                <div className="movie-info">
                  <h3>{movie.title}</h3>

                  <p className="movie-rating">⭐ {movie.rating?.toFixed(1)}</p>

                  {movie.release_date && (
                    <p>{movie.release_date.slice(0, 4)}</p>
                  )}
                  <div className="movie-actions">
                    <Link to={`/detail/${movie._id}`} className="details-link">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Recommendations;
