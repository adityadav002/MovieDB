/** @format */
import { Link } from "react-router-dom";

function MovieCard({ movie, isFavorite, toggleFavorite }) {
  const fav = isFavorite(movie._id);

  return (
    <div className="movie-card">
      <img src={movie.poster} alt={movie.title} className="movie-img" />

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="movie-rating">⭐ {movie.rating?.toFixed(1)}</p>

        <div className="movie-actions">
          <Link to={`/detail/${movie._id}`} className="details-link">
            View Details
          </Link>

          <button
            className={`favorite-link ${fav ? "active" : ""}`}
            onClick={() => toggleFavorite(movie)}
            title={fav ? "Remove from Favorites" : "Add to Favorites"}
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
