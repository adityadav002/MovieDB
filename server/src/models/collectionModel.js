/** @format */
import mongoose from "mongoose";

const movieItemSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  title: { type: String },
  year: { type: String },
  rating: { type: Number },
  img: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: "",
    maxlength: 500
  },
  movies: [movieItemSchema]
}, { timestamps: true });

// Create compound index for fast querying of collections a user owns and movies inside them
collectionSchema.index({ userId: 1, "movies.movieId": 1 });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
