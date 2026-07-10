import axios from "axios";

const apikey = import.meta.env.VITE_API_KEY;

export const searchMovies = async (query, page = 1) => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${encodeURIComponent(query)}&page=${page}`;
  const res = await axios.get(url, { withCredentials: false });
  return res.data;
};

export const searchPerson = async (query) => {
  const url = `https://api.themoviedb.org/3/search/person?api_key=${apikey}&query=${encodeURIComponent(query)}`;

  const res = await axios.get(url, {
    withCredentials: false,
  });

  const actors = res.data.results.filter(
    (person) => person.known_for_department === "Acting",
  );

  return actors[0] || null;
};

export const getActorMovies = async (personId, page = 1) => {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_cast=${personId}&sort_by=vote_count.desc&page=${page}`;

  const res = await axios.get(url, {
    withCredentials: false,
  });

  return res.data;
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

  // Normal movie search

  const movieData = await searchMovies(query, page);

  return {
    results: movieData.results,

    isActorSearch: false,

    hasMore: page < movieData.total_pages,
  };
};
