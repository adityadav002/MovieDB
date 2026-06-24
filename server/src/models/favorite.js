/** @format */
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: String,
  title: String,
  year: String,
  rating: Number,
  img: String,
});

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
