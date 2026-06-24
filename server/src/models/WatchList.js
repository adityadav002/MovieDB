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

const Watch = mongoose.model("Watch", WatchSchema);
export default Watch;
