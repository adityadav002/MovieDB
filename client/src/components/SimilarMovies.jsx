import { useEffect, useState } from "react";
import MovieCards from "./MovieCards.jsx";

const SimilarMovies = ({ movieId }) => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;

    const fetchSimilarMovies = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
        );
        const data = await res.json();
        setMovies(data.results.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch similar movies", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId]);

  if (loading) return null;
  if (!movies.length) return null;

  return (
    <section className="similar-section">
      <h2>Similar Movies</h2>

      <div className="similar-grid">
        {movies.map((movie) => (
          <MovieCards key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

export default SimilarMovies;
