import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; 2024 Yemnnak. {t('allRightsReserved')}</p>
      </div>
    </footer>
  );
};

export default Footer;