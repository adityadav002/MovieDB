import React from "react";
import "../style/Profile.css";
import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import notify from "../utils/toast";
import { FaBookmark, FaHeart, FaShapes, FaSignOutAlt } from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [watchLaterList, setWatchLaterList] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchWatchLater = async () => {
      if (!user) return;
      try {
        const res = await api.get("/api/watch");
        setWatchLaterList(res.data);
      } catch (err) {}
    };
    fetchWatchLater();
  }, [user]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const res = await api.get("/api/favorites");
        setFavorites(res.data);
      } catch (err) {}
    };
    fetchFavorites();
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout");
      logout();
      notify.success("Logged out successfully.");
      navigate("/home");
    } catch (error) {
      notify.error("Logout failed. Please try again.");
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="discover-page" style={{ paddingTop: '120px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <section className="profile-section" style={{ maxWidth: '1440px', padding: '0 5%' }}>
        <div className="profile-content">
          
          <div className="profile-avatar-wrapper">
            <div className="glow-avatar">
              {initial}
            </div>
            <div className="profile-avatar-glow"></div>
          </div>

          <h1 className="font-headline-lg" style={{ fontSize: '3rem', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
            {user?.name || "User"}
          </h1>
          <p className="font-body-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
            {user?.email || "No email available"}
          </p>

          <div style={{ width: '100%', maxWidth: '800px', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '32px 0' }}></div>

          <h2 className="font-headline-md" style={{ color: 'var(--color-primary)', marginBottom: '16px', marginTop: '32px' }}>
            Explorer Profile
          </h2>
          <p className="font-body-lg" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', textAlign: 'center', lineHeight: '1.6', marginBottom: '48px' }}>
            Discover trending movies, explore detailed film information, and get personalized recommendations powered by intelligent movie matching algorithms. Your entertainment hub for action, sci-fi, drama, comedy, and more.
          </p>

          <div className="profile-stats-grid">
            <div className="card-surface">
              <div className="card-surface-gradient"></div>
              <FaBookmark className="card-bg-icon" />
              <h3 className="card-stat-value">{watchLaterList.length}+</h3>
              <p className="card-stat-label">Watchlist</p>
            </div>

            <div className="card-surface">
              <div className="card-surface-gradient"></div>
              <FaHeart className="card-bg-icon" />
              <h3 className="card-stat-value">{favorites.length}+</h3>
              <p className="card-stat-label">Favorites</p>
            </div>

            <div className="card-surface">
              <div className="card-surface-gradient"></div>
              <FaShapes className="card-bg-icon" />
              <h3 className="card-stat-value">10+</h3>
              <p className="card-stat-label">Genres Explored</p>
            </div>
          </div>

          <div style={{ marginTop: '32px', marginBottom: '64px' }}>
            <button className="profile-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt style={{ fontSize: '18px' }} />
              Logout
            </button>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Profile;