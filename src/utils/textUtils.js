import React from "react";

export const formatMessageText = (text) => {
  if (!text) return text;

  // 1. استبدال newlines بعنصر <br/>
  let formatted = text.replace(/\\n/g, "\n");

  // 2. تقسيم النص لأسطر
  const lines = formatted.split("\n");

  return lines.map((line, idx) => {
    // 2.1 bold: **النص**
    let boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 2.2 روابط clickable
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    let parts = boldLine.split(urlRegex);

    return (
      <div key={idx} style={{ marginBottom: "4px" }}>
        {parts.map((part, i) => {
          if (urlRegex.test(part)) {
            const href = part.startsWith("http") ? part : `https://${part}`;
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#3b82f6",
                  textDecoration: "underline",
                  wordBreak: "break-all"
                }}
                dangerouslySetInnerHTML={{ __html: part }}
              />
            );
          } else {
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{ __html: part }}
              />
            );
          }
        })}
      </div>
    );
  });
};
