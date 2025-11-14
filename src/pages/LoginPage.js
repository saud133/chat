// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const { t, isRTL } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('emailRequired') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid') || 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = t('passwordRequired') || 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordMinLength') || 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // هنا تضع استدعاء API الحقيقي لو حاب
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.email.split('@')[0],
        loginMethod: 'email'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      onLogin && onLogin(user);
    } catch (error) {
      setErrors({ submit: t('loginError') || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email: 'user@gmail.com',
        name: 'Google User',
        loginMethod: 'google'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      onLogin && onLogin(user);
    } catch (error) {
      setErrors({ submit: t('googleLoginError') || 'Google login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email: 'user@outlook.com',
        name: 'Microsoft User',
        loginMethod: 'microsoft'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      onLogin && onLogin(user);
    } catch (error) {
      setErrors({ submit: t('microsoftLoginError') || 'Microsoft login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`login-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="login-container">
        <div className="login-header">
          <h1>{t('loginTitle')}</h1>
          <p>{t('loginSubtitle')}</p>
        </div>

        <div className="login-form-container">
          {/* Social Login Buttons */}
          <div className="social-login">
            <button 
              className="social-btn google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('signInWithGoogle')}
            </button>
            
            <button 
              className="social-btn microsoft-btn"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              {t('signInWithMicrosoft')}
            </button>
          </div>

          <div className="divider">
            <span>{t('or') || 'or'}</span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder={t('enterEmail') || 'Enter your email'}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder={t('enterPassword') || 'Enter your password'}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <a href="#" className="forgot-password">{t('forgotPassword')}</a>
            </div>

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (t('loading') || 'Loading...') : t('signIn')}
            </button>
          </form>

          <div className="form-footer">
            <p>
              {t('dontHaveAccount')}
              {' '}
              <Link to="/register" className="toggle-form">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
