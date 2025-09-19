// Utility function to convert URLs in text to clickable links
export const makeLinksClickable = (text) => {
  if (!text) return text;
  
  // URL regex pattern that matches http, https, www, and common domains
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  
  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      // Ensure the URL has a protocol
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a 
          key={index} 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#3b82f6', 
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Function to format message text with clickable links
export const formatMessageText = (text) => {
  if (!text) return text;
  
  // Split by URLs and create clickable links
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a 
          key={index} 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: 'inherit', 
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};
