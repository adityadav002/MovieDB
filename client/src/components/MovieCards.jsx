import { memo } from "react";
import { Link } from "react-router-dom";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const noPoster = "/no_poster_found.png";

const MovieCards = ({ movie }) => {
  const poster = movie.poster_path
    ? IMAGE_BASE + movie.poster_path
    : movie.poster || noPoster;

  return (
    <Link to={`/detail/${movie.id || movie._id}`} className="img_similar">
      <img
        src={poster}
        alt={`${movie.title} poster`}
        className="cast-img"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = "/no_actor_found.png";
        }}
      />

      <h4>{movie.title}</h4>
    </Link>
  );
};

export default memo(MovieCards);
