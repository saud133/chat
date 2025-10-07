import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './ContactPage.css';
import { formatMessageText } from '../utils/textUtils';

const ContactPage = () => {
  const { t, isRTL } = useLanguage();

  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Load saved conversations
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("conversations") || "[]");
    setConversations(saved);
    if (saved.length > 0) {
      setCurrentConversationId(saved[0].id);
      setMessages(saved[0].messages || []);
    }
  }, []);

  // ✅ Save every update
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // ✅ Create / Load / Delete conversation
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

  const loadConversation = (id) => {
    setCurrentConversationId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv ? conv.messages : []);
  };

  const deleteConversation = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length ? updated[0].id : null);
      setMessages(updated.length ? updated[0].messages : []);
    }
  };

  // ✅ Helpers
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ✅ Generate / store userId
  const getUserId = () => {
    let uid = localStorage.getItem("chatUserId");
    if (!uid) {
      uid = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", uid);
    }
    return uid;
  };
  const userId = getUserId();

  // ✅ Input states
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  const detectDirection = (text) => /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // ✅ Handle button actions (from bot messages)
  const handleActionClick = async (action) => {
    if (action.type === 'button' && action.action === 'send_email_request') {
      try {
        const res = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            action: action.action,
            note: "User requested consultant verification"
          }),
        });
        const result = await res.text();
        alert("📧 تم إرسال الطلب للمستشار بنجاح.\n\n" + result);
      } catch (err) {
        console.error("❌ Error sending action:", err);
        alert("حدث خطأ أثناء إرسال الطلب للمستشار.");
      }
    }
  };

  // ✅ Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' && !selectedFile) return;
    setIsLoading(true);

    let convId = currentConversationId;
    if (!convId) {
      const title = inputValue.trim().slice(0, 30) || "New Chat";
      const newConv = { id: Date.now(), title, createdAt: new Date().toISOString(), messages: [] };
      setConversations([newConv, ...conversations]);
      convId = newConv.id;
      setCurrentConversationId(convId);
      setMessages([]);
    }

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

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('message', inputValue);
    if (selectedFile) formData.append('file', selectedFile, selectedFile.name);

    try {
      const response = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      const replyText = data.reply || data.text || data.final_markdown || JSON.stringify(data);
      const actions = data.actions || [];

      const botMessageId = Date.now();
      const botResponse = {
        id: botMessageId,
        text: "",
        actions,
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

      let index = 0;
      const interval = setInterval(() => {
        if (index < replyText.length) {
          const partial = replyText.slice(0, index + 1);
          setMessages(prev =>
            prev.map(m => (m.id === botMessageId ? { ...m, text: partial } : m))
          );
          index++;
        } else {
          clearInterval(interval);
          setMessages(prev =>
            prev.map(m => (m.id === botMessageId ? { ...m, text: replyText } : m))
          );
        }
      }, 10);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: "❌ حدث خطأ أثناء الاتصال بالخادم",
          isUser: false,
          sender: t('bot'),
          timestamp: new Date()
        }
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className={`contact-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* ===== Sidebar ===== */}
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
          {conversations.map(c => (
            <div
              key={c.id}
              className={`conversation-item ${currentConversationId === c.id ? 'active' : ''}`}
              onClick={() => loadConversation(c.id)}
            >
              <div className="conversation-content">
                <div className="conversation-title">{c.title}</div>
                <div className="conversation-date">{formatDate(c.createdAt)}</div>
              </div>
              <button className="delete-conversation-btn" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Chat Main ===== */}
      <div className={`chat-main ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <div className="chat-header">
          <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
          <h2>{t('contactSupport')}</h2>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
              <div className="message-content">
                {message.text && (
                  <div
                    className="message-text"
                    style={{
                      direction: detectDirection(message.text),
                      textAlign: detectDirection(message.text) === 'rtl' ? 'right' : 'left'
                    }}
                  >
                    {formatMessageText(message.text)}
                  </div>
                )}

                {/* ✅ Display action buttons if exist */}
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
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ===== Input Area ===== */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          {selectedFile && (
            <div className="file-preview">
              {selectedFile.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(selectedFile)} alt="preview" className="preview-image" />
              ) : (
                <div className="preview-file">📎 {selectedFile.name}</div>
              )}
              <button type="button" className="remove-file" onClick={() => setSelectedFile(null)}>✕</button>
            </div>
          )}

          <div className="input-container">
            <label htmlFor="file-upload" className="file-upload-btn">+</label>
            <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: "none" }} />
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('typeMessage')}
              className="chat-input"
              rows={1}
              style={{
                direction: detectDirection(inputValue),
                textAlign: detectDirection(inputValue) === 'rtl' ? 'right' : 'left'
              }}
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
