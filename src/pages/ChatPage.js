import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { formatMessageText } from '../utils/textUtils';
import { trackChatUsage } from '../utils/usageTracker';
import './ChatPage.css';

const ChatPage = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // ✅ إنشاء أو استرجاع userId
  const getUserId = () => {
    let uid = localStorage.getItem("chatUserId");
    if (!uid) {
      uid = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", uid);
    }
    return uid;
  };
  const userId = getUserId();

  // ✅ Session ID ثابت
  const [sessionId, setSessionId] = useState(() => {
    const existing = localStorage.getItem('sessionId');
    if (existing) return existing;
    const newId = uuidv4();
    localStorage.setItem('sessionId', newId);
    return newId;
  });

  // ✅ الحالة العامة
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('chatConversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sidebarRef = useRef(null);

  // ✅ دالة تحويل base64 إلى Blob (مطلوبة للإرسال عبر FormData)
  function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  // ✅ جعل حقل الكتابة يتمدد تلقائيًا
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // ✅ تحميل المحادثة
  const loadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
    }
  };

  // ✅ إنشاء محادثة جديدة
  const createNewConversation = () => {
    const newSessionId = uuidv4();
    const newConversation = {
      id: Date.now().toString(),
      sessionId: newSessionId,
      title: 'New Chat',
      messages: [{
        id: 1,
        text: t('welcomeMessage') || "Hello! How can I help you today?",
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      }],
      createdAt: new Date()
    };
    const updated = [newConversation, ...conversations];
    setConversations(updated);
    localStorage.setItem('chatConversations', JSON.stringify(updated));
    setCurrentConversationId(newConversation.id);
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
    setMessages(newConversation.messages);
  };

  // ✅ حذف محادثة
  const deleteConversation = (conversationId) => {
    const updated = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updated);
    localStorage.setItem('chatConversations', JSON.stringify(updated));
    if (currentConversationId === conversationId) {
      if (updated.length > 0) loadConversation(updated[0].id);
      else createNewConversation();
    }
  };

  // ✅ تحديث عنوان المحادثة
  const updateConversationTitle = (conversationId, title) => {
    const updated = conversations.map(conv =>
      conv.id === conversationId ? { ...conv, title } : conv
    );
    setConversations(updated);
    localStorage.setItem('chatConversations', JSON.stringify(updated));
  };

  // ✅ تهيئة أول محادثة
  useEffect(() => {
    if (conversations.length === 0) createNewConversation();
    else if (!currentConversationId) loadConversation(conversations[0].id);
  }, []);

  // ✅ إغلاق الشريط الجانبي على الجوال عند النقر خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // ✅ إدخال متعدد الأسطر مثل ChatGPT
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ رفع الملفات
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const newFiles = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Please select a file smaller than 10MB.`);
        return;
      }

      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      const fileId = isImage ? `ImageId_${uuidv4()}` : `FileId_${uuidv4()}`;

      reader.onloadend = () => {
        newFiles.push({
          fileId,
          fileName: file.name,
          fileType: isImage ? 'image' : 'document',
          fileData: reader.result,
        });
        if (newFiles.length === files.length) {
          setUploadedFiles((prev) => [...prev, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // ✅ إرسال الرسالة (FormData)
  const handleSend = async () => {
    if (!message && uploadedFiles.length === 0) return;
    setIsLoading(true);

    // Track usage
    await trackChatUsage(userId, user);

    const newMessage = {
      id: messages.length + 1,
      text: message,
      files: uploadedFiles,
      isUser: true,
      sender: userId,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage('');
    setUploadedFiles([]);

    if (messages.length === 1) {
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      updateConversationTitle(currentConversationId, title);
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("sessionId", sessionId);
      formData.append("message", message || "");

      uploadedFiles.forEach((file) => {
        const blob = dataURLtoBlob(file.fileData);
        formData.append("data", blob, file.fileName);
      });

      for (let pair of formData.entries()) {
        console.log('🟢 FormData Entry:', pair[0], pair[1]);
      }
      

      const response = await fetch('https://saudg.app.n8n.cloud/webhook/chat-webhook', {
        method: 'POST',
        body: formData,
      });

      let replyText = "";
      try {
        const data = await response.json();
        replyText = data.message?.content || data.text || data.reply || JSON.stringify(data);
      } catch {
        replyText = await response.text();
      }

      const botResponse = {
        id: messages.length + 2,
        text: replyText,
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);

      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: finalMessages }
          : conv
      );
      setConversations(updatedConversations);
      localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));

    } catch (error) {
      console.error("❌ Fetch error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Error sending message.",
        isUser: false,
        sender: t('bot'),
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // ✅ واجهة المستخدم
  return (
    <div className={`chat-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* الشريط الجانبي */}
      <div ref={sidebarRef} className={`chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewConversation}>
            <span className="plus-icon">+</span> New Chat
          </button>
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span className="arrow-icon">{isSidebarOpen ? '←' : '→'}</span>
          </button>
        </div>

        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="conversation-content">
                <div className="conversation-title">{conv.title}</div>
                <div className="conversation-date">{formatDate(conv.createdAt)}</div>
              </div>
              <button
                className="delete-conversation-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                title="Delete conversation"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* منطقة الدردشة */}
      <div className={`chat-main ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <div className="chat-header">
          <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
          <h2>{t('contactSupport')}</h2>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
              <div className="message-content">
                {msg.text && <div className="message-text">{formatMessageText(msg.text)}</div>}
                {msg.files && msg.files.map((file, index) => (
                  <div key={index}>
                    {file.fileType === 'image'
                      ? <img src={file.fileData} alt={file.fileName} className="chat-image" />
                      : <div className="file-message">📎 {file.fileName}</div>}
                  </div>
                ))}
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* منطقة الإدخال */}
        <div className="chat-input-area">
          {uploadedFiles.length > 0 && (
            <div className="uploaded-preview">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="preview-item">
                  {file.fileType === 'image'
                    ? <img src={file.fileData} alt={file.fileName} className="preview-image" />
                    : <div className="preview-doc">📎 {file.fileName}</div>}
                  <button className="remove-file" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="input-row">
            <label className="upload-btn">
              +
              <input type="file" hidden multiple onChange={handleFileUpload} />
            </label>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              rows={1}
            />

            <button onClick={handleSend} disabled={isLoading || (!message && uploadedFiles.length === 0)}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
