import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { FaChevronDown, FaSearch, FaVolumeUp, FaPalette, FaFire, FaChartLine, FaHeart, FaStar, FaClock, FaTheaterMasks, FaGhost, FaRocket, FaUsers, FaSmile } from "react-icons/fa";
import { MdLocalMovies } from "react-icons/md";
import "../style/ShowListStyle.css";
import MovieCard from "../components/MovieCard";
import api from "../utils/api";
import notify from "../utils/toast";
import { universalSearch } from "../services/tmdbSearch";
import { useAuth } from "../context/AuthContext";

const apikey = import.meta.env.VITE_API_KEY;

function ShowList() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q") || "";

  const { user } = useAuth();

  const [movies, setMovies] = useState([]);
  const [animated, setAnimated] = useState([]);
  const [action, setAction] = useState([]);
  const [drama, setDrama] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [horror, setHorror] = useState([]);
  const [romance, setRomance] = useState([]);
  const [sciFi, setSciFi] = useState([]);
  const [family, setFamily] = useState([]);
  
  // Sidebar data
  const [popular, setPopular] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isActorSearch, setIsActorSearch] = useState(false);
  const [actorName, setActorName] = useState("");

  const [favorites, setFavorites] = useState([]);
  const [watchList, setWatchList] = useState([]);

  const mapMovie = (m) => ({
    _id: m.id,
    id: m.id,
    title: m.title,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "/no_poster_found.png",
    year: m.release_date?.slice(0, 4) || "Unknown",
    rating: m.vote_average ? m.vote_average.toFixed(1) : "N/A",
  });

  // 1. Fetch Main List (Search or General)
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setIsActorSearch(false);
    setActorName("");
  }, [searchQuery]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let newMovies = [];
        let nextHasMore = false;

        if (searchQuery) {
          const result = await universalSearch(searchQuery, page);
          newMovies = result.results.map(mapMovie);
          nextHasMore = result.hasMore;

          if (page === 1) {
            setIsActorSearch(result.isActorSearch);
            setActorName(result.actorName || "");
          }
        } else {
          const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&page=${page}&sort_by=popularity.desc`;
          const res = await axios.get(url, { withCredentials: false });
          newMovies = res.data.results.map(mapMovie);
          nextHasMore = newMovies.length >= 20;
        }

        setHasMore(nextHasMore);
        setMovies((prev) => (page === 1 ? newMovies : [...prev, ...newMovies]));
      } catch (err) {
        notify.error("Search failed. Please try again.");
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

  // 2. Fetch Categories & Popular for Sidebar
  const fetchGenre = async (genreId, setter) => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_genres=${genreId}`,
        { withCredentials: false }
      );
      setter(res.data.results.map(mapMovie));
    } catch (err) {}
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchGenre(16, setAnimated);
      fetchGenre(28, setAction);
      fetchGenre(18, setDrama);
      fetchGenre(35, setComedy);
      fetchGenre(27, setHorror);
      fetchGenre(10749, setRomance);
      fetchGenre(878, setSciFi);
      fetchGenre(10751, setFamily);
    }
    
    const fetchPopular = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&page=2`,
          { withCredentials: false }
        );
        setPopular(res.data.results.map(mapMovie).slice(0, 5));
      } catch (err) {}
    };
    fetchPopular();
  }, [searchQuery]);

  // 3. Favorites & Watchlist Logic
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const res = await api.get("/api/favorites");
        setFavorites(res.data);
      } catch (err) {}
    };
    
    const fetchWatchList = async () => {
      if (!user) {
        setWatchList([]);
        return;
      }
      try {
        const res = await api.get("/api/watch");
        setWatchList(res.data);
      } catch (err) {}
    };

    fetchFavorites();
    fetchWatchList();
  }, [user]);

  const isFavorite = (movieId) =>
    Array.isArray(favorites) &&
    favorites.some((fav) => String(fav?.movieId) === String(movieId));

  const toggleFavorite = async (movie) => {
    if (!user) {
      notify.warning("Please login to add to Favorites.");
      return;
    }

    const isFav = isFavorite(movie._id);
    setFavorites((prev) => {
      if (isFav) {
        return prev.filter((fav) => String(fav.movieId) !== String(movie._id));
      } else {
        return [...prev, { movieId: movie._id, title: movie.title, year: movie.year, rating: movie.rating, img: movie.poster }];
      }
    });

    try {
      if (isFav) {
        await api.delete(`/api/favorites/${movie._id}`);
        notify.success("Removed from Favorites.");
      } else {
        await api.post("/api/favorites", {
          movieId: movie._id, title: movie.title, year: movie.year, rating: movie.rating, img: movie.poster,
        });
        notify.success("Added to Favorites ❤️");
      }
    } catch (err) {
      if (isFav) {
        setFavorites((prev) => [...prev, { movieId: movie._id, title: movie.title, year: movie.year, rating: movie.rating, img: movie.poster }]);
      } else {
        setFavorites((prev) => prev.filter((fav) => String(fav.movieId) !== String(movie._id)));
      }
    }
  };

  return (
    <div className="discover-page">
      <div className="discover-container">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="discover-main">
          
          {/* Main Grid (Search or Discover) */}
          <section className="discover-section">
            <div className="section-header-row">
              {searchQuery ? <FaSearch size={28} color="var(--color-primary)" /> : <FaVolumeUp size={28} color="var(--color-primary)" />}
              <h2>
                {isActorSearch ? (
                  <>Movies featuring <span style={{ color: "var(--color-primary)" }}>{actorName}</span></>
                ) : searchQuery ? (
                  `Results for "${searchQuery}"`
                ) : (
                  "Talk Of The Town"
                )}
              </h2>
            </div>
            
            <div className="movie-grid">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
              ))}
            </div>
            
            {loading && (
              <div className="loader-container">
                <span className="global-loader">Loading...</span>
              </div>
            )}
            
            {!loading && movies.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)" }}>
                No movies found {searchQuery ? `for "${searchQuery}"` : ""}.
              </p>
            )}

            {!loading && hasMore && movies.length > 0 && (
              <button onClick={handleLoadMore} className="load-more-btn">
                Watch More <FaChevronDown />
              </button>
            )}
          </section>

          {/* Render Categories if NOT searching */}
          {!searchQuery && (
            <>
              {animated.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaPalette size={24} color="var(--color-primary)" />
                    <h2>Animated Movies</h2>
                  </div>
                  <div className="movie-grid">
                    {animated.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}
              
              {action.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaFire size={24} color="var(--color-primary)" />
                    <h2>Action Movies</h2>
                  </div>
                  <div className="movie-grid">
                    {action.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}

              {comedy.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaSmile size={24} color="var(--color-primary)" />
                    <h2>Comedy Movies</h2>
                  </div>
                  <div className="movie-grid">
                    {comedy.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}

              {drama.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaTheaterMasks size={24} color="var(--color-primary)" />
                    <h2>Drama</h2>
                  </div>
                  <div className="movie-grid">
                    {drama.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}

              {horror.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaGhost size={24} color="var(--color-primary)" />
                    <h2>Horror</h2>
                  </div>
                  <div className="movie-grid">
                    {horror.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}

              {romance.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaHeart size={24} color="var(--color-primary)" />
                    <h2>Romance</h2>
                  </div>
                  <div className="movie-grid">
                    {romance.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}

              {sciFi.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaRocket size={24} color="var(--color-primary)" />
                    <h2>Sci-Fi</h2>
                  </div>
                  <div className="movie-grid">
                    {sciFi.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}

              {family.length > 0 && (
                <section className="discover-section">
                  <div className="section-header-row">
                    <FaUsers size={24} color="var(--color-primary)" />
                    <h2>Family & Emotion</h2>
                  </div>
                  <div className="movie-grid">
                    {family.slice(0, 10).map((movie) => (
                      <MovieCard key={movie._id} movie={movie} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <aside className="discover-sidebar">
          
          {/* Popular Widget */}
          <div className="sidebar-widget">
            <div className="widget-header">
              <FaChartLine size={24} color="var(--color-primary)" />
              <h3>Popular This Month</h3>
            </div>
            <div className="widget-list">
              {popular.map((movie, index) => (
                <Link to={`/detail/${movie._id}`} key={movie._id} style={{textDecoration: 'none'}}>
                  <div className="widget-item">
                    <div className="widget-rank">{index + 1}</div>
                    <div className="widget-poster">
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                    <div className="widget-info">
                      <h4>{movie.title}</h4>
                      <p>
                        <FaStar color="#f5c518" size={12} />
                        {movie.rating}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* User Favorites Widget */}
          {user && favorites.length > 0 && (
            <div className="sidebar-widget">
              <div className="widget-header">
                <FaHeart size={24} color="var(--color-primary)" />
                <h3>Your Favorites</h3>
              </div>
              <div className="widget-list">
                {[...favorites]
                  .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
                  .slice(0, 5)
                  .map((fav) => (
                  <Link to={`/detail/${fav.movieId}`} key={fav.movieId} style={{textDecoration: 'none'}}>
                    <div className="widget-item">
                      <div className="widget-poster">
                        <img src={fav.img} alt={fav.title} />
                      </div>
                      <div className="widget-info">
                        <h4>{fav.title}</h4>
                        <p>
                          <FaStar color="#f5c518" size={12} />
                          {fav.rating ? Number(fav.rating).toFixed(1) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Watchlist Widget */}
          {user && watchList.length > 0 && (
            <div className="sidebar-widget">
              <div className="widget-header">
                <FaClock size={24} color="var(--color-primary)" />
                <h3>Your Watchlist</h3>
              </div>
              <div className="widget-list">
                {[...watchList]
                  .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
                  .slice(0, 5)
                  .map((watch) => (
                  <Link to={`/detail/${watch.movieId}`} key={watch.movieId} style={{textDecoration: 'none'}}>
                    <div className="widget-item">
                      <div className="widget-poster">
                        <img src={watch.img} alt={watch.title} />
                      </div>
                      <div className="widget-info">
                        <h4>{watch.title}</h4>
                        <p>
                          <FaStar color="#f5c518" size={12} />
                          {watch.rating ? Number(watch.rating).toFixed(1) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
        </aside>
      </div>
    </div>
  );
}

export default ShowList;
