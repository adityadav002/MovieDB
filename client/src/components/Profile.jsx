import React from "react";
import "../style/Profile.css";
import { useState, useEffect } from "react";
import api from "../utils/api";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [watchLaterList, setWatchLaterList] = useState([]);
  const [favorites, setFavorites] = useState([]);

    useEffect(() => {
    const fetchWatchLater = async () => {
        const token = localStorage.getItem("token");

        if (!token || token === "undefined") return;

        try {
        const res = await api.get("/api/watch");
        setWatchLaterList(res.data);
        } catch (err) {
            if (err.response?.status !== 401) {
                // Interceptor handles 500s etc.
            }
        }
    };

    fetchWatchLater();
    }, []);

    useEffect(() => {
    const fetchFavorites = async () => {
        const token = localStorage.getItem("token");
        if (!token || token === "undefined") return;

        try {
        const res = await api.get("/api/favorites");
        setFavorites(res.data);
        } catch (err) {
            if (err.response?.status !== 401) {
                // Interceptor handles 500s etc.
            }
        }
    };

    fetchFavorites();
    }, []);

  return (
    <section className="profile-section">
        <br />
        <br />
      <div className="profile-content">

        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <h2 className="profile-title">
          {user?.name}
        </h2>

        <div className="profile-info">
          <div className="info-card">
            <h2>{user?.email}</h2>
          </div>
        </div>

        <hr />
        <h2 className="profile-title">
             Explorer Profile
          </h2>

          {/* User Description */}
          <p className="profile-description">
            Discover trending movies, explore detailed film information,
            and get personalized recommendations powered by intelligent
            movie matching algorithms. Your entertainment hub for action,
            sci-fi, drama, comedy, and more.
          </p>

          <div className="profile-stats">
            <div className="stat-card">
                <h3>{watchLaterList.length}+</h3>
                <p>Watchlist</p>
            </div>

            <div className="stat-card">
                <h3>{favorites.length}+</h3>
                <p>Favorites</p>
            </div>

            <div className="stat-card">
              <h3>10+</h3>
              <p>Genres Explored</p>
            </div>
          </div>

      </div>
    </section>
  );
};

export default Profile;