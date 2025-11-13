import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, login, loading, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
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

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      });
      await login({ email: form.email, password: form.password });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "회원가입에 실패했습니다.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div>
        <h1 className="auth-title">처음 만나서 반가워요!</h1>
        <p className="auth-subtitle">
          나만의 정서 케어 동반자, 지금 바로 가입하고 감정 기록을 시작해보세요.
        </p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-email">
            이메일
          </label>
          <input
            id="signup-email"
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
          <label className="auth-label" htmlFor="signup-nickname">
            닉네임 (선택)
          </label>
          <input
            id="signup-nickname"
            name="nickname"
            type="text"
            className="auth-input"
            placeholder="나를 표현할 닉네임"
            value={form.nickname}
            onChange={handleChange}
            autoComplete="nickname"
          />
          <span className="auth-hint">
            닉네임을 입력하지 않으면 이메일 앞부분이 사용됩니다.
          </span>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password">
            비밀번호
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            className="auth-input"
            placeholder="8자 이상 입력해주세요"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-confirm">
            비밀번호 확인
          </label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            className="auth-input"
            placeholder="비밀번호를 한 번 더 입력하세요"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className="auth-footer">
        이미 계정이 있다면?
        <Link to="/login" className="auth-link">
          로그인
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;



