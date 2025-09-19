import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './HomePage.css';

const HomePage = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const handleChatClick = () => {
    navigate('/chat');
  };
  
  const handleServicesClick = () => {
    navigate('/services');
  };
  
  return (
    <div className={`homepage ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="hero-section">
        <div className="hero-content">
          <h1>{t('welcomeTitle')}</h1>
          <p>{t('welcomeSubtitle')}</p>
          <div className="hero-features">
            <div className="feature clickable" onClick={handleChatClick}>
              <h3>{t('realTimeChat')}</h3>
              <p>{t('realTimeChatDesc')}</p>
            </div>
            <div className="feature clickable" onClick={handleServicesClick}>
              <h3>{t('ourServices')}</h3>
              <p>{t('ourServicesDesc')}</p>
            </div>
            <div className="feature">
              <h3>{t('analytics')}</h3>
              <p>{t('analyticsDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
