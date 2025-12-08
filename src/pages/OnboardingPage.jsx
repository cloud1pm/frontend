import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { signup } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./OnboardingPage.css";

const riskLevels = [
  { id: 1, description: "살짝 불편함" },
  { id: 2, description: "기분이 처짐" },
  { id: 3, description: "우울/무기력" },
  { id: 4, description: "많이 지침" },
  { id: 5, description: "전문 도움 필요" },
];

const solutionCandidates = [
  "짧게 산책하기", "화창한 곳 바라보기", "가벼운 스트레칭",
  "좋아하는 간식 먹기", "좋아하는 음악 듣기", "좋아하는 사진 보기",
  "짧은 혼잣말(괜찮아!!!!!!) 하기", "창문 열고 환기하기", "햇볕 쬐기",
  "따뜻한 차 마시기", "명상 앱 따라 하기", "깊게 호흡하기", "일기 쓰기",
  "감정 일기 정리하기", "오늘 좋았던 일 한 줄 쓰기", "나에게 응원 메시지 보내기",
  "좋아하는 취미 하기", "조용한 음악 틀기", "관심 있는 책 읽기",
  "기분 전환용 영화 보기", "물 한 컵 마시기", "따뜻한 담요 덮기",
  "손 따뜻하게 감싸기", "ASMR 듣기", "간단한 집안일 3분 하기",
  "정리하고 싶은 것 하나 치우기", "10분 낮잠 자기", "따뜻한 목욕 즐기기",
  "충분한 수면 확보하기", "편안한 옷으로 갈아입기", "긴장 완화 스트레칭",
  "차분한 영상 보기", "핫팩 사용하기", "방 불 끄고 쉬기", "가족과 대화하기",
  "친구에게 연락하기", "전문 상담 예약하기", "위기 상담 전화하기",
  "신뢰하는 사람에게 도움 요청하기", "안전한 공간으로 이동하기", "SNS 잠시 끄기",
];

const solutionIcons = {
  "짧게 산책하기": "🚶‍♀️",
  "화창한 곳 바라보기": "🌤️",
  "가벼운 스트레칭": "🤸",
  "좋아하는 간식 먹기": "🍪",
  "좋아하는 음악 듣기": "🎧",
  "좋아하는 사진 보기": "📸",
  "짧은 혼잣말(괜찮아!!!!!!) 하기": "💬",
  "창문 열고 환기하기": "🌬️",
  "햇볕 쬐기": "🌞",
  "따뜻한 차 마시기": "🍵",
  "명상 앱 따라 하기": "🧘",
  "깊게 호흡하기": "🫁",
  "일기 쓰기": "📝",
  "감정 일기 정리하기": "📓",
  "오늘 좋았던 일 한 줄 쓰기": "✨",
  "나에게 응원 메시지 보내기": "💌",
  "좋아하는 취미 하기": "🎨",
  "조용한 음악 틀기": "🎼",
  "관심 있는 책 읽기": "📚",
  "기분 전환용 영화 보기": "🎬",
  "물 한 컵 마시기": "💧",
  "따뜻한 담요 덮기": "🛏️",
  "손 따뜻하게 감싸기": "🤲",
  "ASMR 듣기": "🎧",
  "간단한 집안일 3분 하기": "🧹",
  "정리하고 싶은 것 하나 치우기": "📦",
  "10분 낮잠 자기": "😪",
  "따뜻한 목욕 즐기기": "🛁",
  "충분한 수면 확보하기": "😴",
  "편안한 옷으로 갈아입기": "👚",
  "긴장 완화 스트레칭": "🧘‍♀️",
  "차분한 영상 보기": "📺",
  "핫팩 사용하기": "🔥",
  "방 불 끄고 쉬기": "🌙",
  "가족과 대화하기": "👪",
  "친구에게 연락하기": "📱",
  "전문 상담 예약하기": "📞",
  "위기 상담 전화하기": "🆘",
  "신뢰하는 사람에게 도움 요청하기": "🤝",
  "안전한 공간으로 이동하기": "🏠",
  "SNS 잠시 끄기": "📴",
};

