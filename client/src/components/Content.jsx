import React from "react";
import "../style/ContentStyle.css";

function Content() {
  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">Your Streaming Universe, Personalized</h1>
          <p className="hero-subtext">
            Discover, track, and organize every movie and show you love — all in one place.
            Build your ultimate Watchlist, keep up with your favorite genres, and pick up where you left off anytime, anywhere.
          </p>

          <div className="feature-tags">
            <span>🎬 Personalized Watchlist</span>
            <span>❤️ Favorite Shows & Films</span>
            <span>📱 Sync Across Devices</span>
          </div>
        </div>
      </div>
      <hr />
    </section>
  );
}

export default Content;