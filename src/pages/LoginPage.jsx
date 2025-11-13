// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated, loading, user } = useAuth();

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

  // ⭐ 구글 로그인 처리
  const handleGoogleSuccess = async (credential) => {
    try {
      const response = await googleLogin(credential);
      navigate(response?.user?.isOnboarded ? "/chat" : "/onboarding", {
        replace: true,
      });
    } catch {
      alert("구글 로그인 실패");
    }
  };

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

        {/* 구글 로그인 버튼 */}
        <GoogleLogin
          onSuccess={(res) => handleGoogleSuccess(res.credential)}
          onError={() => alert("구글 로그인 오류")}
        />

        <div className="auth-footer">
          계정이 없나요? <Link to="/signup" className="auth-link">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;