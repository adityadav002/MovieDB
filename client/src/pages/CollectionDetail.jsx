/** @format */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import { FaTrash, FaPen, FaXmark } from "react-icons/fa6";
import "../style/CollectionStyle.css";
import { useAuth } from "../context/AuthContext";
import CollectionSelectorModal from "../components/CollectionSelectorModal";
import MovieCard from "../components/MovieCard";

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/collections/${id}`);
      setCollection(res.data);
    } catch (err) {
      notify.error("Failed to load collection details");
      navigate("/collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchCollection();
    }
  }, [user, id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${collection.name}"? Your movies will not be affected.`)) {
      try {
        await api.delete(`/api/collections/${id}`);
        notify.success("Collection deleted");
        navigate("/collections");
      } catch (err) {
        notify.error("Failed to delete collection");
      }
    }
  };

  const handleRemoveMovie = async (movieId, e) => {
    e.preventDefault(); // Prevent link click
    e.stopPropagation();
    
    if (window.confirm("Remove this movie from the collection?")) {
      try {
        // Optimistic UI update
        const currentMovies = [...collection.movies];
        setCollection({
          ...collection,
          movies: collection.movies.filter(m => String(m.movieId) !== String(movieId))
        });
        
        // We sync the movie's collections by removing this collectionId from its list
        // First get current collections for the movie
        const res = await api.get(`/api/movies/${movieId}/collections`);
        const currentCollectionIds = res.data.map(c => c._id);
        
        // Remove this collection's ID
        const newCollectionIds = currentCollectionIds.filter(cId => String(cId) !== String(collection._id));
        
        // Sync
        await api.put(`/api/movies/${movieId}/collections`, {
          collectionIds: newCollectionIds,
          movieDetails: {} // not needed for removal
        });
        
        notify.success("Movie removed from collection");
      } catch (err) {
        notify.error("Failed to remove movie");
        fetchCollection(); // revert on failure
      }
    }
  };

  const handleCollectionUpdated = () => {
    fetchCollection();
    setShowEditModal(false);
  };

  if (!user) {
    return (
      <div className="collections-container">
        <div className="collections-empty">
          <p>Please login to view this collection.</p>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !collection) {
    return (
      <div className="loading-container" style={{ marginTop: '100px' }}>
        <div className="loading-spinner" />
        <p>Loading collection...</p>
      </div>
    );
  }

  const filteredMovies = collection.movies?.filter(m => 
    m.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <div className="collection-detail-hero">
        <div className="collection-detail-header">
          <div className="collection-meta">
            <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span>{collection.movies?.length || 0} Movies</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <h1 style={{ margin: 0 }}>{collection.name}</h1>
            {collection.movies?.length > 0 && (
              <div style={{ flex: '1 1 200px', maxWidth: '300px', minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Search in collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
          {collection.description && (
            <p>{collection.description}</p>
          )}
          
          <div className="collection-actions" style={{ marginTop: '24px' }}>
            <button className="btn-edit" onClick={() => setShowEditModal(true)}>
              <FaPen /> Edit
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="collection-detail-content">
        {collection.movies?.length === 0 ? (
          <div className="collections-empty">
            <p>This collection is empty.</p>
            <Link to="/discover" className="create-collection-btn" style={{ textDecoration: 'none' }}>
              Explore Movies
            </Link>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="collections-empty">
            <p>No movies match your search.</p>
          </div>
        ) : (
          <div className="collection-movies-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredMovies.map((movie) => (
              <div className="movie-card-wrapper" key={movie.movieId} style={{ position: 'relative' }}>
                <button 
                  className="remove-movie-btn" 
                  onClick={(e) => handleRemoveMovie(movie.movieId, e)}
                  title="Remove from collection"
                  style={{ zIndex: 20 }}
                >
                  <FaXmark />
                </button>
                <MovieCard 
                  movie={{
                    _id: movie.movieId,
                    title: movie.title,
                    year: movie.year,
                    rating: movie.rating,
                    poster: movie.img
                  }} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <CollectionSelectorModal 
          mode="edit"
          collectionData={collection}
          onClose={() => setShowEditModal(false)}
          onCreated={handleCollectionUpdated}
        />
      )}
    </>
  );
}

export default CollectionDetail;
