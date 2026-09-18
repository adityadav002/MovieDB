/** @format */

import Collection from "../models/collectionModel.js";

// GET all collections for a user
export const getCollections = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const collections = await Collection.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json(collections);
  } catch (err) {
    next(err);
  }
};

// POST create a new collection
export const createCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    const newCollection = new Collection({
      userId,
      name: name.trim(),
      description: description ? description.trim() : "",
      movies: []
    });

    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    next(err);
  }
};

// GET a specific collection by ID
export const getCollectionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const collection = await Collection.findOne({ _id: id, userId });
    
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.status(200).json(collection);
  } catch (err) {
    next(err);
  }
};

// PUT update a collection's name/description
export const updateCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    const collection = await Collection.findOneAndUpdate(
      { _id: id, userId },
      { 
        name: name.trim(), 
        description: description ? description.trim() : "" 
      },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.status(200).json(collection);
  } catch (err) {
    next(err);
  }
};

// DELETE a collection
export const deleteCollection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const collection = await Collection.findOneAndDelete({ _id: id, userId });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET collections that contain a specific movie (for current user)
export const getMovieCollections = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    // Find all collections owned by user that have this movieId in their movies array
    const collections = await Collection.find(
      { userId, "movies.movieId": String(movieId) },
      { _id: 1, name: 1 } // Only return id and name to be lightweight
    );

    res.status(200).json(collections);
  } catch (err) {
    next(err);
  }
};

// PUT sync movie across multiple collections
export const syncMovieCollections = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    const { collectionIds, movieDetails } = req.body;
    // collectionIds: Array of string IDs of collections this movie SHOULD be in.
    // movieDetails: { title, year, rating, img }

    if (!Array.isArray(collectionIds)) {
      return res.status(400).json({ error: "collectionIds must be an array" });
    }

    const movieItem = {
      movieId: String(movieId),
      title: movieDetails?.title || "",
      year: movieDetails?.year || "",
      rating: movieDetails?.rating || 0,
      img: movieDetails?.img || "",
      addedAt: new Date()
    };

    // 1. Remove movie from collections it is currently in but should NOT be in
    await Collection.updateMany(
      { 
        userId, 
        "movies.movieId": String(movieId), 
        _id: { $nin: collectionIds } 
      },
      { 
        $pull: { movies: { movieId: String(movieId) } } 
      }
    );

    // 2. Add movie to collections it SHOULD be in but is NOT currently in
    await Collection.updateMany(
      { 
        userId, 
        _id: { $in: collectionIds },
        "movies.movieId": { $ne: String(movieId) }
      },
      { 
        $push: { movies: movieItem } 
      }
    );

    res.status(200).json({ message: "Movie collections synced successfully" });
  } catch (err) {
    next(err);
  }
};
