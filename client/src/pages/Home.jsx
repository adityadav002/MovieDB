import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaStar, FaPlay, FaHeart, FaBookmark, FaCircleInfo, FaTicket, FaCalendarDay, FaClock, FaFire } from "react-icons/fa6";
import { MdOutlinePlayCircle } from "react-icons/md";
import { FiTrendingUp } from "react-icons/fi";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";

const apikey = import.meta.env.VITE_API_KEY;

function Home() {
  const { user } = useAuth();
  
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [watchList, setWatchList] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapMovie = (m) => ({
    _id: m.id,
    id: m.id,
    title: m.title,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "/no_poster_found.png",
    backdrop: m.backdrop_path
      ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
      : null,
    year: m.release_date?.slice(0, 4) || "Unknown",
    rating: m.vote_average ? m.vote_average.toFixed(1) : "N/A",
    overview: m.overview,
    genreIds: m.genre_ids,
  });

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const popularRes = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&page=1`,
          { withCredentials: false }
        );
        const popular = popularRes.data.results.map(mapMovie);
        
        if (popular.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(10, popular.length));
          const selected = popular[randomIndex];
          
          try {
            const detailsRes = await axios.get(
              `https://api.themoviedb.org/3/movie/${selected.id}?api_key=${apikey}`,
              { withCredentials: false }
            );
            
            const runtime = detailsRes.data.runtime;
            const hours = Math.floor(runtime / 60);
            const minutes = runtime % 60;
            const runtimeStr = runtime ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`) : null;
            
            setFeaturedMovie({
              ...selected,
              runtimeStr,
              genresStr: detailsRes.data.genres?.map(g => g.name).join(', '),
              language: detailsRes.data.original_language?.toUpperCase()
            });
          } catch (e) {
            setFeaturedMovie(selected);
          }
          
          setPopularMovies(popular.filter((_, idx) => idx !== randomIndex));
        }

        const topRatedRes = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&page=1`,
          { withCredentials: false }
        );
        setTopRated(topRatedRes.data.results.map(mapMovie));
        
        const nowPlayingRes = await axios.get(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}&page=1`,
          { withCredentials: false }
        );
        setNowPlaying(nowPlayingRes.data.results.map(mapMovie));

        const upcomingRes = await axios.get(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}&page=1`,
          { withCredentials: false }
        );
        setUpcoming(upcomingRes.data.results.map(mapMovie));

        const actionRes = await axios.get(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_genres=28&page=1`,
          { withCredentials: false }
        );
        setActionMovies(actionRes.data.results.map(mapMovie));
        
      } catch (err) {
        console.error("Failed to fetch movies for home page", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchWatchList = async () => {
      if (!user) return;
      try {
        const res = await api.get("/api/watch");
        setWatchList(res.data);
      } catch (err) {
        console.error("Failed to fetch watchlist", err);
      }
    };
    fetchWatchList();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
        <span className="global-loader">Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
      {/* 1. HERO SECTION */}
      {featuredMovie && (
        <section style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
          {/* Background Image with Gradient Overlay */}
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <img 
              src={featuredMovie.backdrop || featuredMovie.poster} 
              alt={featuredMovie.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-surface) 0%, rgba(19, 19, 20, 0.6) 50%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(19, 19, 20, 0.8) 0%, transparent 100%)' }}></div>
          </div>
          
          {/* Hero Content */}
          <div className="container-max" style={{ position: 'relative', zIndex: 10, width: '100%', margin: '0 auto', padding: '0 var(--margin-mobile) 2rem var(--margin-mobile)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '3rem', flexWrap: 'wrap' }}>
              {/* Movie Poster */}
              <div style={{ flexShrink: 0, width: '16rem', aspectRatio: '2/3', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'none' }} id="hero-poster">
                <style>{`@media(min-width: 768px) { #hero-poster { display: block !important; } }`}</style>
                <img src={featuredMovie.poster} alt={featuredMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Movie Details */}
              <div style={{ maxWidth: '48rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: 'var(--color-surface-container)', color: 'var(--color-text-primary)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontFamily: 'var(--font-body)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    Featured
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f5c518', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '0.875rem' }}>
                    <FaStar size={14} />
                    <span>{featuredMovie.rating}</span>
                  </div>
                </div>
                
                {/* Title */}
                <h1 className="font-display-lg" style={{ margin: 0, color: 'white', textWrap: 'balance', textShadow: '0 4px 10px rgba(0, 0, 0, 0.5)' }}>{featuredMovie.title}</h1>
                
                {/* Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-on-surface-variant)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span>{featuredMovie.year}</span>
                  {featuredMovie.runtimeStr && (
                    <>
                      <span>•</span>
                      <span>{featuredMovie.runtimeStr}</span>
                    </>
                  )}
                  {featuredMovie.language && (
                    <>
                      <span>•</span>
                      <span>{featuredMovie.language}</span>
                    </>
                  )}
                  {featuredMovie.genresStr && (
                    <>
                      <span>•</span>
                      <span>{featuredMovie.genresStr}</span>
                    </>
                  )}
                </div>
                
                {/* Description */}
                <p className="font-body-lg text-on-surface-variant" style={{ margin: '0 0 1.5rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '42rem' }}>{featuredMovie.overview}</p>
                
                {/* Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <Link to={`/detail/${featuredMovie._id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                    <FaCircleInfo size={20} />
                    Movie Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. POPULAR MOVIES */}
      {popularMovies.length > 0 && (
        <section className="container-max mx-auto" style={{ padding: '3rem var(--margin-mobile)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FiTrendingUp style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
            <h2 className="font-headline-md text-on-surface" style={{ margin: 0 }}>Trending Now</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#2a2a2b #0A0A0B' }}>
            {popularMovies.map((movie) => (
              <div key={movie._id} style={{ flexShrink: 0, width: "200px" }}>
                <MovieCard 
                  movie={movie} 
                  isFavorite={() => false} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. NOW PLAYING */}
      {nowPlaying.length > 0 && (
        <section className="container-max mx-auto" style={{ padding: '3rem var(--margin-mobile)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FaTicket style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
            <h2 className="font-headline-md text-on-surface" style={{ margin: 0 }}>Now Playing In Theaters</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#2a2a2b #0A0A0B' }}>
            {nowPlaying.map((movie) => (
              <div key={movie._id} style={{ flexShrink: 0, width: "200px" }}>
                <MovieCard 
                  movie={movie} 
                  isFavorite={() => false} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. TOP RATED */}
      {topRated.length > 0 && (
        <section className="container-max mx-auto" style={{ padding: '3rem var(--margin-mobile)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FaStar style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
            <h2 className="font-headline-md text-on-surface" style={{ margin: 0 }}>Top Rated</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#2a2a2b #0A0A0B' }}>
            {topRated.map((movie) => (
              <div key={movie._id} style={{ flexShrink: 0, width: "200px" }}>
                <MovieCard 
                  movie={movie} 
                  isFavorite={() => false} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. UPCOMING RELEASES */}
      {upcoming.length > 0 && (
        <section className="container-max mx-auto" style={{ padding: '3rem var(--margin-mobile)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FaCalendarDay style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
            <h2 className="font-headline-md text-on-surface" style={{ margin: 0 }}>Upcoming Releases</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#2a2a2b #0A0A0B' }}>
            {upcoming.map((movie) => (
              <div key={movie._id} style={{ flexShrink: 0, width: "200px" }}>
                <MovieCard 
                  movie={movie} 
                  isFavorite={() => false} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. ACTION & ADVENTURE */}
      {actionMovies.length > 0 && (
        <section className="container-max mx-auto" style={{ padding: '3rem var(--margin-mobile)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FaFire style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
            <h2 className="font-headline-md text-on-surface" style={{ margin: 0 }}>Action & Adventure</h2>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#2a2a2b #0A0A0B' }}>
            {actionMovies.map((movie) => (
              <div key={movie._id} style={{ flexShrink: 0, width: "200px" }}>
                <MovieCard 
                  movie={movie} 
                  isFavorite={() => false} 
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
