import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { initiateGoogleLogin } from "../api/authApi";
import "./AuthPage.css"; // 스타일 공유

const LoginPage = () => {
  const { login, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/login") return;
    if (!loading && isAuthenticated && user) {
      if (user.hasCompletedInitialSetup) {
        navigate("/chat", { replace: true });
      } else {
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
    } catch (err) {
      let errorMessage = "아이디 또는 비밀번호를 확인해주세요.";
      if (err.request && !err.response) {
        errorMessage = "서버와 연결할 수 없습니다.";
      }
      setError(errorMessage);
      setForm({ username: "", password: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* 헤더 영역 */}
        <header className="auth-header">
          <span className="auth-logo-icon">☁️</span>
          <h1 className="auth-title">다시 만나서 반가워요!</h1>
          <p className="auth-subtitle">오늘 하루도 당신의 편이 되어줄게요.</p>
        </header>

        {/* 메인 카드 */}
        <div className="auth-card">
          {error && <div className="auth-error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label>아이디</label>
              <input
                type="text"
                name="username"
                className="auth-input"
                placeholder="아이디를 입력하세요"
                value={form.username}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="auth-input-group">
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <button 
              className="auth-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="auth-divider">
            <span>또는</span>
          </div>

          {/* 구글 로그인 버튼 */}
          <button className="auth-btn-google" onClick={initiateGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 18 18" className="google-icon">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            구글 계정으로 시작하기
          </button>

          <div className="auth-footer-link">
            아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;