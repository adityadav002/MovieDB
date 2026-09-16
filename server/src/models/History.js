import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Create compound index to ensure uniqueness per user per movie
HistorySchema.index({ userId: 1, movieId: 1 }, { unique: true });

const History = mongoose.model("History", HistorySchema);
export default History;
