/** @format */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavorites(res.data);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Failed to fetch favorites", err);
        }
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (movieId) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/favorites/${movieId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFavorites((prev) =>
        prev.filter((fav) => fav.movieId !== movieId)
      );
    } catch (err) {
      console.error("Error removing favorite", err);
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
