/** @format */
import { useState, useEffect } from "react";
import api from "../utils/api";
import notify from "../utils/toast";
import { FaXmark, FaCheck, FaPlus } from "react-icons/fa6";
import "../style/CollectionStyle.css";

// Modes: "select" (add movie to collections), "createOnly" (just create a collection), "edit" (edit collection name/desc)
function CollectionSelectorModal({ 
  mode = "select", 
  movie = null, 
  collectionData = null,
  onClose, 
  onCreated 
}) {
  const [collections, setCollections] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(mode === "select");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(mode === "createOnly" || mode === "edit");
  
  const [formData, setFormData] = useState({
    name: collectionData?.name || "",
    description: collectionData?.description || ""
  });

  useEffect(() => {
    if (mode === "select") {
      fetchCollectionsAndSelection();
    }
  }, [mode, movie]);

  const fetchCollectionsAndSelection = async () => {
    try {
      setLoading(true);
      // Fetch all collections
      const [allRes, movieRes] = await Promise.all([
        api.get("/api/collections"),
        api.get(`/api/movies/${movie._id}/collections`)
      ]);
      
      setCollections(allRes.data);
      
      // Initialize selected set
      const initialSelected = new Set(movieRes.data.map(c => c._id));
      setSelectedIds(initialSelected);
    } catch (err) {
      notify.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSaveSelection = async () => {
    if (mode !== "select") return;
    
    try {
      setSaving(true);
      await api.put(`/api/movies/${movie._id}/collections`, {
        collectionIds: Array.from(selectedIds),
        movieDetails: {
          title: movie.title,
          year: movie.release_date?.split("-")[0] || "Unknown",
          rating: movie.rating,
          img: movie.poster
        }
      });
      notify.success("Collections updated");
      if (onCreated) onCreated(); // Used to trigger refresh if needed
      onClose();
    } catch (err) {
      notify.error("Failed to update collections");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      if (mode === "edit") {
        await api.put(`/api/collections/${collectionData._id}`, formData);
        notify.success("Collection updated");
        if (onCreated) onCreated();
      } else {
        const res = await api.post("/api/collections", formData);
        notify.success("Collection created");
        
        if (mode === "select" && movie) {
          // Immediately add the movie to this new collection
          const newSelected = new Set(selectedIds);
          newSelected.add(res.data._id);
          
          await api.put(`/api/movies/${movie._id}/collections`, {
            collectionIds: Array.from(newSelected),
            movieDetails: {
              title: movie.title,
              year: movie.release_date?.split("-")[0] || "Unknown",
              rating: movie.rating,
              img: movie.poster
            }
          });
          notify.success(`Added ${movie.title} to ${res.data.name}`);
        }
        
        if (onCreated) onCreated();
        if (mode !== "select") onClose();
      }
    } catch (err) {
      notify.error("Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mode === "edit" ? "Edit Collection" : 
             mode === "createOnly" ? "Create Collection" : 
             isCreating ? "Create Collection" : `Add to Collection`}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaXmark />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="loading-spinner" />
            </div>
          ) : isCreating ? (
            <form id="collection-form" onSubmit={handleSaveCollection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Collection Name</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. Masterpieces"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  placeholder="What is this collection about?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                />
              </div>
            </form>
          ) : (
            <>
              {collections.length > 5 && (
                <div className="search-collections">
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Search collections..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="collection-list">
                {filteredCollections.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                    No collections found.
                  </div>
                ) : (
                  filteredCollections.map(col => (
                    <div 
                      key={col._id} 
                      className={`collection-list-item ${selectedIds.has(col._id) ? 'selected' : ''}`}
                      onClick={() => handleToggleCollection(col._id)}
                    >
                      <div className="collection-checkbox">
                        <FaCheck />
                      </div>
                      <div className="collection-name">{col.name}</div>
                      <div className="collection-count">{col.movies?.length || 0}</div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className="create-new-inline"
                onClick={() => setIsCreating(true)}
              >
                <FaPlus /> Create New Collection
              </button>
            </>
          )}
        </div>

        <div className="modal-footer">
          {mode === "select" && isCreating && (
            <button className="btn-secondary" onClick={() => setIsCreating(false)} style={{ marginRight: 'auto' }}>
              Back
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          
          {isCreating ? (
            <button 
              type="submit" 
              form="collection-form" 
              className="btn-primary"
              disabled={saving || !formData.name.trim()}
            >
              {saving ? "Saving..." : (mode === "edit" ? "Save Changes" : "Create")}
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleSaveSelection}
              disabled={saving}
            >
              {saving ? "Saving..." : "Done"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectionSelectorModal;
