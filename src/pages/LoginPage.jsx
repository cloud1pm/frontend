import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(user?.isOnboarded ? "/chat" : "/onboarding", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await login(form);
      navigate(
        response?.user?.isOnboarded ? "/chat" : "/onboarding",
        { replace: true }
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "로그인에 실패했습니다.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-hero">
        <div className="auth-illustration">🌱</div>
        <h1 className="auth-title">나의 감정을 이해하고,</h1>
        <p className="auth-hero-text">
          스스로를 위로하며 함께 자라는 작은 친구를 만나보세요.
          <br />
          오늘 하루의 감정을 기록하고, 마음이 원하는 해결책을 찾아드릴게요.
        </p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="auth-input"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "로그인 중..." : "나의 친구 만나러 가기"}
        </button>
      </form>

      <div className="auth-footer">
        아직 계정이 없나요?
        <Link to="/signup" className="auth-link">
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;

