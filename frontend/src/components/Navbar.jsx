import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">₹</div>
          <span>Price<span style={{ color: 'var(--primary-light)' }}>Compt</span></span>
        </Link>

        {/* Global Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <span className="navbar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products or paste Amazon / Flipkart URL..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
        </form>

        {/* Navigation Links */}
        <nav className={`navbar-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          <Link
            to="/search"
            className={`navbar-link ${location.pathname === '/search' ? 'active' : ''}`}
          >
            Explore
          </Link>
          <Link
            to="/deals"
            className={`navbar-link ${location.pathname === '/deals' ? 'active' : ''}`}
          >
            🔥 Deals & Coupons
          </Link>

          {user ? (
            <div className="navbar-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="navbar-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="navbar-user-avatar">
                  {getInitials(user.name)}
                </div>
                <span>{user.name?.split(' ')[0] || 'Account'}</span>
                <span style={{ fontSize: '0.75rem', marginLeft: '2px' }}>▼</span>
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Signed in as <br /><strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/dashboard" className="navbar-dropdown-item">
                    📊 My Dashboard & Alerts
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="navbar-dropdown-item" style={{ color: 'var(--accent-light)' }}>
                      ⚙️ Admin Portal
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    style={{ color: 'var(--error)' }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="navbar-btn navbar-btn-ghost">
                Sign In
              </Link>
              <Link to="/signup" className="navbar-btn navbar-btn-primary">
                Join Free
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
