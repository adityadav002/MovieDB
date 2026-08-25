/** @format */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import "../style/ShowListStyle.css";
import { MdWatchLater } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

function WatchLater() {
  const { user } = useAuth();
  const [watchLaterList, setWatchLaterList] = useState([]);
  const location = useLocation();

  // -----------------------------------------
  // FETCH WATCH LATER LIST
  // -----------------------------------------
  useEffect(() => {
    const fetchWatchLater = async () => {
      if (!user) return;
      
      try {
        const res = await api.get("/api/watch");
        setWatchLaterList(res.data);
      } catch (err) {
        if (err.response?.status !== 401) {
          // Interceptor handles 500s etc.
        }
      }
    };

    fetchWatchLater();
  }, [location.pathname]);

  // -----------------------------------------
  // REMOVE FROM WATCH LATER
  // -----------------------------------------
  const removeFromWatchLater = async (movieId) => {
    if (!user) return notify.error("Please login first");
    
    // Optimistic removal
    const previous = [...watchLaterList];
    setWatchLaterList((prev) =>
      prev.filter(
        (movie) => String(movie.movieId) !== String(movieId)
      )
    );

    try {
      await api.delete(`/api/watch/${movieId}`);
      notify.success("Removed from Watchlist.");
    } catch (err) {
      // Revert on failure
      setWatchLaterList(previous);
      notify.error("Failed to remove from Watchlist.");
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="showlist-container">
      <br />
      <br />
      <div className="movie_header">
        <h1>Watch Later ⏰</h1>
        <hr />
      </div>

      <div className="movie-grid">
        {watchLaterList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h2>Your Watchlist is Empty</h2>
            <p>Movies you want to watch later will appear here.</p>
            <Link to="/" className="submit-button" style={{display:'inline-block', marginTop:'1rem', padding:'0.5rem 1rem'}}>Explore Movies</Link>
          </div>
        ) : (
          watchLaterList.map((movie) => (
            <div className="movie-card" key={movie.movieId}>
              <img
                src={movie.img}
                alt={movie.title}
                className="movie-img"
              />

              <div className="movie-info">
                <h3>{movie.title}</h3>

                <div className="movie-actions">
                  <Link
                    to={`/detail/${movie.movieId}`}
                    className="details-link"
                  >
                    View Details
                  </Link>

                  {/* REMOVE BUTTON */}
                  <button
                    className="favorite-link active"
                    onClick={() => removeFromWatchLater(movie.movieId)}
                    title="Remove from Watch Later"
                  >
                    <MdWatchLater />
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

export default WatchLater;
