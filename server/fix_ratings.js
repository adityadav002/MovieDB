import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Watch from "./src/models/WatchList.js";
import Favorite from "./src/models/favorite.js";

dotenv.config();

const TMDB_API_KEY = "8b4dfcdc32cc08aef3d163eb1b30bd1c";

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");

    // Fix WatchList
    const watches = await Watch.find({ rating: { $exists: false } });
    console.log(`Found ${watches.length} Watchlist items missing rating`);
    
    for (let w of watches) {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${w.movieId}?api_key=${TMDB_API_KEY}`);
        w.rating = res.data.vote_average;
        await w.save();
        console.log(`Updated Watchlist ${w.title} with rating ${w.rating}`);
      } catch (e) {
        console.error(`Failed to update Watchlist ${w.title}:`, e.message);
      }
    }

    // Fix Favorites (just in case they have missing ratings too)
    const favs = await Favorite.find({ rating: { $exists: false } });
    console.log(`Found ${favs.length} Favorite items missing rating`);
    
    for (let f of favs) {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/movie/${f.movieId}?api_key=${TMDB_API_KEY}`);
        f.rating = res.data.vote_average;
        await f.save();
        console.log(`Updated Favorite ${f.title} with rating ${f.rating}`);
      } catch (e) {
        console.error(`Failed to update Favorite ${f.title}:`, e.message);
      }
    }

    console.log("Done");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    process.exit(0);
  }
}
fix();
