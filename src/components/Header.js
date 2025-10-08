import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

const Header = () => {
  const { t, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <header className={`header ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="header-container">
        <div className="logo">
          <h1>Yemnnak</h1>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>
            {t('home')}
          </Link>
          <Link to="/services" className="nav-link" onClick={closeMobileMenu}>
            {t('ourServices')}
          </Link>
          {isAuthenticated && (
            <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>
              {t('contact')}
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/chat" className="nav-link" onClick={closeMobileMenu}>
              {t('chat')}
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
              Dashboard
            </Link>
          )}
          <LanguageSwitcher />
          {isAuthenticated && (
            <div className="user-menu">
              <span className="user-name">
                {user?.name || user?.email}
              </span>
              <button 
                onClick={handleLogout}
                className="logout-btn"
                title={t('logout')}
              >
                {t('logout')}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;