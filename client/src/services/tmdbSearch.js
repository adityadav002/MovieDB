import axios from "axios";

const apikey = import.meta.env.VITE_API_KEY;

export const searchMovies = async (query, page = 1) => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${encodeURIComponent(query)}&page=${page}`;
  const res = await axios.get(url, { withCredentials: false });
  return res.data;
};

export const searchPerson = async (query) => {
  const url = `https://api.themoviedb.org/3/search/person?api_key=${apikey}&query=${encodeURIComponent(query)}`;
  const res = await axios.get(url, { withCredentials: false });
  return res.data.results.length > 0 ? res.data.results[0] : null;
};

export const getActorMovies = async (personId) => {
  const url = `https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${apikey}`;
  const res = await axios.get(url, { withCredentials: false });
  return res.data.cast || [];
};

export const universalSearch = async (query, page = 1) => {
  if (!query || !query.trim()) {
    return { results: [], isActorSearch: false, hasMore: false };
  }
  
  query = query.trim();

  // 1. Search movies first
  const movieData = await searchMovies(query, page);
  
  // If movies found or we are loading more movies (page > 1)
  if (movieData.results.length > 0 || page > 1) {
    return {
      results: movieData.results,
      isActorSearch: false,
      hasMore: movieData.results.length >= 20 // TMDB default page size is 20
    };
  }

  // 2. No movies found, try person search (only on page 1 since actor movies don't have TMDB pagination)
  if (page === 1) {
    const person = await searchPerson(query);
    if (person) {
      const movies = await getActorMovies(person.id);
      
      // Remove duplicates by ID and sort by release date DESC
      const uniqueMoviesMap = new Map();
      movies.forEach(m => {
        if (!uniqueMoviesMap.has(m.id)) {
          uniqueMoviesMap.set(m.id, m);
        }
      });
      
      const sortedMovies = Array.from(uniqueMoviesMap.values()).sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date) - new Date(a.release_date);
      });

      return {
        results: sortedMovies,
        isActorSearch: true,
        actorName: person.name,
        hasMore: false // No pagination for actor movie credits
      };
    }
  }

  // Nothing found
  return { results: [], isActorSearch: false, hasMore: false };
};
