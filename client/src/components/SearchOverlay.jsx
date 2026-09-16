import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock } from 'react-icons/fi';
import { searchMovies, searchPerson } from '../services/tmdbSearch';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../style/SearchOverlay.css';

const SearchOverlay = ({ onClose }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('Content');
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const tabs = ['Content', 'Cast & Crew'];

  useEffect(() => {
    // Load recent searches on mount
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not load recent searches", e);
    }

    // Auto-focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Debounced Search API Call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    setError(null);
    let isMounted = true;

    const timer = setTimeout(async () => {
      try {
        if (activeTab === 'Cast & Crew') {
          const data = await searchPerson(query);
          if (isMounted) {
            setResults(data?.results ? data.results.slice(0, 10) : (data?.id ? [data] : []));
          }
        } else {
          const data = await searchMovies(query, 1);
          if (isMounted) {
            setResults(data?.results ? data.results.slice(0, 10) : []);
          }
        }
        if (isMounted) setSelectedIndex(-1);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, activeTab]);

  const addRecentSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      // Remove duplicate if exists, add to front, keep max 10
      const filtered = prev.filter(q => q.toLowerCase() !== searchQuery.toLowerCase());
      const updated = [searchQuery, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch (e) {
        console.error("Could not save recent searches", e);
      }
      return updated;
    });
  };

  const removeRecentSearch = (e, queryToRemove) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== queryToRemove);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSelectResult = (item) => {
    addRecentSearch(query || item.title || item.name);
    onClose();
    if (activeTab === 'Content') {
      if (user) {
        api.post("/api/history", {
          movieId: item.id,
          title: item.title,
          year: item.release_date?.substring(0, 4) || "Unknown",
          rating: item.vote_average,
          img: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null
        }).catch(err => console.error("Failed to add to history", err));
      }
      navigate(`/detail/${item.id}`);
    } else {
      // If it's an actor, we might navigate to actor page or search
      navigate(`/discover?q=${encodeURIComponent(item.name)}`);
    }
  };

  const handleSeeAll = () => {
    if (query.trim()) {
      addRecentSearch(query);
      onClose();
      navigate(`/discover?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectResult(results[selectedIndex]);
      } else if (query.trim()) {
        handleSeeAll();
      }
    }
  };

  return (
    <div className="search-overlay-container" onClick={onClose}>
      <div className="search-overlay-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Search Input Area */}
        <div className="search-input-wrapper">
          <FiSearch className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-large-input"
            placeholder="Search for Movies, Shows, Anime, Cast & Crew or Users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div className="search-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`search-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Area */}
        <div className="search-body">
          {query.trim() === '' ? (
            <div className="recent-searches-container">
              <div className="recent-searches-header">
                <h3>RECENT SEARCHES</h3>
                {recentSearches.length > 0 && (
                  <button onClick={clearHistory} className="clear-history-btn">Clear history</button>
                )}
              </div>
              
              {recentSearches.length > 0 ? (
                <div className="recent-searches-list">
                  {recentSearches.map((rs, idx) => (
                    <div 
                      key={idx} 
                      className="recent-search-item"
                      onClick={() => setQuery(rs)}
                    >
                      <div className="rs-left">
                        <FiClock className="rs-icon" />
                        <span>{rs}</span>
                      </div>
                      <button 
                        className="rs-remove" 
                        onClick={(e) => removeRecentSearch(e, rs)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="recent-search-empty">No recent searches</div>
              )}
            </div>
          ) : (
            <div className="search-results-container">
              {loading && results.length === 0 ? (
                <div className="search-loading">Searching...</div>
              ) : error ? (
                <div className="search-error">Unable to search right now. Please try again.</div>
              ) : results.length > 0 ? (
                <div className="results-grid">
                  {results.map((item, idx) => {
                    const posterUrl = item.poster_path || item.profile_path 
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path || item.profile_path}`
                        : '/no_poster_found.png';
                    const title = item.title || item.name;
                    const year = item.release_date ? item.release_date.substring(0, 4) : item.release_year;

                    return (
                      <div 
                        key={item.id} 
                        className={`result-card ${selectedIndex === idx ? 'selected' : ''}`}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <div className="result-card-poster-wrapper">
                          <img 
                            src={posterUrl} 
                            alt={title} 
                            className="result-card-poster" 
                            onError={(e) => { e.target.src = '/no_poster_found.png' }} 
                          />
                        </div>
                        <div className="result-card-details">
                          <div className="result-card-title">{title}</div>
                          {year && <div className="result-card-year">{year}</div>}
                          {item.character && <div className="result-card-character">{item.character}</div>}
                        </div>
                      </div>
                    );
                  })}
                  <button className="see-all-results-btn grid-full-width" onClick={handleSeeAll}>
                    See all results for "{query}"
                  </button>
                </div>
              ) : (
                <div className="search-no-results">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchOverlay;
