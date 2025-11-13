import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // 👈 Link import 추가
import "./AuthPage.css";

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      alert("회원가입이 완료되었습니다! 로그인해주세요.");
      navigate("/login"); // 회원가입 → 로그인 이동
    } catch (err) {
      alert(err.message || "회원가입 실패");
    }
  };

  return (
    <div className="plain-layout">
      <div className="auth-card">
        <h2 className="auth-title">회원가입</h2> {/* 👈 h1/h2 태그는 auth-title 클래스 적용 */}

        {/* 👇 [수정] 
          LoginPage.jsx와 동일한 form 구조 (auth-field, auth-label, auth-input)
        */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">이메일</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              value={form.email}
              onChange={handleChange}
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
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">캐릭터 닉네임</label>
            <input
              type="text"
              name="nickname"
              className="auth-input"
              value={form.nickname}
              onChange={handleChange}
              required
            />
          </div>

          {/* 👈 [수정] className="auth-btn" -> "auth-submit" */}
          <button type="submit" className="auth-submit">
            가입하기
          </button>
        </form>

        {/* 👈 [추가] 로그인 페이지로 돌아가기 링크 */}
        <div className="auth-footer">
          이미 계정이 있나요? <Link to="/login" className="auth-link">로그인</Link>
        </div>

      </div>
    </div>
  );
}

export default SignupPage;