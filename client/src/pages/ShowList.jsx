/** @format */
import axios from "axios";
axios.defaults.withCredentials = false;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../style/ShowListStyle.css";
import Slider from "../components/Slider";
import MovieCard from "../components/MovieCard";
import {
  FaClapperboard,
  FaPalette,
  FaExplosion,
  FaMasksTheater,
  FaFaceLaughBeam,
  FaGhost,
  FaChevronDown,
} from "react-icons/fa6";

const apikey = import.meta.env.VITE_API_KEY;

function ShowList() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q") || "";

  const [movies, setMovies] = useState([]);
  const [animated, setAnimated] = useState([]);
  const [action, setAction] = useState([]);
  const [drama, setDrama] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [horror, setHorror] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [favorites, setFavorites] = useState([]);

  // -----------------------------------------
  // MAP TMDB MOVIE => YOUR UI MOVIE FORMAT
  // -----------------------------------------
  const mapMovie = (m) => ({
    _id: m.id,
    title: m.title,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image",
    year: m.release_date?.slice(0, 4),
    rating: m.vote_average,
  });

  // -----------------------------------------
  // FETCH MAIN MOVIES (SEARCH or POPULAR)
  // -----------------------------------------
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);

      try {
        const url = searchQuery
          ? `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${searchQuery}&page=${page}`
          : `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&page=${page}`;

        const res = await axios.get(url, { withCredentials: false });
        const formatted = res.data.results.map(mapMovie);

        if (formatted.length < 20) setHasMore(false);

        setMovies((prev) => (page === 1 ? formatted : [...prev, ...formatted]));
      } catch (err) {
        console.error("Error fetching movies:", err);
      }

      setLoading(false);
    };

    fetchMovies();
  }, [searchQuery, page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // -----------------------------------------
  // FAVORITES SYSTEM
  // -----------------------------------------
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");

      // ✅ HARD STOP (IMPORTANT)
      if (!token || token === "undefined") {
        setFavorites([]); // keep UI safe
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setFavorites(res.data);
      } catch (err) {
        // ❌ DO NOT log 401 repeatedly
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

    // ✅ OPTIMISTIC UI UPDATE (INSTANT)
    setFavorites((prev) => {
      if (isFav) {
        // 🔥 FIXED REMOVAL
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
          config,
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
          config,
        );
      }
    } catch (err) {
      console.error("Favorite update failed", err);
    }
  };

  // -----------------------------------------
  // FETCH GENRES FROM TMDB
  // -----------------------------------------
  const fetchGenre = async (genreId, setter) => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_genres=${genreId}`,
        { withCredentials: false },
      );

      setter(res.data.results.map(mapMovie));
    } catch (err) {
      console.error("Error fetching genre:", err);
    }
  };

  useEffect(() => {
    fetchGenre(16, setAnimated); // Animated
    fetchGenre(28, setAction); // Action
    fetchGenre(18, setDrama); // Drama
    fetchGenre(35, setComedy); // Comedy
    fetchGenre(27, setHorror); // Horror
  }, []);

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <>
      <Slider />

      <div className="showlist-container">
        {/* Main Search + Popular Movies */}
        <div className="movie_header" id="bookmark">
          <div className="section-header">
            <span className="section-icon">
              <FaClapperboard />
            </span>
            <h2>{searchQuery ? `Results for "${searchQuery}"` : "Movies"}</h2>
          </div>
          <hr />
        </div>

        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {loading && (
          <div className="loading-row">
            <span className="loading-spinner-small" />
            <p>Loading...</p>
          </div>
        )}

        {!loading && movies.length === 0 && (
          <p className="no-results">
            No movies found{searchQuery ? ` for “${searchQuery}”` : ""}.
          </p>
        )}

        {!loading && hasMore && movies.length > 0 && (
          <button onClick={handleLoadMore} className="load-more-btn">
            Watch More <FaChevronDown />
          </button>
        )}

        {/* -------- Animated Movies -------- */}
        <div className="movie_header">
          <div className="section-header">
            <span className="section-icon">
              <FaPalette />
            </span>
            <h2>Animated Movies</h2>
          </div>
          <hr />
        </div>

        <div className="movie-row">
          {animated.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* -------- Action Movies -------- */}
        <div className="movie_header">
          <div className="section-header">
            <span className="section-icon">
              <FaExplosion />
            </span>
            <h2>Action Movies</h2>
          </div>
          <hr />
        </div>

        <div className="movie-row">
          {action.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* -------- Drama Movies -------- */}
        <div className="movie_header">
          <div className="section-header">
            <span className="section-icon">
              <FaMasksTheater />
            </span>
            <h2>Drama Movies</h2>
          </div>
          <hr />
        </div>

        <div className="movie-row">
          {drama.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* -------- Comedy Movies -------- */}
        <div className="movie_header">
          <div className="section-header">
            <span className="section-icon">
              <FaFaceLaughBeam />
            </span>
            <h2>Comedy Movies</h2>
          </div>
          <hr />
        </div>

        <div className="movie-row">
          {comedy.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* -------- Horror Movies -------- */}
        <div className="movie_header">
          <div className="section-header">
            <span className="section-icon">
              <FaGhost />
            </span>
            <h2>Horror Movies</h2>
          </div>
          <hr />
        </div>

        <div className="movie-row">
          {horror.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default ShowList;