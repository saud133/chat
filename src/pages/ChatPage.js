import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatMessageText } from '../utils/textUtils';
import './ChatPage.css';

const ChatPage = () => {
  const { t, isRTL } = useLanguage();
  
  // Generate or get userId from localStorage
  const getUserId = () => {
    let uid = localStorage.getItem("chatUserId");
    if (!uid) {
      uid = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", uid);
    }
    return uid;
  };

  const userId = getUserId();

  // Generate unique SessionID
  const generateSessionId = () => {
    return "session-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now();
  };

  // Generate unique file identifiers with UUID-like format
  const generateFileId = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return `FileId_${uuid}`;
  };

  const generateImageId = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return `ImageId_${uuid}`;
  };

  // State for conversations
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('chatConversations');
    return saved ? JSON.parse(saved) : [];
  });

  // State for current conversation
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('currentSessionId');
    return saved || generateSessionId();
  });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sidebarRef = useRef(null);

  // Auto-resize textarea with max height (6-8 lines like ChatGPT)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // Approximate line height in pixels
      const maxLines = 8;
      const maxHeight = lineHeight * maxLines;
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = newHeight + 'px';
      
      // Enable scrolling if content exceeds max height
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [inputValue]);

  // Load conversation from localStorage
  const loadConversation = (conversationId) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      const sessionIdToUse = conversation.sessionId || generateSessionId();
      setCurrentConversationId(conversationId);
      setSessionId(sessionIdToUse);
      localStorage.setItem('currentSessionId', sessionIdToUse);
      setMessages(conversation.messages);
    }
  };

  // Create new conversation
  const createNewConversation = () => {
    const newSessionId = generateSessionId();
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

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
    
    setCurrentConversationId(newConversation.id);
    setSessionId(newSessionId);
    localStorage.setItem('currentSessionId', newSessionId);
    setMessages(newConversation.messages);
  };

  // Delete conversation
  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
    
    if (currentConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        loadConversation(updatedConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  // Update conversation title
  const updateConversationTitle = (conversationId, title) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, title } : conv
    );
    setConversations(updatedConversations);
    localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
  };

  // Initialize with first conversation or create new one
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    } else if (!currentConversationId) {
      loadConversation(conversations[0].id);
    }
  }, []);

  // Save sessionId to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('currentSessionId', sessionId);
    }
  }, [sessionId]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' && !selectedFile) return;

    setIsLoading(true);

    // User message
    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      file: selectedFile,
      isUser: true,
      sender: userId,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setSelectedFile(null);

    // Update conversation title if it's the first user message
    if (messages.length === 1) {
      const title = inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue;
      updateConversationTitle(currentConversationId, title);
    }

    const userInput = inputValue;

    try {
      // Prepare webhook payload with sessionId and file information
      const webhookPayload = {
        userId: userId,
        sessionId: sessionId,
        message: userInput || "", // Ensure message is never undefined
        attachments: []
      };

      // Add file information if a file is selected
      if (selectedFile) {
        webhookPayload.attachments.push({
          fileId: selectedFile.fileId,
          fileName: selectedFile.fileName,
          fileType: selectedFile.fileType,
          fileData: selectedFile.fileUrl
        });
      }

      // Send message to n8n with userId, sessionId, and file info
      const response = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      });

      let replyText = "";

      try {
        const data = await response.json();
        replyText = data.message?.content || data.text || data.reply || JSON.stringify(data);
      } catch {
        replyText = await response.text();
      }

      // Bot response
      const botResponse = {
        id: messages.length + 2,
        text: replyText,
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);

      // Update conversation in localStorage
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: finalMessages }
          : conv
      );
      setConversations(updatedConversations);
      localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));

    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: t('errorMessage'),
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 10MB for base64 conversion)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size too large. Please select a file smaller than 10MB.');
        e.target.value = ''; // Clear the input
        return;
      }

      const fileId = file.type.startsWith("image/") ? generateImageId() : generateFileId();
      const fileType = file.type.startsWith("image/") ? "image" : "document";
      
      // Convert file to base64 for fileUrl
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileWithMetadata = {
          ...file,
          fileId: fileId,
          fileType: fileType,
          fileName: file.name,
          fileUrl: event.target.result, // base64 data URL
          timestamp: new Date().toISOString(),
          fileSize: file.size
        };
        setSelectedFile(fileWithMetadata);
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        e.target.value = ''; // Clear the input
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`chat-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <div ref={sidebarRef} className={`chat-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button 
            className="new-chat-btn"
            onClick={createNewConversation}
          >
            <span className="plus-icon">+</span>
            New Chat
          </button>
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
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
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <h2>{t('contactSupport')}</h2>
        </div>
        
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {message.text && <div className="message-text">{formatMessageText(message.text)}</div>}

                {message.file && message.file.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(message.file)}
                    alt="uploaded"
                    className="chat-image"
                  />
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
            <label htmlFor="file-upload" className="file-upload-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('typeMessage')}
                className="chat-input"
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                  // Allow Shift+Enter for new lines (default behavior)
                }}
              />

              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading || (inputValue.trim() === '' && !selectedFile)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"></path>
                  <path d="M22 2 11 13"></path>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
