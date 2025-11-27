import React, { useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import "./MessageInput.css";

export default function MessageInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="mi-wrapper">
      <div className="mi-container">
        <input
          type="text"
          className="mi-input"
          placeholder="오늘의 감정을 기록해보세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
          disabled={disabled}
        />
        <button 
          className={`mi-send-btn ${input.trim() ? 'active' : ''}`} 
          onClick={handleSend} 
          disabled={disabled || !input.trim()}
        >
          <FiArrowUp size={20} />
        </button>
      </div>
    </div>
  );
}