// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';

const RegisterPage = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = t('nameRequired') || 'الرجاء إدخال الاسم الكامل';
    }

    if (!formData.email) {
      newErrors.email = t('emailRequired') || 'الرجاء إدخال البريد الإلكتروني';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid') || 'البريد الإلكتروني غير صالح';
    }

    if (!formData.mobile) {
      newErrors.mobile = t('mobileRequired') || 'الرجاء إدخال رقم الجوال';
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired') || 'الرجاء إدخال كلمة المرور';
    } else if (formData.password.length < 8) {
      newErrors.password =
        t('passwordMinLength') || 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        t('confirmPasswordRequired') || 'الرجاء تأكيد كلمة المرور';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        t('passwordsDoNotMatch') || 'كلمة المرور وتأكيدها غير متطابقين';
    }

    if (!formData.agree) {
      newErrors.agree =
        t('mustAgreeTerms') || 'يجب الموافقة على الشروط والأحكام قبل المتابعة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // هنا تربطها مع n8n أو API حقيقي
      /*
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
      */

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitSuccess(
        t('registerSuccess') ||
          'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.'
      );

      // بعد ثواني يرسله لصفحة تسجيل الدخول
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setSubmitError(
        err.message ||
          t('registerError') ||
          'حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-page ${isRTL ? 'rtl' : ''}`}>
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {t('registerTitle') || 'إنشاء حساب جديد'}
          </h1>
          <p className="auth-subtitle">
            {t('registerSubtitle') ||
              'أنشئ حسابك للوصول إلى منصة الاستشارات القانونية وإدارة طلباتك بسهولة.'}
          </p>
        </div>

        <div className="auth-form-container">
          {submitError && (
            <div className="auth-error-box">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="auth-error-box" style={{ background: '#ecfdf3', borderColor: '#bbf7d0', color: '#166534' }}>
              {submitSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label htmlFor="name" className="auth-label">
                {t('name') || 'الاسم الكامل'}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`auth-input ${errors.name ? 'auth-input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder={t('enterName') || 'اكتب اسمك الكامل'}
              />
              {errors.name && <div className="auth-error">{errors.name}</div>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">
                {t('email') || 'البريد الإلكتروني'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder={t('enterEmail') || 'example@email.com'}
              />
              {errors.email && <div className="auth-error">{errors.email}</div>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="mobile" className="auth-label">
                {t('mobile') || 'رقم الجوال'}
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                className={`auth-input ${errors.mobile ? 'auth-input-error' : ''}`}
                value={formData.mobile}
                onChange={handleChange}
                placeholder={t('enterMobile') || '05XXXXXXXX'}
              />
              {errors.mobile && <div className="auth-error">{errors.mobile}</div>}
            </div>

            <div className="auth-input-group">
              <label htmlFor="password" className="auth-label">
                {t('password') || 'كلمة المرور'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder={t('enterPassword') || '••••••••'}
              />
              {errors.password && (
                <div className="auth-error">{errors.password}</div>
              )}
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword" className="auth-label">
                {t('confirmPassword') || 'تأكيد كلمة المرور'}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`auth-input ${
                  errors.confirmPassword ? 'auth-input-error' : ''
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={
                  t('confirmPasswordPlaceholder') || 'أعد كتابة كلمة المرور'
                }
              />
              {errors.confirmPassword && (
                <div className="auth-error">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="auth-options">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  name="agree"
                  className="auth-checkbox"
                  checked={formData.agree}
                  onChange={handleChange}
                />
                <span>
                  {t('agreeWith') || 'أوافق على'}{' '}
                  <a href="/terms" className="auth-link" target="_blank" rel="noreferrer">
                    {t('terms') || 'الشروط والأحكام'}
                  </a>{' '}
                  {t('and') || 'و'}{' '}
                  <a href="/privacy" className="auth-link" target="_blank" rel="noreferrer">
                    {t('privacyPolicy') || 'سياسة الخصوصية'}
                  </a>
                </span>
              </label>
            </div>
            {errors.agree && <div className="auth-error">{errors.agree}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading
                ? t('loading') || 'جاري إنشاء الحساب...'
                : t('signUp') || 'إنشاء حساب'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              {t('alreadyHaveAccount') || 'لديك حساب بالفعل؟'}{' '}
              <Link to="/login" className="auth-link-button">
                {t('signIn') || 'تسجيل الدخول'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
