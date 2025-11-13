import React, { useEffect, useRef, useState } from "react";
import { FiInfo } from "react-icons/fi";
import ChatWindow from "../components/chat/ChatWindow";
import MessageInput from "../components/chat/MessageInput";
// 👉 chatApi 내부에서 mock/실제 API 전환을 처리합니다.
import { sendChatMessage } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";
import "../styles.css";
import "./ChatPage.css";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollerRef = useRef(null);
  const { user } = useAuth();

  const displayName =
    user?.nickname ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "친구";

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (input) => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setError(null);

    const userMsg = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      // 👉 sendChatMessage는 mock 모드에서는 가짜 응답을, 실제 모드에서는 POST /api/chat/message 호출
      const response = await sendChatMessage({ message: trimmed });
      const botText = response.reply ?? response.message ?? "응답을 불러오지 못했어요.";
      const botMsg = {
        sender: "bot",
        text: botText,
        sentiment: response.sentiment,
        riskLevel: response.riskLevel,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      setError("메시지를 전송하는 중 문제가 발생했어요. 다시 시도해 주세요.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "죄송해요, 지금은 답변을 드리기 어려워요.",
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="layout chat-page">
      <main className="chat-main">
        <header className="chat-header">
          <div className="chat-header-left">
            <FiInfo className="chat-header-icon" />
            <div className="chat-header-text-group">
              <span className="chat-header-greeting">
                {displayName}님, 안녕하세요!
              </span>
            <span className="chat-header-text">
              대화 내용을 분석하여 감정 상태를 파악하고, 상황에 맞는 도움을 제공합니다.
            </span>
            </div>
          </div>
        </header>

        <div className="chat-center">
          {!hasMessages ? (
            <div className="empty-chat">
              <div className="empty-center">
                <div className="welcome-message">
                  <h1>오늘 하루 어떤 감정을 느꼈나요?</h1>
                  <p>편안하게 이야기를 시작해보세요</p>
                </div>
                <MessageInput onSend={handleSend} disabled={isSending} />
                <div className="start-hint">준비되면 얘기해 주세요.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-scroller" ref={scrollerRef}>
                <ChatWindow messages={messages} />
              </div>

              <div className="chat-input-wrap">
                <MessageInput onSend={handleSend} disabled={isSending} />
                <div className="disclaimer">준비되면 얘기해 주세요.</div>
              </div>
            </>
          )}
          {error && <div className="chat-error">{error}</div>}
        </div>
      </main>
    </div>
  );
}
