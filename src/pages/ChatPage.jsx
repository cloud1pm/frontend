import React, { useEffect, useRef, useState } from "react";
import { FiInfo, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import MessageInput from "../components/chat/MessageInput";
import ChatSidebar from "../components/chat/ChatSidebar";

import { chatAPI } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";

import "../styles.css";
import "./ChatPage.css";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollerRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.nickname || "친구";

  useEffect(() => {
    const initSessions = async () => {
      try {
        setIsLoading(true);
        const sessionList = await chatAPI.getSessions();
        if (sessionList.length > 0) {
          setSessions(sessionList);
          setCurrentSessionId(sessionList[0].sessionId);
          const msgs = await chatAPI.getSessionMessages(sessionList[0].sessionId);
          setMessages(msgs);
        } else {
          const newSession = await chatAPI.createSession("새로운 대화");
          setSessions([newSession]);
          setCurrentSessionId(newSession.sessionId);
          setMessages([]);
        }
      } catch (err) {
        setError("채팅을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    initSessions();
  }, []);

  useEffect(() => {
    if (!currentSessionId) return;
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const msgs = await chatAPI.getSessionMessages(currentSessionId);
        setMessages(msgs);
      } catch (err) {
        setError("메시지를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [currentSessionId]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCreateSession = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const newSession = await chatAPI.createSession(`${today} 대화`);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.sessionId);
      setMessages([]);
    } catch (err) {
      setError("새 채팅을 만들 수 없습니다.");
    }
  };

  const handleSelectSession = (id) => setCurrentSessionId(id);

  const handleDeleteSession = async (id) => {
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    try {
      await chatAPI.deleteSession(id);
      const remaining = sessions.filter((s) => s.sessionId !== id);
      setSessions(remaining);
      if (currentSessionId === id) {
        if (remaining.length > 0) setCurrentSessionId(remaining[0].sessionId);
        else handleCreateSession();
      }
    } catch {
      setError("삭제 실패");
    }
  };

  const handleUpdateTitle = async (id, newTitle) => {
    try {
      const updated = await chatAPI.updateSessionTitle(id, newTitle);
      setSessions((prev) =>
        prev.map((s) => (s.sessionId === id ? { ...s, title: updated.title } : s))
      );
    } catch {
      setError("수정 실패");
    }
  };

  const handleSend = async (input) => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !currentSessionId) return;

    const userMsg = { message: trimmed, isUserMessage: true, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await chatAPI.sendSessionMessage(currentSessionId, trimmed);
      const botMsg = {
        message: response.message,
        isUserMessage: false,
        sentiment: response.sentiment,
        createdAt: response.createdAt,
      };
      setMessages((prev) => [...prev, botMsg]);
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.sessionId === currentSessionId ? { ...s, updatedAt: new Date().toISOString() } : s
        );
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { message: "오류가 발생했어요. 잠시 후 다시 시도해주세요.", isUserMessage: false, isError: true },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-page-wrapper">
      <div className={`chat-sidebar-container ${sidebarOpen ? "open" : "closed"}`}>
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onUpdateTitle={handleUpdateTitle}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      <main className="chat-main-area">
        <div className="chat-card">
          <header className="chat-card-header">
            <div className="header-left">
              {!sidebarOpen && (
                <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                  <FiMenu />
                </button>
              )}
              <div className="header-titles">
                <h2 className="header-greeting">안녕, {displayName}! 👋</h2>
                <span className="header-sub">오늘 하루는 어땠나요?</span>
              </div>
            </div>
            <div className="header-right">
              <FiInfo className="info-icon" title="감정 분석 중..." />
            </div>
          </header>

          <div className="chat-content-area">
            {!hasMessages ? (
              <div className="empty-chat-view">
                <div className="empty-icon">☁️</div>
                <h3>오늘의 이야기를 들려주세요</h3>
                <p>사소한 이야기도 괜찮아요. 제가 들어줄게요.</p>
              </div>
            ) : (
              <div className="chat-messages-scroller" ref={scrollerRef}>
                <ChatWindow messages={messages} />
                {isSending && <div className="typing-indicator">답변을 작성 중이에요... ✍️</div>}
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <MessageInput onSend={handleSend} disabled={isSending || isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}