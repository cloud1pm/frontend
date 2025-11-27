import React, { useState } from "react";
import {
  FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiMessageSquare
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./ChatSidebar.css";

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onUpdateTitle,
  sidebarOpen,
  onToggleSidebar,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const navigate = useNavigate();

  // 닫힌 상태: 심플한 열기 버튼
  if (!sidebarOpen) {
    return (
      <div className="cs-collapsed" onClick={onToggleSidebar}>
        <FiChevronRight size={24} color="#1e3a8a" />
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);

    if (diff < 60000) return "방금 전";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  return (
    <div className="cs-wrapper">
      {/* 헤더: 새 채팅 & 닫기 */}
      <div className="cs-header">
        <button className="cs-new-chat-btn" onClick={onCreateSession}>
          <FiPlus size={18} />
          <span>새로운 대화</span>
        </button>
        <button className="cs-close-btn" onClick={onToggleSidebar}>
          <FiChevronLeft size={20} />
        </button>
      </div>

      {/* 응원하기 버튼 (카드 스타일) */}
      <div className="cs-encourage-section">
        <button className="cs-encourage-card" onClick={() => navigate("/encouragement")}>
          <div className="cs-encourage-icon">💌</div>
          <div className="cs-encourage-text">
            <strong>오늘의 응원 보내기</strong>
            <span>밥알 +1 획득 🍚</span>
          </div>
        </button>
      </div>

      <div className="cs-divider" />

      {/* 채팅 목록 */}
      <div className="cs-list">
        {sessions.length === 0 ? (
          <div className="cs-empty">
            <p>저장된 대화가 없어요 🍃</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`cs-item ${currentSessionId === session.sessionId ? "active" : ""}`}
              onClick={() => onSelectSession(session.sessionId)}
            >
              {editingId === session.sessionId ? (
                // 수정 모드
                <div className="cs-edit-box" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="cs-edit-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onUpdateTitle(session.sessionId, editTitle);
                        setEditingId(null);
                      }
                    }}
                  />
                  <div className="cs-edit-actions">
                    <button onClick={() => { onUpdateTitle(session.sessionId, editTitle); setEditingId(null); }}>
                      <FiCheck className="icon-check" />
                    </button>
                    <button onClick={() => setEditingId(null)}>
                      <FiX className="icon-close" />
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 모드
                <>
                  <div className="cs-icon-area">
                    <FiMessageSquare className="chat-icon" />
                  </div>
                  <div className="cs-content">
                    <div className="cs-title">{session.title}</div>
                    <div className="cs-date">{formatDate(session.updatedAt)}</div>
                  </div>
                  
                  {/* 호버 시 나타나는 액션 버튼 */}
                  <div className="cs-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(session.sessionId);
                        setEditTitle(session.title);
                      }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("대화를 삭제할까요?")) onDeleteSession(session.sessionId);
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}