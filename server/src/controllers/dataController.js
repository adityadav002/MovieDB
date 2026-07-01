/** @format */

import Movie from "../models/movies.js";
import Favorite from "../models/favorite.js";
import Watch from "../models/WatchList.js";

/* ===========================
   MOVIES
=========================== */

export const getMovies = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const movies = await Movie.find().skip(skip).limit(limit);
    const total = await Movie.countDocuments();

    res.status(200).json({
      movies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
};

export const searchMovies = async (req, res) => {
  const { q = "", page = 1, limit = 10 } = req.query;

  try {
    const movies = await Movie.find({
      title: { $regex: q, $options: "i" },
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
};

/* ===========================
   WATCH LIST
=========================== */

export const getWatchList = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchList = await Watch.find({ userId });
    res.status(200).json(watchList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch WatchList" });
  }
};

export const addWatchList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, title, year, img, rating } = req.body;

    const exists = await Watch.findOne({ userId, movieId });
    if (exists) {
      return res.status(200).json({ message: "Already in WatchList" });
    }

    const watch = new Watch({
      userId,
      movieId,
      title,
      year,
      img,
      rating,
    });

    await watch.save();
    res.status(201).json({ message: "Added to WatchList" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add WatchList" });
  }
};

export const removeWatchList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    await Watch.deleteOne({ userId, movieId });
    res.status(200).json({ message: "Removed from WatchList" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove WatchList" });
  }
};

/* ===========================
   FAVORITES
=========================== */

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId });
    res.status(200).json(favorites);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, title, year, img, rating } = req.body;

    const exists = await Favorite.findOne({ userId, movieId });
    if (exists) {
      return res.status(200).json({ message: "Already in favorites" });
    }

    const favorite = new Favorite({
      userId,
      movieId,
      title,
      year,
      img,
      rating,
    });

    await favorite.save();
    res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    await Favorite.findOneAndDelete({ userId, movieId });
    res.status(200).json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

/* ===========================
   GENRE FILTERS
=========================== */

export const getAnimatedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      genre: { $regex: /(Animated|Animation)/i },
    });

    res.status(200).json({ movies, total: movies.length });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getActionMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      genre: { $regex: /Action/i },
    });

    res.status(200).json({ movies, total: movies.length });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDramaMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      genre: { $regex: /Drama/i },
    });

    res.status(200).json({ movies, total: movies.length });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getComedyMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      genre: { $regex: /Comedy/i },
    });

    res.status(200).json({ movies, total: movies.length });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getHorrorMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      genre: { $regex: /Horror/i },
    });

    res.status(200).json({ movies, total: movies.length });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
