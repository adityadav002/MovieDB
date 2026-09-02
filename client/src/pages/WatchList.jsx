import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import "../style/ShowListStyle.css"; 
import { useAuth } from "../context/AuthContext";
import { FaClock, FaStar, FaTrash } from "react-icons/fa";

const noPoster = "/no_poster_found.png";

function WatchLater() {
  const { user } = useAuth();
  const [watchLaterList, setWatchLaterList] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchWatchLater = async () => {
      if (!user) {
        setWatchLaterList([]);
        return;
      }
      try {
        const res = await api.get("/api/watch");
        setWatchLaterList(res.data);
      } catch (err) {}
    };
    fetchWatchLater();
  }, [location.pathname, user]);

  const removeFromWatchLater = async (movie, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) return;
    const movieId = movie.movieId;

    const previous = [...watchLaterList];
    setWatchLaterList((prev) => prev.filter((m) => String(m.movieId) !== String(movieId)));

    try {
      await api.delete(`/api/watch/${movieId}`);
      notify.success("Removed from Watchlist.");
    } catch (err) {
      setWatchLaterList(previous);
      notify.error("Failed to remove from Watchlist.");
    }
  };

  return (
    <div className="discover-page">
      <div className="discover-container" style={{ display: 'block', padding: '2rem 1.5rem', maxWidth: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <FaClock size={32} color="var(--color-primary)" />
          <h1 className="font-headline-lg text-headline-lg text-on-surface" style={{ margin: 0 }}>Watchlist</h1>
        </div>

        {watchLaterList.length === 0 ? (
          <div className="loader-container" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '4rem 2rem', textAlign: 'center' }}>
            <FaClock size={48} color="var(--color-on-surface-variant)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h2 className="font-headline-md text-on-surface" style={{ marginBottom: '0.5rem' }}>Your Watchlist is Empty</h2>
            <p className="text-on-surface-variant" style={{ marginBottom: '2rem' }}>Movies you want to watch later will appear here.</p>
            <Link to="/home" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: 'var(--radius-sm)' }}>
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="movie-grid">
            {watchLaterList.map((movie) => {
              const hasRating = typeof movie.rating === "number" && movie.rating > 0;
              return (
                <div key={movie.movieId} className="glass-card hover-lift flex flex-col relative" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                  <Link to={`/detail/${movie.movieId}`} className="relative w-full block" style={{ aspectRatio: '2/3', overflow: 'hidden', display: 'block', position: 'relative' }}>
                    <img
                      src={movie.img || noPoster}
                      alt={movie.title}
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

                  <button
                    onClick={(e) => removeFromWatchLater(movie, e)}
                    className="absolute flex items-center justify-center"
                    style={{
                      top: '8px', right: '8px',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(229, 9, 20, 0.2)',
                      backdropFilter: 'blur(8px)', border: '1px solid rgba(229, 9, 20, 0.5)',
                      color: 'var(--color-primary)',
                      cursor: 'pointer', zIndex: 10, transition: 'all 0.3s',
                      position: 'absolute'
                    }}
                    title="Remove from Watchlist"
                    aria-label="Remove from Watchlist"
                  >
                    <FaTrash size={12} />
                  </button>

                  <div className="flex flex-col gap-1" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="font-body-md text-on-surface" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, margin: 0 }}>
                      {movie.title}
                    </h3>
                    {movie.year && (
                      <p className="font-metadata text-on-surface-variant" style={{ margin: 0 }}>
                        {movie.year}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchLater;
