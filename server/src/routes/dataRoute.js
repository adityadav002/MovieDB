/** @format */

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getMovies,
  getMovieDetails,
  searchMovies,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAnimatedMovies,
  getActionMovies,
  getDramaMovies,
  getComedyMovies,
  getHorrorMovies,
  addWatchList,
  removeWatchList,
  getWatchList,
  getHistory,
  addHistory
} from "../controllers/dataController.js";
import {
  searchTmdbMovies,
  searchTmdbPerson,
  getTmdbActorMovies
} from "../controllers/tmdbController.js";
import {
  getCollections,
  createCollection,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getMovieCollections,
  syncMovieCollections
} from "../controllers/collectionController.js";

const router = express.Router();

router.get("/movies", getMovies);

router.get("/details/:id", getMovieDetails);

router.get("/search", searchMovies);

router.get("/favorites", authMiddleware, getFavorites);

router.post("/favorites", authMiddleware, addFavorite);

router.delete("/favorites/:movieId", authMiddleware, removeFavorite);

router.get("/watch", authMiddleware, getWatchList);

router.post("/watch", authMiddleware, addWatchList);

router.delete("/watch/:movieId", authMiddleware, removeWatchList);

router.get("/history", authMiddleware, getHistory);

router.post("/history", authMiddleware, addHistory);

router.get("/animated", getAnimatedMovies);

router.get("/action", getActionMovies);

router.get("/drama", getDramaMovies);

router.get("/comedy", getComedyMovies);

router.get("/horror", getHorrorMovies);

// TMDB PROXY ROUTES
router.get("/tmdb/search/movie", searchTmdbMovies);
router.get("/tmdb/search/person", searchTmdbPerson);
router.get("/tmdb/discover/actor", getTmdbActorMovies);

/* ===========================
   COLLECTIONS
=========================== */
router.get("/collections", authMiddleware, getCollections);
router.post("/collections", authMiddleware, createCollection);
router.get("/collections/:id", authMiddleware, getCollectionById);
router.put("/collections/:id", authMiddleware, updateCollection);
router.delete("/collections/:id", authMiddleware, deleteCollection);
router.get("/movies/:movieId/collections", authMiddleware, getMovieCollections);
router.put("/movies/:movieId/collections", authMiddleware, syncMovieCollections);

export default router;