const levelEmojis = { 1: "😊", 2: "😀", 3: "🙂", 4: "🥲", 5: "💜" };

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, completeOnboarding } = useAuth();

  const signupInfo = location.state?.signupInfo;
  const isOAuthMode = isAuthenticated && user && !signupInfo;
  const isSignupMode = !isAuthenticated && signupInfo;

  const [step, setStep] = useState(1);
  const [solutions, setSolutions] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [customInput, setCustomInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOAuthMode && !isSignupMode) {
      alert("잘못된 접근입니다.");
      navigate("/", { replace: true });
    }
  }, [isOAuthMode, isSignupMode, navigate]);

  const handleSelect = (activity) => {
    setSolutions((prev) => {
      const updated = prev[step].includes(activity)
        ? prev[step].filter((v) => v !== activity)
        : [...prev[step], activity];
      return { ...prev, [step]: updated };
    });
  };

  const handleAddCustom = () => {
    const text = customInput.trim();
    if (!text || solutions[step].includes(text)) return;
    setSolutions((prev) => ({ ...prev, [step]: [...prev[step], text] }));
    setCustomInput("");
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formattedSolutions = Object.entries(solutions).flatMap(([level, items]) =>
        items.map((solution) => ({ 
            riskLevel: Number(level) + 5,
            solution 
        }))
      );

      if (isSignupMode) {
        await signup({
          email: signupInfo.email,
          username: signupInfo.username,
          nickname: signupInfo.nickname,
          password: signupInfo.password,
          confirmPassword: signupInfo.confirmPassword,
          profileImageUrl: "../api/user_profile.jpeg",
          riskSolutions: formattedSolutions,
        });

        alert("회원가입이 완료되었습니다!");
        navigate("/login", { replace: true });
      } else if (isOAuthMode) {
        await completeOnboarding({ riskSolutions: formattedSolutions });

        alert("온보딩이 완료되었습니다!");
        navigate("/chat", { replace: true });
      }
    } catch (err) {
      let msg = "처리 중 오류가 발생했습니다.";
      if (err.response) {
        const backend = err.response.data?.message || "";
        if (backend.includes("Email already in use")) msg = "이미 사용 중인 이메일입니다.";
        else if (backend.includes("Password and confirm password do not match")) msg = "비밀번호가 일치하지 않습니다.";
        else if (backend.includes("Username already in use")) msg = "이미 사용 중인 아이디입니다.";
        else msg = backend || err.response.data?.error || `서버 오류 (${err.response.status})`;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const current = riskLevels.find((r) => r.id === step);
  const currentEmoji = levelEmojis[step];
  const candidates = useMemo(() => [...solutionCandidates].sort(), []);

  if (!isOAuthMode && !isSignupMode) {
    return <div className="ob-loading">로딩 중...</div>;
  }

  return (
    <div className="ob-container">
      <div className="ob-header">
        <div className="ob-step-wrapper">
          <span className="ob-step">Step {step} of 5</span>
          {isOAuthMode && <span className="ob-oauth">(OAuth 사용자)</span>}
        </div>

        <div className="ob-progress">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`ob-progress-segment ${i <= step ? "active" : ""}`} />
          ))}
        </div>
      </div>

      <div className="ob-content">
        {error && <div className="ob-error">{error}</div>}

        <div className="ob-icon">{currentEmoji}</div>

        <h2 className="ob-title">나만의 마음 돌봄 방법</h2>
        <p className="ob-subtitle">감정 상태에 따라 도움이 되는 해결책을 저장해보세요</p>

        <div className="ob-card">
          <div className="ob-level-header">
            <h3 className="ob-level-title">LEVEL {step}/5</h3>

            <div className="ob-dots">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`ob-dot ${i <= step ? "active" : ""}`} />
              ))}
            </div>
          </div>

          <p className="ob-description">{current.description}</p>

          <div className="ob-grid">
            {candidates.map((activity) => (
              <button
                key={activity}
                onClick={() => handleSelect(activity)}
                disabled={isSubmitting}
                className={`ob-item-btn ${solutions[step].includes(activity) ? "selected" : ""}`}
              >
                <span className="ob-item-icon">{solutionIcons[activity]}</span>
                <span className="ob-item-text">{activity}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="기타 활동 입력"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCustom()}
            disabled={isSubmitting}
            className="ob-input"
          />

          <div className="ob-nav">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || isSubmitting}
              className={`ob-nav-btn ${step === 1 ? "disabled" : ""}`}
            >
              이전 단계
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className={`ob-nav-btn primary ${isSubmitting ? "disabled" : ""}`}
            >
              {step < 5 ? "다음 단계 →" : "완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
