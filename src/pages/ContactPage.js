import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './ContactPage.css';
import { formatMessageText } from '../utils/textUtils';

const ContactPage = () => {
  const { t, isRTL } = useLanguage();
  
  // توليد أو جلب userId من localStorage
  const getUserId = () => {
    let uid = localStorage.getItem("chatUserId");
    if (!uid) {
      uid = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", uid);
    }
    return uid;
  };

  const userId = getUserId();

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t('welcomeMessage') || "Hello! How can I help you today?",
      isUser: false,
      sender: t('bot'),
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ النسخة المعدلة من handleSendMessage
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' && !selectedFile) return;

    // رسالة المستخدم
    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      file: selectedFile,
      isUser: true,
      sender: userId,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setSelectedFile(null);

    const userInput = inputValue;

    try {
      // إرسال الرسالة إلى n8n مع userId
      const response = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userId,
          message: userInput 
        })
      });

      let replyText = "";
      let replyActions = [];

      try {
        // ✅ جرب أولاً قراءة الرد كـ JSON
        const data = await response.json();
        console.log("🔍 API Response:", data);

        replyText = data.reply 
                 || data.text 
                 || data.final_markdown 
                 || JSON.stringify(data);

        if (data.actions) {
          replyActions = data.actions;
        }
      } catch (err) {
        console.warn("⚠️ JSON parse failed, fallback to text:", err);

        // ✅ fallback: لو الرد مو JSON صالح → اقرأه كنص
        replyText = await response.text();
      }

      // رد البوت
      const botResponse = {
        id: messages.length + 2,
        text: replyText,
        actions: replyActions,
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("❌ Fetch error:", error);

      const errorMessage = {
        id: messages.length + 2,
        text: t('errorMessage') || "حدث خطأ أثناء الاتصال بالسيرفر ❌",
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleActionClick = async (action) => {
    if (action.type === "button" && action.action === "send_email_request") {
      try {
        const response = await fetch("https://saudg.app.n8n.cloud/webhook/email-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, lastMessage: messages[messages.length - 1].text })
        });

        const result = await response.json();
        alert(result.message || "تم إرسال الطلب بنجاح ✅");
      } catch (err) {
        alert("حدث خطأ أثناء إرسال الطلب ❌");
      }
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`contact-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="chat-container">
        <div className="chat-header">
          <h2>{t('contactSupport')}</h2>
          <p>{t('contactSubtitle')}</p>
        </div>
        
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {/* عرض اسم المرسل */}
                <div className="message-sender">
                  {message.isUser ? `${t('you')} (${message.sender})` : message.sender}
                </div>

                {message.text && <div className="message-text">{formatMessageText(message.text)}</div>}

                {/* عرض أزرار الأكشن */}
                {message.actions && message.actions.length > 0 && (
                  <div className="message-actions">
                    {message.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className="action-button"
                        onClick={() => handleActionClick(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* صورة مرفوعة */}
                {message.file && message.file.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(message.file)}
                    alt="uploaded"
                    className="chat-image"
                  />
                )}

                {/* ملف غير صورة */}
                {message.file && !message.file.type.startsWith("image/") && (
                  <div className="file-message">📎 {message.file.name}</div>
                )}

                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            {/* زر رفع الملف */}
            <label htmlFor="file-upload" className="file-upload-btn">+</label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('typeMessage')}
              className="chat-input"
            />

            <button type="submit" className="send-button">
              {t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
