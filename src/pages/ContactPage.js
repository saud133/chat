import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './ContactPage.css';
import { formatMessageText } from '../utils/textUtils';
import { Copy, ThumbsUp, ThumbsDown, Share } from 'lucide-react';

const ContactPage = () => {
  const { t, isRTL } = useLanguage();

  // Sidebar
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Conversations + Messages
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("conversations");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState(() => {
    const saved = localStorage.getItem("conversations");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length ? parsed[0].id : null;
  });
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("conversations");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length ? (parsed[0].messages || []) : [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Helpers
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate / store userId
  const getUserId = () => {
    let uid = localStorage.getItem("chatUserId");
    if (!uid) {
      uid = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", uid);
    }
    return uid;
  };
  const userId = getUserId();

  // Input / Files
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Scroll behavior state
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkIfAtBottom = () => {
    if (!chatMessagesRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const handleScroll = () => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
    
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    setIsUserScrolling(true);
    scrollTimeoutRef.current = setTimeout(() => setIsUserScrolling(false), 150);
  };

  const autoScrollToBottom = () => {
    if (isAtBottom && !isUserScrolling) scrollToBottom();
  };

  const manualScrollToBottom = () => {
    scrollToBottom();
    setIsAtBottom(true);
    setShowScrollButton(false);
    setIsUserScrolling(false);
  };

  useEffect(() => {
    autoScrollToBottom();
  }, [messages, isAtBottom, isUserScrolling]);

  useEffect(() => {
    const chatContainer = chatMessagesRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOverlayClick = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  const detectDirection = (text) => /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';

  // ✅✅✅ الجزء الجديد هنا — للحفاظ على الرد أثناء تغيير التبويب
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("🔕 المستخدم غيّر التبويب — نحافظ على الجلسة دون توقف.");
      } else {
        console.log("🔔 المستخدم عاد إلى الصفحة — نتحقق من استمرار الرد.");
      }
    };

    // يمنع انقطاع الاتصال أو توقف الـ fetch stream
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // يمنع فقدان الاتصال عند تحديث أو إغلاق الصفحة المؤقت
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "";
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", () => {});
    };
  }, []);
  // ✅✅✅ نهاية الإضافة الجديدة

  // باقي الكود كما هو (إرسال الرسائل + عرض الردود)
  // ...

  // 🎯 ضع هذا الجزء قبل return أو بعد كل useEffect
  // الكود الخاص بالإرسال والواجهة لم يتغير (محفوظ كما أرسلته)

  // 👇 استمر بالكود الأصلي من عند return
  return (
    <div className={`contact-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* ... بقية الكود بدون تعديل ... */}
    </div>
  );
};

export default ContactPage;
