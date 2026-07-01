/** @format */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import "../style/ShowListStyle.css";

function Favourite() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");

      // 🚫 HARD STOP
      if (!token || token === "undefined") {
        setFavorites([]);
        return;
      }

      try {
        const res = await api.get("/api/favorites");
        setFavorites(res.data);
      } catch (err) {
        if (err.response?.status !== 401) {
          // Interceptor handles 500s etc.
        }
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (movieId) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return;

    // Optimistic removal
    const previous = [...favorites];
    setFavorites((prev) =>
      prev.filter((fav) => fav.movieId !== movieId)
    );

    try {
      await api.delete(`/api/favorites/${movieId}`);
      notify.success("Removed from Favorites.");
    } catch (err) {
      // Revert on failure
      setFavorites(previous);
      notify.error("Failed to remove from Favorites.");
    }
  };

  return (
    <div className="showlist-container">
      <br />
      <br />
      <div className="movie_header">
        <h1>Your Favorites ❤️</h1>
        <hr />
      </div>

      <div className="movie-grid">
        {favorites.length === 0 ? (
          <p className="fav_empty">No favorites yet.</p>
        ) : (
          favorites.map((movie) => (
            <div className="movie-card" key={movie.movieId}>
              <img src={movie.img} alt={movie.title} className="movie-img" />

              <div className="movie-info">
                <h3>{movie.title}</h3>

                <p className="movie-rating">
                  ⭐ {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                </p>

                <div className="movie-actions">
                  <Link
                    to={`/detail/${movie.movieId}`}
                    className="details-link"
                  >
                    View Details
                  </Link>

                  <button
                    className="favorite-link"
                    onClick={() => removeFavorite(movie.movieId)}
                    title="Remove from Favorites"
                  >
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Favourite;
