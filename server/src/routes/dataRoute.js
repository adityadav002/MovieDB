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
  getWatchList
} from "../controllers/dataController.js";

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

router.get("/animated", getAnimatedMovies);

router.get("/action", getActionMovies);

router.get("/drama", getDramaMovies);

router.get("/comedy", getComedyMovies);

router.get("/horror", getHorrorMovies);

export default router;
