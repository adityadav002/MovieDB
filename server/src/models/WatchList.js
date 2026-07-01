/** @format */
import mongoose from "mongoose";

const WatchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: String,
  title: String,
  year: String,
  img: String,
});

WatchSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Watch = mongoose.model("Watch", WatchSchema);
export default Watch;
