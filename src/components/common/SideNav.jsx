import React from "react";
import { NavLink } from "react-router-dom";
import "./SideNav.css";

export default function SideNav({ user, onLogout }) {
  const navLinkClass = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  const displayName = user?.nickname || "사용자";
  const profileChar = displayName.charAt(0).toUpperCase();

  return (
    <aside className="sidenav">
      {/* 프로필 영역 */}
      <div className="profile-section">
        <div className="profile-avatar">
          {/* 이미지 URL이 있다면 img 태그로 교체 가능 */}
          <span className="profile-char">{profileChar}</span>
        </div>
        <div className="profile-info">
          <span className="username">{displayName}</span>
          <span className="user-level">Lv.{user?.characterLevel || 1} 눈송이</span>
        </div>
      </div>

      {/* 메뉴 영역 */}
      <nav className="nav-menu">
        <ul>
          <li>
            <NavLink to="/chat" className={navLinkClass}>
              <span className="nav-icon">💬</span> 채팅
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" className={navLinkClass}>
              <span className="nav-icon">📊</span> 감정 리포트
            </NavLink>
          </li>
          <li>
            <NavLink to="/community" className={navLinkClass}>
              <span className="nav-icon">🏘️</span> 커뮤니티
            </NavLink>
          </li>
          <li>
            <NavLink to="/character" className={navLinkClass}>
              <span className="nav-icon">☃️</span> 캐릭터
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 하단 로그아웃 */}
      {onLogout && (
        <div className="logout-section">
          <button className="logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      )}
    </aside>
  );
}