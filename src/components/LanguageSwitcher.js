import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, isRTL } = useLanguage();

  return (
    <div className="language-switcher">
      <button 
        onClick={toggleLanguage}
        className={`lang-button ${isRTL ? 'rtl' : 'ltr'}`}
        aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
      >
        <span className="lang-flag">
          {language === 'en' ? '🇸🇦' : '🇺🇸'}
        </span>
        <span className="lang-text">
          {language === 'en' ? 'العربية' : 'English'}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
