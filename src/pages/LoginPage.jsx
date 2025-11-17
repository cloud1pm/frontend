// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google"; // ❌ 사용하지 않으므로 제거
import { useAuth } from "../context/AuthContext";
// 💡 config 파일에서 USE_MOCK_API를 가져와야 합니다.
// 이 파일 경로가 현재 환경과 다를 수 있습니다. 편의상 임시로 정의했습니다.
// 실제 프로젝트에 맞게 경로를 수정하거나 config 파일에서 import 해야 합니다.
const USE_MOCK_API = false; // 임시 정의. 실제로는 import ... from "../config"; 필요
import "./AuthPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  // 💡 googleLogin은 이제 리다이렉션 방식을 사용하므로 필요 없습니다.
  const { login, isAuthenticated, loading, user } = useAuth(); 

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 로그인된 상태면 chat or onboarding으로 이동
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(user?.isOnboarded ? "/chat" : "/onboarding", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  // 텍스트 로그인 입력 처리
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 텍스트 로그인 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(form);
      navigate(response?.user?.isOnboarded ? "/chat" : "/onboarding", {
        replace: true,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "로그인에 실패했습니다.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 [추가] Google OAuth2 리다이렉트 시작 함수
  const handleGoogleLogin = () => {
    // Mock API가 아닌 경우 백엔드 OAuth2 엔드포인트로 리다이렉트
    if (!USE_MOCK_API) {
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    } else {
      // Mock API 로직 (필요하다면 여기에 추가)
      console.log("Mock Google Login initiated.");
      // navigate("/oauth2/redirect?token=MOCK_TOKEN"); // Mock 토큰 리다이렉션 예시
    }
  };


  // ⭐ [제거] 기존 구글 로그인 처리 함수는 리다이렉트 방식으로 대체되므로 삭제
  // const handleGoogleSuccess = async (credential) => { ... }; 

  return (
    // 👈 [수정] .plain-layout div 추가
    <div className="plain-layout">
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">이메일</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              value={form.email}
              onChange={handleChange}
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
            />
          </div>

          <button className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={{ margin: "20px 0", textAlign: "center" }}>또는</div>

        {/* 🚀 [변경] GoogleLogin 컴포넌트 대신 리다이렉트 버튼으로 대체 */}
        <button
          className="auth-google-redirect-btn" // CSS 스타일링을 위해 클래스를 추가하세요.
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          style={{ 
              width: '100%', 
              padding: '10px', 
              cursor: 'pointer',
              // 임시 스타일: 실제 디자인에 맞게 변경하세요.
          }}
        >
            Google 계정으로 로그인
        </button>


        <div className="auth-footer">
          계정이 없나요? <Link to="/signup" className="auth-link">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;