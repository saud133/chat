import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './ServicesPage.css';

const ServicesPage = () => {
  const { t, isRTL } = useLanguage();

  const services = [
    {
      icon: '⚖️',
      title: t('legalConsultations'),
      description: t('legalConsultationsDesc') || 'Professional legal advice and consultation services'
    },
    {
      icon: '📝',
      title: t('contractDrafting'),
      description: t('contractDraftingDesc') || 'Custom contract drafting tailored to your specific needs'
    },
    {
      icon: '📑',
      title: t('contractReview'),
      description: t('contractReviewDesc') || 'Thorough review and analysis of existing contracts'
    },
    {
      icon: '📚',
      title: t('legalMemorandums'),
      description: t('legalMemorandumsDesc') || 'Professional legal memorandum writing services'
    }
  ];

  return (
    <div className={`services-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="services-container">
        <div className="services-header">
          <h1>{t('ourServicesTitle')}</h1>
          <p>{t('ourServicesSubtitle') || 'Professional legal services tailored to meet your business needs'}</p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">
                {service.icon}
              </div>
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
