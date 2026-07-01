import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import notify from "../utils/toast";
import { FaSearch, FaTimes, FaExclamationCircle } from "react-icons/fa";

import "../style/ShowListStyle.css";
import "../style/Recommendations.css";

const flaskUrl = import.meta.env.VITE_FLASK_URL;
const apikey = import.meta.env.VITE_API_KEY;

function Recommendations() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchSearchData(query);
      } else {
        setMovies([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSearchData = async (searchQuery) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${searchQuery}`
      );
      const data = await res.json();
      setMovies(data.results || []);
    } catch (err) {
      // Silent — autocomplete search shouldn't spam toasts
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setMovies([]);
    setRecommendations([]);
    setSelectedMovie(null);
    setError("");
  };

  const getRecommendations = async (movieTitle) => {
    try {
      setLoading(true);
      setError("");
      setRecommendations([]);
      setSelectedMovie(movieTitle);

      const response = await axios.post(`${flaskUrl}/recommend`, {
        movie: movieTitle,
      });

      if (!response.data.success) {
        setRecommendations([]);
        const errMsg = response.data.message || "Failed to find recommendations for this movie.";
        setError(errMsg);
        notify.info("No recommendations available for this movie.");
        return;
      }

      const recommendationData = response.data.recommendations;

      const moviesWithDetails = await Promise.all(
        recommendationData.map(async (movie) => {
          const tmdbResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.movie_id}?api_key=${apikey}`
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
        })
      );

      setRecommendations(moviesWithDetails);

      if (moviesWithDetails.length > 0) {
        notify.success("Recommendations loaded!");
      } else {
        notify.info("No recommendations available for this movie.");
      }
    } catch (err) {
      setError("Failed to fetch recommendations. Please ensure the backend is running.");
      notify.error("Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      {/* 🎬 HERO & SEARCH SECTION */}
      <section className="rec-hero-section">
        <h1 className="rec-hero-title">Discover Your Next Favorite</h1>
        <p className="rec-hero-subtitle">
          Search from thousands of movies and instantly receive AI-powered recommendations tailored to your taste.
        </p>

        <div className="rec-search-wrapper">
          <FaSearch className="rec-search-icon" />
          <input
            type="text"
            className="rec-search-input"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="rec-search-clear" onClick={handleClearSearch} title="Clear search">
              <FaTimes />
            </button>
          )}
        </div>
      </section>

      {/* 🎬 MAIN CONTENT AREA */}
      <main className="rec-main-container">

        {/* Error State */}
        {error && (
          <div className="rec-error-state">
            <FaExclamationCircle className="rec-error-icon" />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!query && !selectedMovie && movies.length === 0 && (
          <div className="rec-empty-state">
            <div className="rec-empty-icon">🎬</div>
            <p className="rec-empty-text">
              Search for a movie above to discover personalized recommendations.
            </p>
          </div>
        )}

        {/* Search Results (Hide if a movie is selected to focus on recommendations) */}
        {query && movies.length > 0 && !selectedMovie && (
          <div className="rec-search-results">
            <h2 className="rec-section-title">Select a Movie</h2>
            <div className="rec-results-grid">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="rec-result-card"
                  onClick={() => getRecommendations(movie.title)}
                >
                  <div className="rec-result-poster-wrapper">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={movie.title}
                      className="rec-result-poster"
                    />
                    <div className="rec-result-overlay">
                      <span>Click for</span>
                      <span>Recommendations</span>
                    </div>
                  </div>
                  <div className="rec-result-info">
                    <h3 className="rec-result-title">{movie.title}</h3>
                    <div className="rec-result-meta">
                      <span>{movie.release_date ? movie.release_date.substring(0, 4) : "N/A"}</span>
                      <span className="rec-result-rating">⭐ {movie.vote_average?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Context Header */}
        {selectedMovie && (
          <h2 className="rec-section-title" style={{ marginTop: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
            Recommended for <span style={{ color: "#e50914", marginLeft: "8px" }}>🎬 {selectedMovie}</span>
          </h2>
        )}

        {/* Loading State (Skeleton) */}
        {loading && (
          <div className="rec-skeleton-grid" style={{ marginTop: "30px" }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rec-skeleton-card"></div>
            ))}
          </div>
        )}

        {/* Recommendations Grid (Reusing existing ShowList classes) */}
        {!loading && recommendations.length > 0 && (
          <div className="movie-grid" style={{ marginTop: "30px" }}>
            {recommendations.map((movie) => (
              <div key={movie._id} className="movie-card">
                <div className="movie-poster-wrapper">
                  <img src={movie.poster} alt={movie.title} className="movie-img" />
                  <div className="movie-rating-badge">⭐ {movie.rating?.toFixed(1)}</div>
                  <div className="movie-hover-overlay">
                    <Link to={`/detail/${movie._id}`} className="details-link">
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-year">{movie.release_date ? movie.release_date.slice(0, 4) : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Recommendations;
