import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { checkUsername } from "../api/authApi";

import "./AuthPage.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    username: "",
  });

  const [errors, setErrors] = useState({});
  const [usernameChecked, setUsernameChecked] = useState(false); // 중복 확인 버튼 클릭 여부

  // ★ 입력 핸들러 (영어+숫자만 입력)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      const regex = /^[a-zA-Z0-9]*$/;
      if (!regex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          username: "아이디는 영어 + 숫자만 가능합니다.",
        }));
        return;
      }
      // 새로 입력하면 중복 확인 다시 해야 함
      setUsernameChecked(false);
    }

    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // ★ 아이디 중복 확인 버튼 클릭
const handleUsernameCheck = async () => {
  if (!form.username) {
    setErrors({ username: "아이디를 입력해주세요." });
    return;
  }

  const exists = await checkUsername(form.username);
  console.log("[handleUsernameCheck] exists:", exists);

  if (exists) {
    // 이미 존재하는 아이디
    setErrors({ username: "이미 사용 중인 아이디입니다." });
    setUsernameChecked(false);
  } else {
    // 사용 가능
    setErrors((prev) => ({ ...prev, username: null }));
    setUsernameChecked(true);
    alert("사용 가능한 아이디입니다.");
  }
};

  // ★ 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!form.username) {
      newErrors.username = "아이디를 입력해주세요.";
    } else if (form.username.length < 3) {
      newErrors.username = "아이디는 3자 이상이어야 합니다.";
    }

    if (!form.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }

    if (!form.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (form.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ★ 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // 중복 확인을 안 했을 때
    if (!usernameChecked) {
      setErrors({ username: "아이디 중복 확인을 해주세요." });
      return;
    }

    // 마지막으로 서버 체크(보안용)
    const exists = await checkUsername(form.username);
    if (exists) {
      setErrors({ username: "이미 사용 중인 아이디입니다." });
      return;
    }

    navigate("/onboarding", {
      state: { signupInfo: form },
    });
  };

  return (
    <div className="plain-layout">
      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* 이메일 */}
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
            {errors.email && (
              <div className="auth-error">{errors.email}</div>
            )}
          </div>

          {/* 아이디 + 중복 확인 버튼 */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                name="username"
                className="auth-input"
                value={form.username}
                onChange={handleChange}
                placeholder="로그인 아이디"
                required
              />
              <button
                type="button"
                onClick={handleUsernameCheck}
                className="auth-check-btn"
              >
                중복 확인
              </button>
            </div>

            {errors.username && (
              <div className="auth-error">{errors.username}</div>
            )}
          </div>

          {/* 닉네임 */}
          <div className="auth-field">
            <label className="auth-label">닉네임</label>
            <input
              type="text"
              name="nickname"
              className="auth-input"
              value={form.nickname}
              onChange={handleChange}
              required
            />
            {errors.nickname && (
              <div className="auth-error">{errors.nickname}</div>
            )}
          </div>

          {/* 비밀번호 */}
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
            {errors.password && (
              <div className="auth-error">{errors.password}</div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="auth-field">
            <label className="auth-label">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              className="auth-input"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <div className="auth-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="auth-submit">
            다음 단계 → 온보딩
          </button>
        </form>

        <div className="auth-footer">
          이미 계정이 있나요? <a href="/login">로그인</a>
        </div>
      </div>
    </div>
  );
}
