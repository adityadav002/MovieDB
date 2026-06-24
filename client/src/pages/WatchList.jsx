/** @format */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../style/ShowListStyle.css";
import { MdWatchLater } from "react-icons/md";

function WatchLater() {
  const [watchLaterList, setWatchLaterList] = useState([]);
  const location = useLocation();

  // -----------------------------------------
  // FETCH WATCH LATER LIST
  // -----------------------------------------
  useEffect(() => {
    const fetchWatchLater = async () => {
      const token = localStorage.getItem("token");

      // HARD STOP
      if (!token || token === "undefined") {
        setWatchLaterList([]);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/watch`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWatchLaterList(res.data);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Failed to fetch watch later list", err);
        }
      }
    };

    fetchWatchLater();
  }, [location.pathname]);

  // -----------------------------------------
  // REMOVE FROM WATCH LATER
  // -----------------------------------------
  const removeFromWatchLater = async (movieId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/watch/${movieId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setWatchLaterList((prev) =>
        prev.filter(
          (movie) => String(movie.movieId) !== String(movieId)
        )
      );
    } catch (err) {
      console.error("Failed to remove from Watch Later", err);
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
          <p className="fav_empty">No movies in Watch Later.</p>
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
