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

  // ✅ Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("conversations") || "[]");
    setConversations(saved);
    if (saved.length > 0) {
      setCurrentConversationId(saved[0].id);
      setMessages(saved[0].messages || []);
    }
  }, []);

  // ✅ Save to localStorage
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // ✅ Create new conversation
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

  // ✅ Load conversation
  const loadConversation = (id) => {
    setCurrentConversationId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv ? conv.messages : []);
  };

  // ✅ Delete conversation
  const deleteConversation = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length ? updated[0].id : null);
      setMessages(updated.length ? updated[0].messages : []);
    }
  };

  // ✅ Format date
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
  const textareaRef = useRef(null);

  // ✅ Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // ✅ Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  // ✅ Handle file select
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // ✅ Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' && !selectedFile) return;
    setIsLoading(true);

    let convId = currentConversationId;

    // 1️⃣ Create new conversation if needed
    if (!convId) {
      const title = inputValue.trim().slice(0, 30);
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

    // 2️⃣ Add user message
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

    // Update conversation
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          const updatedMessages = [...c.messages, newMessage];
          return {
            ...c,
            title: c.messages.length === 0 ? inputValue.trim().slice(0, 30) : c.title,
            messages: updatedMessages
          };
        }
        return c;
      })
    );

    // ✅ Prepare formData for n8n webhook
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('message', inputValue);

    if (selectedFile) {
      const fileId = selectedFile.type.startsWith("image/")
        ? `ImageId_${Date.now()}`
        : `FileId_${Date.now()}`;
      formData.append(fileId, selectedFile, selectedFile.name);
    }

    try {
      const response = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
        method: "POST",
        body: formData,
      });

      let replyText = "";
      try {
        const data = await response.json();
        replyText = data.reply || data.text || data.final_markdown || JSON.stringify(data);
      } catch {
        replyText = await response.text();
      }

      // ✨ كتابة تدريجية مثل ChatGPT
      const botMessageId = Date.now();
      const botResponse = {
        id: botMessageId,
        text: "",
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

      let index = 0;
      const typingSpeed = 20; // سرعة الكتابة
      const interval = setInterval(() => {
        if (index < replyText.length) {
          const partialText = replyText.slice(0, index + 1);
          setMessages(prev =>
            prev.map(m => (m.id === botMessageId ? { ...m, text: partialText } : m))
          );
          index++;
        } else {
          clearInterval(interval);
          // ✅ Save reply after finish
          setConversations(prev =>
            prev.map(c =>
              c.id === convId
                ? { ...c, messages: [...c.messages, { ...botResponse, text: replyText }] }
                : c
            )
          );
        }
      }, typingSpeed);

    } catch (error) {
      console.error("❌ Fetch error:", error);
      const errorMessage = {
        id: Date.now(),
        text: "❌ حدث خطأ أثناء الاتصال بالخادم",
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`contact-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
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
          {conversations.map(conversation => (
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
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Main */}
      <div className={`chat-main ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <div className="chat-header">
          <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
          <h2>{t('contactSupport')}</h2>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
              <div className="message-content">
                {message.text && <div className="message-text">{formatMessageText(message.text)}</div>}
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

        {/* Input */}
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
