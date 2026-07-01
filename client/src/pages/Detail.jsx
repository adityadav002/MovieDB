/** @format */

import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../style/DetailStyle.css";
import axios from "axios";
import {
  FaImdb,
  FaPlay,
  FaCheck,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaXmark,
} from "react-icons/fa6";

const apikey = import.meta.env.VITE_API_KEY;

function Detail() {
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [watchList, setWatchList] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // ------------------------------------------------
  // WATCHLIST FETCH (SYNC ON PAGE CHANGE)
  // ------------------------------------------------
  useEffect(() => {
    const fetchWatchList = async () => {
      const token = localStorage.getItem("token");

      if (!token || token === "undefined") {
        setWatchList([]);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/watch`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWatchList(res.data);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Error fetching Watch List", err);
        }
      }
    };

    fetchWatchList();
  }, [location.pathname]);

  const isWatched = (movieId) =>
    watchList.some((watch) => String(watch.movieId) === String(movieId));

  const toggleWatch = async (movie) => {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined") {
      alert("Please login to use Watch Later ⏰");
      return;
    }

    const watched = isWatched(movie._id);

    // Optimistic UI update
    setWatchList((prev) => {
      if (watched) {
        return prev.filter((w) => String(w.movieId) !== String(movie._id));
      }

      return [
        ...prev,
        {
          movieId: movie._id,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          img: movie.poster,
        },
      ];
    });

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (watched) {
        await axios.delete(
          `${import.meta.env.VITE_SERVER_URL}/api/watch/${movie._id}`,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/watch`,
          {
            movieId: movie._id,
            title: movie.title,
            year: movie.year,
            rating: movie.rating,
            img: movie.poster,
          },
          config
        );
      }
    } catch (err) {
      console.error("Error updating watch list", err);
    }
  };

  // ------------------------------------------------
  // FETCH FAVORITES
  // ------------------------------------------------
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");

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
          console.error("Error fetching favorites", err);
        }
      }
    };

    fetchFavorites();
  }, [location.pathname]);

  const isFavorite = (movieId) =>
    Array.isArray(favorites) &&
    favorites.some((fav) => String(fav?.movieId) === String(movieId));

  const toggleFavorite = async (movie) => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      alert("Please login to manage favorites ❤️");
      return;
    }

    const isFav = isFavorite(movie._id);

    // Optimistic UI update
    setFavorites((prev) => {
      if (isFav) {
        return prev.filter((fav) => String(fav.movieId) !== String(movie._id));
      } else {
        return [
          ...prev,
          {
            movieId: movie._id,
            title: movie.title,
            year: movie.year,
            rating: movie.rating,
            img: movie.poster,
          },
        ];
      }
    });

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      if (isFav) {
        await axios.delete(
          `${import.meta.env.VITE_SERVER_URL}/api/favorites/${movie._id}`,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/favorites`,
          {
            movieId: movie._id,
            title: movie.title,
            year: movie.year,
            rating: movie.rating,
            img: movie.poster,
          },
          config
        );
      }
    } catch (err) {
      console.error("Favorite update failed", err);
    }
  };

  // ------------------------------------------------
  // FETCH TMDB DETAILS
  // ------------------------------------------------
  useEffect(() => {
    async function fetchDetails() {
      try {
        const detailsRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}&append_to_response=videos,images,credits,external_ids`,
          { withCredentials: false }
        );
        const details = detailsRes.data;
        const imdbID = details.external_ids?.imdb_id;

        console.log("IMDb ID:", imdbID);

        const trailer = details.videos?.results?.find(
          (v) => v.type === "Trailer"
        );

        const director = details.credits?.crew?.find(
          (p) => p.job === "Director"
        );

        const directorData = director
          ? {
              name: director.name,
              image: director.profile_path
                ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
                : "https://via.placeholder.com/185x278?text=No+Image",
            }
          : null;

        const cast = details.credits?.cast?.slice(0, 10) || [];

        const screenshots =
          details.images?.backdrops
            ?.sort(() => 0.5 - Math.random())
            .slice(0, 4)
            .map((img) => `https://image.tmdb.org/t/p/w500${img.file_path}`) ||
          [];

        setMovie({
          _id: details.id,
          title: details.title,
          rating: details.vote_average,
          release_date: details.release_date,
          duration: details.runtime ? `${details.runtime} min` : "N/A",
          genres: details.genres.map((g) => g.name),
          overview: details.overview,
          poster: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
          backdrop: `https://image.tmdb.org/t/p/original${details.backdrop_path}`,
          language: details.original_language,
          director: directorData,
          cast,
          imdbID,
          trailer_url: trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : null,
          screenshots,
        });
      } catch (err) {
        console.error("TMDB detail fetch failed:", err);
      }
    }

    fetchDetails();
  }, [id]);

  if (!movie)
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "—";

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  return (
    <div className="detail-container">
      <section
        className="detail-hero"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        {movie.trailer_url && (
          <button
            className="hero-play-btn"
            onClick={() => setShowTrailer(true)}
            aria-label="Play trailer"
          >
            <FaPlay />
          </button>
        )}

        <div className="detail-content">
          <div className="hero-grid">
            <div className="poster-wrapper">
              <img
                src={movie.poster}
                alt={movie.title}
                className="poster-img"
              />
            </div>

            <div className="hero-info">
              <p className="hero-eyebrow">
                Movie · {releaseYear} · {movie.duration}
              </p>

              <h1>{movie.title}</h1>

              <div className="meta-tags">
                <span className="meta-tag fullhd">FULL HD</span>
                <span className="meta-tag">
                  {movie.rating.toFixed(1)}
                  <FaImdb className="meta_logo" />
                </span>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Directed By</span>
                  <span className="info-value">
                    {movie.director ? movie.director.name : "Unknown"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Language</span>
                  <span className="info-value">
                    {movie.language ? movie.language.toUpperCase() : "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Release Date</span>
                  <span className="info-value">
                    {movie.release_date || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration</span>
                  <span className="info-value">{movie.duration}</span>
                </div>
              </div>

              {movie.genres.length > 0 && (
                <div className="genre-tags">
                  {movie.genres.map((genre, index) => (
                    <span className="genre-tag" key={index}>
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showTrailer && (
        <div
          className="trailer-modal-overlay"
          onClick={() => setShowTrailer(false)}
        >
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="trailer-close-btn"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
            >
              <FaXmark />
            </button>

            <div className="trailer-video-wrapper">
              <iframe
                src={movie.trailer_url.replace("watch?v=", "embed/")}
                title="Movie Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="action-buttons">
        <button
          className="action-btn primary-btn"
          onClick={() => {
            if (!movie.imdbID) {
              alert("IMDb ID not found");
              return;
            }
            window.open(
              `https://streamimdb.ru/embed/movie/${movie.imdbID}`,
              "_blank"
            );
          }}
        >
          <span className="btn-icon">
            <FaPlay />
          </span>
          <span className="btn-text">Watch Now</span>
        </button>

        <button
          className={`action-btn watchlist-btn ${
            isWatched(movie._id) ? "active" : ""
          }`}
          onClick={() => toggleWatch(movie)}
        >
          <span className="btn-icon">
            {isWatched(movie._id) ? <FaCheck /> : <FaPlus />}
          </span>
          <span className="btn-text">
            {isWatched(movie._id) ? "In Watchlist" : "Add to Watchlist"}
          </span>
        </button>

        <button
          className={`action-btn favorite-btn ${
            isFavorite(movie._id) ? "active" : ""
          }`}
          onClick={() => toggleFavorite(movie)}
        >
          <span className="btn-icon">
            {isFavorite(movie._id) ? <FaHeart /> : <FaRegHeart />}
          </span>
          <span className="btn-text">
            {isFavorite(movie._id) ? "In Favorites" : "Add to Favorites"}
          </span>
        </button>
      </div>

      {/* OVERVIEW */}
      <div className="detail-description">
        <div className="section-block">
          <h2>Overview</h2>
          <p>{movie.overview}</p>
        </div>

        {/* SCREENSHOTS */}
        {movie.screenshots.length > 0 && (
          <div className="section-block">
            <h2>Screenshots</h2>
            <div className="screenshot">
              {movie.screenshots.map((src, index) => (
                <span key={index}>
                  <img src={src} alt={`Screenshot ${index + 1}`} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CAST */}
        {movie.cast.length > 0 && (
          <div className="section-block">
            <h2>Main Cast</h2>
            <div className="cast-grid">
              {movie.cast.map((actor, index) => {
                const img = actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : "https://via.placeholder.com/185x278?text=No+Image";

                return (
                  <div className="cast-card" key={index}>
                    <div className="cast-img-wrapper">
                      <img src={img} alt={actor.name} className="cast-img" />

                      <div className="cast-overlay">
                        <p className="cast-character-text">
                          {actor.character ? `as ${actor.character}` : ""}
                        </p>
                      </div>
                    </div>

                    <h4 className="cast-name">{actor.name}</h4>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DIRECTOR */}
        {movie.director && (
          <div className="section-block">
            <h2>Director</h2>
            <div className="cast-grid director-grid">
              <div className="cast-card">
                <div className="cast-img-wrapper">
                  <img
                    src={movie.director.image}
                    alt={movie.director.name}
                    className="cast-img"
                  />
                </div>
                <h4 className="cast-name">{movie.director.name}</h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Detail;