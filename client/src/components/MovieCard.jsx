import { Link } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa6";

const noPoster = "/no_poster_found.png";

function MovieCard({ movie, isFavorite, toggleFavorite }) {
  const fav = isFavorite ? isFavorite(movie._id || movie.id) : false;
  const hasRating = typeof movie.rating === "number" && movie.rating > 0;
  const poster = movie.poster ? movie.poster : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : noPoster);

  return (
    <div className="glass-card hover-lift flex flex-col relative" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
      <Link to={`/detail/${movie._id || movie.id}`} className="relative w-full block" style={{ aspectRatio: '2/3', overflow: 'hidden', display: 'block', position: 'relative' }}>
        <img
          src={poster}
          alt={movie.title ? `${movie.title} poster` : "Movie poster"}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
          draggable={false}
          onError={(e) => {
            e.currentTarget.src = noPoster;
          }}
        />

        {hasRating && (
          <div className="absolute flex items-center gap-1" style={{
            top: '8px', left: '8px',
            background: 'rgba(22, 22, 24, 0.75)', backdropFilter: 'blur(12px)',
            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'absolute'
          }}>
            <FaStar style={{ color: '#F5C518', fontSize: '12px' }} />
            <span className="font-metadata text-on-surface" style={{ fontSize: '12px', fontWeight: 600 }}>
              {movie.rating.toFixed(1)}
            </span>
          </div>
        )}
      </Link>

      {toggleFavorite && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(movie); }}
          className="absolute flex items-center justify-center"
          style={{
            top: '8px', right: '8px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: fav ? 'var(--color-primary-container)' : 'rgba(22, 22, 24, 0.6)',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
            color: fav ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)',
            cursor: 'pointer', zIndex: 10, transition: 'all 0.3s',
            position: 'absolute'
          }}
          title={fav ? "Remove from Favorites" : "Add to Favorites"}
          aria-label={fav ? "Remove from Favorites" : "Add to Favorites"}
        >
          {fav ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
        </button>
      )}

      <div className="flex flex-col gap-1" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="font-body-md text-on-surface" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, margin: 0 }}>
          {movie.title}
        </h3>
        {(movie.year || movie.release_date) && (
          <p className="font-metadata text-on-surface-variant" style={{ margin: 0 }}>
            {movie.year || (movie.release_date ? movie.release_date.split('-')[0] : '')}
          </p>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
