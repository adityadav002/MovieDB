import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const searchMovies = async (query, page = 1) => {
  try {
    const url = `${API_URL}/api/tmdb/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
    const res = await axios.get(url, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Movie search failed", error);
    return { results: [], total_pages: 1 };
  }
};

export const searchPerson = async (query) => {
  try {
    const url = `${API_URL}/api/tmdb/search/person?query=${encodeURIComponent(query)}`;
    const res = await axios.get(url, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Person search failed", error);
    return null;
  }
};

export const getActorMovies = async (personId, page = 1) => {
  try {
    const url = `${API_URL}/api/tmdb/discover/actor?personId=${personId}&page=${page}`;
    const res = await axios.get(url, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Actor movies failed", error);
    return { results: [], total_pages: 1 };
  }
};

export const universalSearch = async (query, page = 1) => {
  if (!query || !query.trim()) {
    return {
      results: [],
      isActorSearch: false,
      hasMore: false,
    };
  }

  query = query.trim();
  const person = await searchPerson(query);

  // Actor search
  if (person && person.name.toLowerCase() === query.toLowerCase()) {
    const actorMovies = await getActorMovies(person.id, page);

    return {
      results: actorMovies.results,
      isActorSearch: true,
      actorName: person.name,
      hasMore: page < actorMovies.total_pages,
    };
  }
  const movieData = await searchMovies(query, page);

  return {
    results: movieData.results,
    isActorSearch: false,
    hasMore: page < movieData.total_pages,
  };
};
