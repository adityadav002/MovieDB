import { Link } from "react-router-dom";

const MovieCards = ({ movie }) => {
  const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

  return (
    <Link to={`/detail/${movie.id}`} className="img_similar">
      <img
        src={
          movie.poster_path
            ? IMAGE_BASE + movie.poster_path
            : "/no-poster.png"
        }
        alt={movie.title}
      />
      <h4>{movie.title}</h4>
    </Link>
  );
};

export default MovieCards;
