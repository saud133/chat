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
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{file, previewUrl, kind:'image'|'file'}]
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  // RTL/LTR detector
  const detectDirection = (text) => /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';

  // Create new conversation
  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: `Conversation ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: []
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setCurrentConversationId(newConv.id);
    setMessages([]);
  };

  // Load conversation
  const loadConversation = (id) => {
    setCurrentConversationId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv ? conv.messages : []);
  };

  // Delete conversation
  const deleteConversation = (id) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length ? updated[0].id : null);
      setMessages(updated.length ? updated[0].messages : []);
    }
  };

  // File selection (multiple)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = files.map(f => ({
      file: f,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      kind: f.type.startsWith("image/") ? "image" : "file",
      name: f.name
    }));
    setUploadedFiles(prev => [...prev, ...items]);
    // reset input
    e.target.value = null;
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Actions click (from bot)
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
        const resultText = await res.text();

        // Add system confirmation as a bot message in the chat
        const confirmMsg = {
          id: Date.now(),
          text: "📧 تم إرسال الطلب للمستشار للتأكد من نظامية وصحة الرد.",
          isUser: false,
          sender: t('bot'),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMsg]);
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversationId
              ? { ...c, messages: [...(c.messages || []), confirmMsg] }
              : c
          )
        );

        // (Optional) you can log resultText if needed
        console.log("send_email_request:", resultText);
      } catch (err) {
        console.error("❌ Error sending action:", err);
        const failMsg = {
          id: Date.now(),
          text: "❌ حدث خطأ أثناء إرسال الطلب للمستشار.",
          isUser: false,
          sender: t('bot'),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, failMsg]);
        setConversations(prev =>
          prev.map(c =>
            c.id === currentConversationId
              ? { ...c, messages: [...(c.messages || []), failMsg] }
              : c
          )
        );
      }
    }
  };

  // Message toolbar functions
  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Message copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLikeMessage = (messageId) => {
    console.log('Liked message:', messageId);
    // You could implement like functionality here
  };

  const handleDislikeMessage = (messageId) => {
    console.log('Disliked message:', messageId);
    // You could implement dislike functionality here
  };

  const handleShareMessage = (text) => {
    if (navigator.share) {
      navigator.share({
        title: 'Chat Message',
        text: text,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      handleCopyMessage(text);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' && uploadedFiles.length === 0) return;
    setIsLoading(true);

    let convId = currentConversationId;
    // Create conversation if none
    if (!convId) {
      const title = inputValue.trim().slice(0, 30) || "New Chat";
      const newConv = {
        id: Date.now(),
        title,
        createdAt: new Date().toISOString(),
        messages: []
      };
      setConversations([newConv, ...conversations]);
      convId = newConv.id;
      setCurrentConversationId(convId);
      setMessages([]);
    }

    // Create user message
    const userMsg = {
      id: Date.now(),
      text: inputValue,
      files: uploadedFiles, // keep list for rendering
      isUser: true,
      sender: userId,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Save to conversation
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          const updatedMessages = [...(c.messages || []), userMsg];
          // set title from first message
          const newTitle = c.messages?.length === 0
            ? (inputValue.trim().slice(0, 30) || c.title)
            : c.title;
          return { ...c, title: newTitle, messages: updatedMessages };
        }
        return c;
      })
    );

    // reset input
    setInputValue('');
    setUploadedFiles([]);

    // Prepare formData
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('message', userMsg.text || "");

    // append multiple files
    userMsg.files.forEach((fObj, idx) => {
      const key = fObj.kind === 'image' ? `ImageId_${Date.now()}_${idx}` : `FileId_${Date.now()}_${idx}`;
      formData.append(key, fObj.file, fObj.name);
    });

    try {
      const response = await fetch("https://saudg.app.n8n.cloud/webhook/chat-webhook", {
        method: "POST",
        body: formData,
      });

      // Try JSON first
      let parsed = {};
      let replyText = "";
      let actions = [];
      try {
        parsed = await response.json();
        replyText = parsed.reply || parsed.text || parsed.final_markdown || JSON.stringify(parsed);
        actions = Array.isArray(parsed.actions) ? parsed.actions : [];
      } catch {
        // fallback text
        const asText = await response.text();
        replyText = asText || " ";
        actions = [];
      }

      // Create bot placeholder (typing)
      const botMessageId = Date.now();
      const botResponse = {
        id: botMessageId,
        text: "",
        actions,
        showActions: false, // 👈 لا نعرض الأزرار إلا بعد اكتمال الكتابة
        isUser: false,
        sender: t('bot'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

      // typing effect
      let index = 0;
      const typingSpeed = 10; // keep the same effect speed as you prefer
      const interval = setInterval(() => {
        if (index < replyText.length) {
          const partial = replyText.slice(0, index + 1);
          setMessages(prev =>
            prev.map(m => (m.id === botMessageId ? { ...m, text: partial } : m))
          );
          index++;
        } else {
          clearInterval(interval);
          // finalize text and then show actions
          setMessages(prev =>
            prev.map(m =>
              m.id === botMessageId ? { ...m, text: replyText, showActions: true } : m
            )
          );
          // persist to conversation
          setConversations(prev =>
            prev.map(c =>
              c.id === convId
                ? {
                    ...c,
                    messages: (c.messages || []).map(m =>
                      m.id === botMessageId ? { ...m, text: replyText, showActions: true } : m
                    )
                  }
                : c
            )
          );
        }
      }, typingSpeed);

      // also persist placeholder (initially empty text)
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, messages: [...(c.messages || []), botResponse] } : c
        )
      );
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
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, messages: [...(c.messages || []), errorMessage] } : c
        )
      );
    }

    setIsLoading(false);
  };

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

      {/* Main Chat */}
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

                {/* Files inside message (for user messages) */}
                {Array.isArray(message.files) && message.files.length > 0 && (
                  <div className="message-files">
                    {message.files.map((f, idx) => (
                      <div key={idx}>
                        {f.kind === "image" ? (
                          <img src={f.previewUrl} alt={f.name} className="chat-image" />
                        ) : (
                          <div className="file-message">📎 {f.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions AFTER typing only */}
                {message.actions && message.actions.length > 0 && message.showActions && (
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

                {/* Message toolbar for assistant messages only */}
                {!message.isUser && message.text && (
                  <div className="message-toolbar">
                    <button
                      className="toolbar-button"
                      onClick={() => handleCopyMessage(message.text)}
                      title="Copy message"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="toolbar-button"
                      onClick={() => handleLikeMessage(message.id)}
                      title="Like message"
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <button
                      className="toolbar-button"
                      onClick={() => handleDislikeMessage(message.id)}
                      title="Dislike message"
                    >
                      <ThumbsDown size={16} />
                    </button>
                    <button
                      className="toolbar-button"
                      onClick={() => handleShareMessage(message.text)}
                      title="Share message"
                    >
                      <Share size={16} />
                    </button>
                  </div>
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

        {/* Input Area */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          {uploadedFiles.length > 0 && (
            <div className="uploaded-preview">
              {uploadedFiles.map((f, idx) => (
                <div key={idx} className="preview-item">
                  {f.kind === "image" ? (
                    <img src={f.previewUrl} alt={f.name} className="preview-image" />
                  ) : (
                    <div className="preview-file">📎 {f.name}</div>
                  )}
                  <button type="button" className="remove-file" onClick={() => removeUploadedFile(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="input-container">
            <label htmlFor="file-upload" className="file-upload-btn">+</label>
            <input id="file-upload" type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />
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
            <button type="submit" className="send-button" disabled={isLoading || (inputValue.trim() === '' && uploadedFiles.length === 0)}>
              {t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
