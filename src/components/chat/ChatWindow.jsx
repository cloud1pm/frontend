import React from 'react';
import './ChatWindow.css';

export default function ChatWindow({ messages }) {
  return (
    <div className="cw-container">
      {messages.map((msg, i) => {
        const isUser = msg.isUserMessage;
        return (
          <div key={i} className={`cw-row ${isUser ? "user" : "bot"}`}>
            {/* 봇 아이콘 (봇 메시지일 때만) */}
            {!isUser && <div className="cw-bot-avatar">❄️</div>}
            
            <div className={`cw-bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
              {msg.message}
              <span className="cw-time">
                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}