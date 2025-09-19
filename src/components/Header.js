import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

const Header = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Yemnnak</h1>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">
            {t('home')}
          </Link>
          <Link to="/services" className="nav-link">
            {t('ourServices')}
          </Link>
          {isAuthenticated && (
            <Link to="/contact" className="nav-link">
              {t('contact')}
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