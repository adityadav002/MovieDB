/** @format */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import notify from "../utils/toast";
import { FaPlus } from "react-icons/fa6";
import "../style/CollectionStyle.css";
import { useAuth } from "../context/AuthContext";
import CollectionSelectorModal from "../components/CollectionSelectorModal";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/collections");
      setCollections(res.data);
    } catch (err) {
      notify.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const handleCollectionCreated = () => {
    fetchCollections();
    setShowCreateModal(false);
  };

  if (!user) {
    return (
      <div className="collections-container">
        <div className="collections-empty">
          <p>Please login to view your collections.</p>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="collections-container">
      <div className="collections-header">
        <div>
          <h1>Your Collections</h1>
          <p>Organize movies your way.</p>
        </div>
        <button 
          className="create-collection-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Create Collection
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="collections-empty">
          <p>You haven't created any collections yet.</p>
          <button 
            className="create-collection-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="collections-grid">
          {collections.map(col => (
            <Link to={`/collections/${col._id}`} className="collection-card" key={col._id}>
              <div className="collection-poster-collage">
                {col.movies && col.movies.length > 0 ? (
                  col.movies.slice(0, 4).map((m, i) => {
                    const total = Math.min(col.movies.length, 4);
                    let className = "poster-slice";
                    if (total === 1) className += " single";
                    if (total === 2) className += " half";
                    return (
                      <img 
                        key={m.movieId} 
                        src={m.img || "/no_poster_found.png"} 
                        alt={m.title}
                        className={className}
                        onError={(e) => { e.currentTarget.src = "/no_poster_found.png"; }}
                      />
                    );
                  })
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}>
                    Empty Collection
                  </div>
                )}
              </div>
              <div className="collection-card-info">
                <h3 className="collection-card-title">{col.name}</h3>
                <div className="collection-card-count">
                  {col.movies ? col.movies.length : 0} {col.movies?.length === 1 ? 'Movie' : 'Movies'}
                </div>
                {col.description && (
                  <p className="collection-card-desc">{col.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CollectionSelectorModal 
          mode="createOnly"
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCollectionCreated}
        />
      )}
    </div>
  );
}

export default Collections;
