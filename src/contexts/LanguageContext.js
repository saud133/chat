import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    home: 'Home',
    contact: 'Chat',
    chat: 'Contact Us',
    login: 'Login',
    logout: 'Logout',
    
    // Home Page
    welcomeTitle: 'Welcome to Yemnnak',
    welcomeSubtitle: 'Use legal AI with integrated chat capabilities and trusted review.',
    realTimeChat: 'Real-time Chat',
    realTimeChatDesc: 'Connect with your customers instantly through our advanced chat interface.',
    ourServices: 'Our Services',
    ourServicesDesc: 'Explore our comprehensive range of professional services.',
    analytics: 'Analytics',
    analyticsDesc: 'Get insights into your customer engagement and business performance.',
    
    // Contact Page
    contactSupport: 'Contact Support',
    contactSubtitle: "We're here to help! Send us a message and we'll get back to you.",
    typeMessage: 'Type your message here...',
    send: 'Send',
    you: 'You',
    bot: 'Bot',
    welcomeMessage: 'Hello! How can I help you today?',
    errorMessage: '⚠️ Sorry, there was a problem connecting to the server.',
    newChat: 'New Chat',
    copyMessage: 'Copy message',
    likeMessage: 'Like message',
    dislikeMessage: 'Dislike message',
    shareMessage: 'Share message',
    scrollToBottom: 'Scroll to bottom',
    
    // Login Page
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to your account to continue',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInWithGoogle: 'Sign in with Google',
    signInWithMicrosoft: 'Sign in with Microsoft',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    enterName: 'Enter your name',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    nameRequired: 'Name is required',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDoNotMatch: 'Passwords do not match',
    loginError: 'Login failed. Please try again.',
    googleLoginError: 'Google login failed. Please try again.',
    microsoftLoginError: 'Microsoft login failed. Please try again.',
    loading: 'Loading...',
    or: 'or',
    
    // Services Page
    ourServicesTitle: 'Our Services',
    ourServicesSubtitle: 'Professional legal services tailored to meet your business needs',
    legalConsultations: 'Legal Consultations',
    legalConsultationsDesc: 'Professional legal advice and consultation services',
    contractDrafting: 'Contract Drafting',
    contractDraftingDesc: 'Custom contract drafting tailored to your specific needs',
    contractReview: 'Contract Review',
    contractReviewDesc: 'Thorough review and analysis of existing contracts',
    legalMemorandums: 'Legal Memorandums Writing',
    legalMemorandumsDesc: 'Professional legal memorandum writing services',
    
    // Footer
    allRightsReserved: 'All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service'
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    contact: 'الدردشة',
    chat: 'اتصل بنا',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    
    // Home Page
    welcomeTitle: 'مرحباً بك في يمناك',
    welcomeSubtitle: 'استخدم الذكاء الاصطناعي القانوني مع إمكانيات الدردشة المتكاملة والمراجعة الموثوقة.',
    realTimeChat: 'الدردشة المباشرة',
    realTimeChatDesc: 'تواصل مع عملائك فوراً من خلال واجهة الدردشة المتقدمة.',
    ourServices: 'خدماتنا',
    ourServicesDesc: 'استكشف مجموعة شاملة من خدماتنا المهنية.',
    analytics: 'التحليلات',
    analyticsDesc: 'احصل على رؤى حول تفاعل العملاء وأداء الأعمال.',
    
    // Contact Page
    contactSupport: 'دعم العملاء',
    contactSubtitle: 'نحن هنا لمساعدتك! أرسل لنا رسالة وسنرد عليك.',
    typeMessage: 'اكتب رسالتك هنا...',
    send: 'إرسال',
    you: 'أنت',
    bot: 'البوت',
    welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    errorMessage: '⚠️ عذراً، حدثت مشكلة في الاتصال بالخادم.',
    newChat: 'دردشة جديدة',
    copyMessage: 'نسخ الرسالة',
    likeMessage: 'إعجاب بالرسالة',
    dislikeMessage: 'عدم إعجاب بالرسالة',
    shareMessage: 'مشاركة الرسالة',
    scrollToBottom: 'الانتقال للأسفل',
    
    // Login Page
    loginTitle: 'مرحباً بعودتك',
    loginSubtitle: 'سجل دخولك للمتابعة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signInWithGoogle: 'تسجيل الدخول بحساب جوجل',
    signInWithMicrosoft: 'تسجيل الدخول بحساب مايكروسوفت',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    createAccount: 'إنشاء حساب جديد',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    name: 'الاسم',
    confirmPassword: 'تأكيد كلمة المرور',
    enterName: 'أدخل اسمك',
    enterEmail: 'أدخل بريدك الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    confirmPasswordPlaceholder: 'أكد كلمة المرور',
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'البريد الإلكتروني غير صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    nameRequired: 'الاسم مطلوب',
    confirmPasswordRequired: 'يرجى تأكيد كلمة المرور',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    loginError: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    googleLoginError: 'فشل تسجيل الدخول بحساب جوجل. يرجى المحاولة مرة أخرى.',
    microsoftLoginError: 'فشل تسجيل الدخول بحساب مايكروسوفت. يرجى المحاولة مرة أخرى.',
    loading: 'جاري التحميل...',
    or: 'أو',
    
    // Services Page
    ourServicesTitle: 'خدماتنا',
    ourServicesSubtitle: 'خدمات قانونية مهنية مصممة لتلبية احتياجات عملك',
    legalConsultations: 'الاستشارات القانونية',
    legalConsultationsDesc: 'خدمات الاستشارة والنصيحة القانونية المهنية',
    contractDrafting: 'صياغة العقود',
    contractDraftingDesc: 'صياغة عقود مخصصة تناسب احتياجاتك الخاصة',
    contractReview: 'مراجعة العقود',
    contractReviewDesc: 'مراجعة وتحليل شامل للعقود الموجودة',
    legalMemorandums: 'كتابة المذكرات القانونية',
    legalMemorandumsDesc: 'خدمات كتابة المذكرات القانونية المهنية',
    
    // Footer
    allRightsReserved: 'جميع الحقوق محفوظة.',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة'
  }
};

// Function to detect browser language
const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('ar') ? 'ar' : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // First check if user has manually selected a language
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // If no manual selection, detect browser language
    return detectBrowserLanguage();
  });

  const [isRTL, setIsRTL] = useState(language === 'ar');

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
    setIsRTL(language === 'ar');
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isRTL,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
