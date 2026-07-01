/** @format */
import { Link } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa6";

function MovieCard({ movie, isFavorite, toggleFavorite }) {
  const fav = isFavorite(movie._id);
  const hasRating = typeof movie.rating === "number" && movie.rating > 0;

  return (
    <div className="movie-card">
      <Link to={`/detail/${movie._id}`} className="movie-poster-wrapper">
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-img"
          loading="lazy"
        />

        {hasRating && (
          <span className="movie-rating-badge">
            <FaStar /> {movie.rating.toFixed(1)}
          </span>
        )}

        <span className="movie-hover-overlay">
          <span className="details-link">View Details</span>
        </span>
      </Link>

      <button
        className={`favorite-link ${fav ? "active" : ""}`}
        onClick={() => toggleFavorite(movie)}
        title={fav ? "Remove from Favorites" : "Add to Favorites"}
        aria-label={fav ? "Remove from Favorites" : "Add to Favorites"}
      >
        {fav ? <FaHeart /> : <FaRegHeart />}
      </button>

      <div className="movie-info">
        <h3>{movie.title}</h3>
        {movie.year && <p className="movie-year">{movie.year}</p>}
      </div>
    </div>
  );
}

export default MovieCard;