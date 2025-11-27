// src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { initiateGoogleLogin } from "../api/authApi";

const LoginPage = () => {
  const { login, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
useEffect(() => {
  //  로그인 페이지가 아닐 때는 절대 자동 이동하지 않는다
  if (location.pathname !== "/login") return;

  console.log("🔵 [LoginPage] 상태 변경:", { loading, isAuthenticated, user });

  if (!loading && isAuthenticated && user) {
    if (user.hasCompletedInitialSetup) {
      console.log("✅ [LoginPage] 온보딩 완료 → /chat 이동");
      navigate("/chat", { replace: true });
    } else {
      console.log("⚠️ [LoginPage] 온보딩 미완료 → /onboarding 이동");
      navigate("/onboarding", { replace: true });
    }
  }
}, [loading, isAuthenticated, user, navigate, location.pathname]);
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        username: form.username,
        password: form.password,
      });
      
      // useEffect에서 자동으로 리다이렉트 처리됨
    } catch (err) {
      let errorMessage = "잘못된 아이디 또는 비밀번호입니다.";

      // 서버 연결 문제일 때만 별도 처리
      if (err.request && !err.response) {
        errorMessage = "서버와 연결할 수 없습니다.";
      }

      setError(errorMessage);
      setForm({ username: "", password: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("🔵 [LoginPage] 구글 로그인 버튼 클릭");
    initiateGoogleLogin();
  };

  return (
    <div className="plain-layout">
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>

        {error && (
          <div className="auth-error" style={{
            padding: "12px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <input
              type="text"
              name="username"
              className="auth-input"
              value={form.username}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <button 
            className="auth-submit"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={{ marginTop: "16px" }}>
          <button
            className="google-login-btn"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            구글로 로그인
          </button>
        </div>

        <div className="auth-footer">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;