import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div className="navbar-logo-icon">₹</div>
            <h3 style={{ margin: 0 }}>Price<span style={{ color: 'var(--primary-light)' }}>Compt</span></h3>
          </div>
          <p>
            India's smart price comparison engine. Compare real-time prices across Amazon, Flipkart, Croma, Reliance Digital, and Vijay Sales. Track price histories and never overpay again.
          </p>
          <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Status: <strong>Demo Mode (Sample Data)</strong></span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/search">All Products</Link>
          <Link to="/deals">Price Drops & Deals</Link>
          <Link to="/search?category=smartphones">Smartphones</Link>
          <Link to="/search?category=laptops">Laptops</Link>
          <Link to="/search?category=headphones">Audio & Headphones</Link>
        </div>

        <div className="footer-col">
          <h4>Supported Stores</h4>
          <a href="https://www.amazon.in" target="_blank" rel="noopener noreferrer">Amazon India</a>
          <a href="https://www.flipkart.com" target="_blank" rel="noopener noreferrer">Flipkart</a>
          <a href="https://www.croma.com" target="_blank" rel="noopener noreferrer">Croma</a>
          <a href="https://www.reliancedigital.in" target="_blank" rel="noopener noreferrer">Reliance Digital</a>
          <a href="https://www.vijaysales.com" target="_blank" rel="noopener noreferrer">Vijay Sales</a>
        </div>

        <div className="footer-col">
          <h4>User & Tools</h4>
          <Link to="/dashboard">Price Drop Alerts</Link>
          <Link to="/dashboard">Saved Wishlist</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/signup">Create Account</Link>
          <Link to="/admin">Admin Portal</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} PriceCompt. Built for transparent, data-driven shopping decisions. 
          Product names, logos, and brands are property of their respective owners.
        </p>
      </div>
    </footer>
  );
}
