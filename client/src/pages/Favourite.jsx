import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import "../style/ShowListStyle.css"; 
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";
import { FaHeart } from "react-icons/fa";

function Favourite() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

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
    fetchFavorites();
  }, [user]);

  const isFavorite = (movieId) => true; 

  const toggleFavorite = async (movie) => {
    if (!user) return;
    const movieId = movie._id;

    const previous = [...favorites];
    setFavorites((prev) => prev.filter((fav) => String(fav.movieId) !== String(movieId)));

    try {
      await api.delete(`/api/favorites/${movieId}`);
      notify.success("Removed from Favorites.");
    } catch (err) {
      setFavorites(previous);
      notify.error("Failed to remove from Favorites.");
    }
  };

  return (
    <div className="discover-page">
      <div className="discover-container" style={{ display: 'block', padding: '2rem 1.5rem', maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <FaHeart size={32} color="var(--color-primary)" />
          <h1 className="font-headline-lg text-headline-lg text-on-surface" style={{ margin: 0 }}>Your Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="loader-container" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '4rem 2rem', textAlign: 'center' }}>
            <FaHeart size={48} color="var(--color-on-surface-variant)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h2 className="font-headline-md text-on-surface" style={{ marginBottom: '0.5rem' }}>No Favorites Yet</h2>
            <p className="text-on-surface-variant" style={{ marginBottom: '2rem' }}>Find your favorite movies and save them here.</p>
            <Link to="/home" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: 'var(--radius-sm)' }}>
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="movie-grid">
            {favorites.map((fav) => {
              const movieObj = {
                _id: fav.movieId,
                id: fav.movieId,
                title: fav.title,
                poster: fav.img,
                year: fav.year,
                rating: fav.rating,
              };
              return (
                <MovieCard
                  key={fav.movieId}
                  movie={movieObj}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favourite;
