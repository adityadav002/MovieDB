import axios from "axios";
import http from "http";
import https from "https";

const apikey = process.env.VITE_API_KEY || process.env.TMDB_API_KEY || "8b4dfcdc32cc08aef3d163eb1b30bd1c";

const tmdbApi = axios.create({
  timeout: 15000, // 15 seconds timeout
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true })
});

export const searchTmdbMovies = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(200).json({ results: [], total_pages: 1 });
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${encodeURIComponent(query)}&page=${page}`;
    const response = await tmdbApi.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("TMDB Search Error:", error.message);
    res.status(200).json({ results: [], total_pages: 1 });
  }
};

export const searchTmdbPerson = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json(null);
    const url = `https://api.themoviedb.org/3/search/person?api_key=${apikey}&query=${encodeURIComponent(query)}`;
    const response = await tmdbApi.get(url);
    const actors = response.data?.results?.filter(
      (person) => person.known_for_department === "Acting"
    ) || [];
    res.status(200).json(actors[0] || null);
  } catch (error) {
    console.error("TMDB Person Error:", error.message);
    res.status(200).json(null);
  }
};

export const getTmdbActorMovies = async (req, res) => {
  try {
    const { personId, page = 1 } = req.query;
    if (!personId) return res.status(200).json({ results: [], total_pages: 1 });
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_cast=${personId}&sort_by=vote_count.desc&page=${page}`;
    const response = await tmdbApi.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("TMDB Actor Movies Error:", error.message);
    res.status(200).json({ results: [], total_pages: 1 });
  }
};
