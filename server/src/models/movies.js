/** @format */

import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    poster: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    year: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "",
    },
    trailer: {
      type: String,
      default: "",
    },
    screenshot1: {
      type: String,
      default: "",
    },
    screenshot2: {
      type: String,
      default: "",
    },
    screenshot3: {
      type: String,
      default: "",
    },
    screenshot4: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
