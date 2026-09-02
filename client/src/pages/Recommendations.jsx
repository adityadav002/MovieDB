import { useState, useEffect } from "react";
import axios from "axios";
import notify from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import MovieCard from "../components/MovieCard";
import { FaSearch, FaTimes, FaExclamationCircle, FaVideo } from "react-icons/fa";

import "../style/ShowListStyle.css";
import "../style/Recommendations.css";

const flaskUrl = import.meta.env.VITE_FLASK_URL;
const apikey = import.meta.env.VITE_API_KEY;

function Recommendations() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const res = await api.get("/api/favorites");
        setFavorites(res.data);
      } catch (err) {}
    };
    fetchFavorites();
  }, [user]);

  const isFavorite = (movieId) => favorites.some((fav) => String(fav.movieId) === String(movieId));

  const toggleFavorite = async (movie) => {
    if (!user) {
      notify.warning("Please login to add to Favorites.");
      return;
    }
    const isFav = isFavorite(movie._id);
    setFavorites((prev) => {
      if (isFav) return prev.filter((fav) => String(fav.movieId) !== String(movie._id));
      return [...prev, { movieId: movie._id }];
    });

    try {
      if (isFav) {
        await api.delete(`/api/favorites/${movie._id}`);
        notify.success("Removed from Favorites.");
      } else {
        await api.post("/api/favorites", {
          movieId: movie._id, title: movie.title, year: movie.year, rating: movie.rating, img: movie.poster,
        });
        notify.success("Added to Favorites ❤️");
      }
    } catch (err) {
      if (isFav) setFavorites((prev) => [...prev, { movieId: movie._id }]);
      else setFavorites((prev) => prev.filter((fav) => String(fav.movieId) !== String(movie._id)));
    }
  };

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
    } catch (err) {}
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
        setError(response.data.message || "Failed to find recommendations.");
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
            id: tmdbMovie.id,
            title: tmdbMovie.title,
            poster: tmdbMovie.poster_path
              ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
              : "/no_poster_found.png",
            rating: tmdbMovie.vote_average,
            year: tmdbMovie.release_date ? tmdbMovie.release_date.substring(0, 4) : "Unknown",
            score: movie.score,
          };
        })
      );

      setRecommendations(moviesWithDetails);
      if (moviesWithDetails.length > 0) notify.success("Recommendations loaded!");
    } catch (err) {
      setError("Failed to fetch recommendations. Is the ML backend running?");
      notify.error("Unable to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discover-page">
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

      <main className="rec-main-container">
        
        {error && (
          <div className="rec-error-state">
            <FaExclamationCircle className="rec-error-icon" />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {!query && !selectedMovie && movies.length === 0 && (
          <div className="rec-empty-state">
            <div className="rec-empty-icon">🍿</div>
            <p className="rec-empty-text">
              Search for a movie above to discover personalized recommendations.
            </p>
          </div>
        )}

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
                          : "/no_poster_found.png"
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

        {selectedMovie && (
          <h2 className="rec-section-title" style={{ marginTop: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px" }}>
            Recommended for <span style={{ color: "var(--color-primary)", marginLeft: "8px" }}>🎬 {selectedMovie}</span>
          </h2>
        )}

        {loading && (
          <div className="rec-skeleton-grid" style={{ marginTop: "30px" }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rec-skeleton-card"></div>
            ))}
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div className="movie-grid" style={{ marginTop: "30px" }}>
            {recommendations.map((movie) => (
              <MovieCard 
                key={movie._id} 
                movie={movie} 
                isFavorite={isFavorite} 
                toggleFavorite={toggleFavorite} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Recommendations;
