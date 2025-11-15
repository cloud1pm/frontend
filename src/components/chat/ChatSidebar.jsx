// src/components/chat/ChatSidebar.jsx
import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import './ChatSidebar.css';
import {useNavigate} from "react-router-dom";


export default function ChatSidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onCreateSession, 
  onDeleteSession,
  onUpdateTitle 
}) {
  const [sidbarOpen ,  setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();
  const handleStartEdit = (session) => {
    setEditingId(session.sessionId);
    setEditTitle(session.title);
  };

  const handleSaveEdit = async (sessionId) => {
    if (editTitle.trim()) {
      await onUpdateTitle(sessionId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-sidebar">
      {/* 헤더 */}
      <div className="chat-sidebar-header">
        <button className="chat-sidebar-new-btn" onClick={onCreateSession}>
          <FiPlus size={18} />
          새 채팅 시작
        </button>   
          <button 
          className="chat-sidebar-encourage-btn"
          onClick={() => navigate("/encouragement")}
        >
          오늘의 응원하러가기 (밥 +1 🍚)
        </button>
      </div>



      {/* 채팅 목록 */}
      <div className="chat-sidebar-list">
        {sessions.length === 0 ? (
          <div className="chat-sidebar-empty">
            <FiMessageSquare size={32} />
            <p>저장된 채팅이 없습니다</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`chat-sidebar-item ${
                currentSessionId === session.sessionId ? 'active' : ''
              }`}
            >
              {editingId === session.sessionId ? (
                <div className="chat-sidebar-edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(session.sessionId);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="chat-sidebar-edit-input"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(session.sessionId)}
                    className="chat-sidebar-edit-save"
                  >
                    <FiCheck size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="chat-sidebar-edit-cancel"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => onSelectSession(session.sessionId)}
                    className="chat-sidebar-item-content"
                  >
                    <div className="chat-sidebar-item-title">
                      {session.title}
                    </div>
                    <div className="chat-sidebar-item-date">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  <div className="chat-sidebar-item-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(session);
                      }}
                      className="chat-sidebar-action-btn"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('이 채팅을 삭제하시겠습니까?')) {
                          onDeleteSession(session.sessionId);
                        }
                      }}
                      className="chat-sidebar-action-btn delete"
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