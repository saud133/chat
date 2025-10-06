import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './ContactPage.css';
import { formatMessageText } from '../utils/textUtils';

const ContactPage = () => {
  const { t, isRTL } = useLanguage();

  // ✅ Sidebar states
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Conversations + Messages states
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("conversations") || "[]");
    setConversations(saved);
    if (saved.length > 0) {
      setCurrentConversationId(saved[0].id);
      setMessages(saved[0].messages || []);
    }
  }, []);

  // ✅ Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // ✅ Create new conversation manually
  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: `Conversation ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: []
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
  };

  // ✅ Load a conversation
  const loadConversation = (id) => {
    setCurrentConversationId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv ? conv.messages : []);
  };

  // ✅ Delete a conversation
  const deleteConversation = (id) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length ? updated[0].id : null);
      setMessages(updated.length ? updated[0].messages : []);
    }
  };

  // ✅ Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // ✅ User ID
  const getUserId = () => {
    let uid = localStorage.getItem("chatUserId");
    if (!uid) {
      uid = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", uid);
    }
    return uid;
  };
  const userId = getUserId();

  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' && !selectedFile) return;
    setIsLoading(true);

    let convId = currentConversationId;

    // 1️⃣ إذا ما فيه محادثة → ننشئ واحدة جديدة بالعنوان من أول رسالة
    if (!convId) {
      const title = inputValue.trim().slice(0, 30); // أول 30 حرف من السؤال
      const newConv = {
        id: Date.now(),
        title: title || "New Chat",
        createdAt: new Date().toISOString(),
        messages: []
      };
      setConversations([newConv, ...conversations]);
      convId = newConv.id;
      setCurrentConversationId(convId);
      setMessages([]);
    }

    // 2️⃣ الرسالة الجديدة (المستخدم)
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      file: selectedFile,
      isUser: true,
      sender: userId,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setSelectedFile(null);

    // 3️⃣ تحديث المحادثة
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          const updatedMessages = [...c.messages, newMessage];
          return {
            ...c,
            title: c.messages.length === 0 ? inputValue.trim().slice(0, 30) : c.title, // 👈 العنوان = أول رسالة
            messages: updatedMessages
          };
        }
        return c;
      })
    );

    const userInput = inputValue;

    try {
      const response = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: userInput })
      });

      let replyText = "";
      let replyActions = [];

      try {
        const data = await response.json();
        replyText = data.reply || data.text || data.final_markdown || JSON.stringify(data);
        if (data.actions) replyActions = data.actions;
      } catch {
        replyText = await response.text();
      }

      const botResponse = {
        id: Date.now(),
        text: replyText,
        actions: replyActions,
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, messages: [...c.messages, botResponse] } : c
        )
      );

    } catch (error) {
      console.error("❌ Fetch error:", error);
      const errorMessage = {
        id: Date.now(),
        text: t('errorMessage') || "حدث خطأ أثناء الاتصال بالسيرفر ❌",
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
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
      } catch {
        alert("حدث خطأ أثناء إرسال الطلب ❌");
      }
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`contact-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <div ref={sidebarRef} className={`chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewConversation}>
            <span className="plus-icon">+</span>
            New Chat
          </button>
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span className="arrow-icon">{isSidebarOpen ? '←' : '→'}</span>
          </button>
        </div>

        <div className="conversations-list">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => loadConversation(conversation.id)}
            >
              <div className="conversation-content">
                <div className="conversation-title">{conversation.title}</div>
                <div className="conversation-date">{formatDate(conversation.createdAt)}</div>
              </div>
              <button
                className="delete-conversation-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
                title="Delete conversation"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <div className="chat-header">
          <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
          <h2>{t('contactSupport')}</h2>
          <p>{t('contactSubtitle')}</p>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
              <div className="message-content">
                <div className="message-sender">
                  {message.isUser ? `${t('you')} (${message.sender})` : message.sender}
                </div>
                {message.text && <div className="message-text">{formatMessageText(message.text)}</div>}
                {message.actions && message.actions.length > 0 && (
                  <div className="message-actions">
                    {message.actions.map((action, idx) => (
                      <button key={idx} className="action-button" onClick={() => handleActionClick(action)}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                {message.file && message.file.type.startsWith("image/") && (
                  <img src={URL.createObjectURL(message.file)} alt="uploaded" className="chat-image" />
                )}
                {message.file && !message.file.type.startsWith("image/") && (
                  <div className="file-message">📎 {message.file.name}</div>
                )}
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <label htmlFor="file-upload" className="file-upload-btn">+</label>
            <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: "none" }} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('typeMessage')}
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={isLoading || (inputValue.trim() === '' && !selectedFile)}>
              {t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
