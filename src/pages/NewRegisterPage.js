import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const NewRegisterPage = () => {
  const { t, isRTL } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = t('nameRequired') || 'Name is required';
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired') || 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch') || 'Passwords do not match';
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
      // Simulate API call - REPLACE THIS WITH YOUR ACTUAL API ENDPOINT
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user session
      const user = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        loginMethod: 'email'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      login(user);
      
      // Navigate to home or previous page
      navigate('/', { replace: true });
    } catch (error) {
      setErrors({ submit: t('loginError') || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth - REPLACE THIS WITH YOUR ACTUAL API ENDPOINT
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email: 'user@gmail.com',
        name: 'Google User',
        loginMethod: 'google'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      login(user);
      
      navigate('/', { replace: true });
    } catch (error) {
      setErrors({ submit: t('googleLoginError') || 'Google registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Microsoft OAuth - REPLACE THIS WITH YOUR ACTUAL API ENDPOINT
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email: 'user@outlook.com',
        name: 'Microsoft User',
        loginMethod: 'microsoft'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      login(user);
      
      navigate('/', { replace: true });
    } catch (error) {
      setErrors({ submit: t('microsoftLoginError') || 'Microsoft registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t('signUp')}</h1>
          <p className="auth-subtitle">
            {t('createAccount') || 'Create a new account to get started'}
          </p>
        </div>

        <div className="auth-form-container">
          {/* Social Login Buttons */}
          <div className="social-login">
            <button 
              className="social-btn google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
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
              type="button"
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.submit && (
              <div className="auth-error auth-error-box">
                {errors.submit}
              </div>
            )}

            <div className="auth-input-group">
              <label htmlFor="name" className="auth-label">{t('name') || 'Name'}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`auth-input ${errors.name ? 'auth-input-error' : ''}`}
                placeholder={t('enterName') || 'Enter your name'}
                autoComplete="name"
              />
              {errors.name && <span className="auth-error">{errors.name}</span>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                placeholder={t('enterEmail') || 'Enter your email'}
                autoComplete="email"
              />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="password" className="auth-label">{t('password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                placeholder={t('enterPassword') || 'Enter your password'}
                autoComplete="new-password"
              />
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword" className="auth-label">{t('confirmPassword') || 'Confirm Password'}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                placeholder={t('confirmPasswordPlaceholder') || 'Confirm your password'}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (t('loading') || 'جاري الإرسال...') : t('signUp')}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              {t('alreadyHaveAccount')}
              {' '}
              <Link to="/login" className="auth-link-button">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRegisterPage;

