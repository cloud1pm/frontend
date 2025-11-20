import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { signup } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const riskLevels = [
  { id: 1, description: "살짝 불편함" },
  { id: 2, description: "기분이 처짐" },
  { id: 3, description: "우울/무기력" },
  { id: 4, description: "많이 지침" },
  { id: 5, description: "전문 도움 필요" },
];

const solutionCandidates = [
  // LEVEL 1 — 아주 가벼운 기분전환
  "짧게 산책하기", 
  "화창한 곳 바라보기",
  "가벼운 스트레칭",
  "좋아하는 간식 먹기",
  "좋아하는 음악 듣기",
  "좋아하는 사진 보기",
  "짧은 혼잣말(괜찮아!!!!!!) 하기",
  "창문 열고 환기하기",
  "햇볕 쬐기",
  
  // LEVEL 2 — 기분이 처짐 (감정 회복)
  "따뜻한 차 마시기",
  "명상 앱 따라 하기",
  "깊게 호흡하기",
  "일기 쓰기",
  "감정 일기 정리하기",
  "오늘 좋았던 일 한 줄 쓰기",
  "나에게 응원 메시지 보내기",
  "좋아하는 취미 하기",
  "조용한 음악 틀기",
  
  // LEVEL 3 — 우울/무기력 (작은 목표·심리 안정)
  "관심 있는 책 읽기",
  "기분 전환용 영화 보기",
  "물 한 컵 마시기",
  "따뜻한 담요 덮기",
  "손 따뜻하게 감싸기",
  "ASMR 듣기",
  "간단한 집안일 3분 하기",
  "정리하고 싶은 것 하나 치우기",
  "10분 낮잠 자기",
  
  // LEVEL 4 — 많이 지침 (휴식·안전)
  "따뜻한 목욕 즐기기",
  "충분한 수면 확보하기",
  "편안한 옷으로 갈아입기",
  "긴장 완화 스트레칭",
  "차분한 영상 보기",
  "핫팩 사용하기",
  "방 불 끄고 쉬기",
  "가족과 대화하기",
  "친구에게 연락하기",
  
  // LEVEL 5 — 전문 도움 필요 (지원 요청)
  "전문 상담 예약하기",
  "위기 상담 전화하기",
  "신뢰하는 사람에게 도움 요청하기",
  "안전한 공간으로 이동하기",
  "SNS 잠시 끄기",
];

const solutionIcons = {
  // LEVEL 1
  "짧게 산책하기": "🚶‍♀️",
  "화창한 곳 바라보기": "🌤️",
  "가벼운 스트레칭": "🤸",
  "좋아하는 간식 먹기": "🍪",
  "좋아하는 음악 듣기": "🎧",
  "좋아하는 사진 보기": "📸",
  "짧은 혼잣말(“괜찮아!!!!”) 하기": "💬",
  "창문 열고 환기하기": "🌬️",
  "햇볕 쬐기": "🌞",

  // LEVEL 2
  "따뜻한 차 마시기": "🍵",
  "명상 앱 따라 하기": "🧘",
  "깊게 호흡하기": "🫁",
  "일기 쓰기": "📝",
  "감정 일기 정리하기": "📓",
  "오늘 좋았던 일 한 줄 쓰기": "✨",
  "나에게 응원 메시지 보내기": "💌",
  "좋아하는 취미 하기": "🎨",
  "조용한 음악 틀기": "🎼",

  // LEVEL 3
  "관심 있는 책 읽기": "📚",
  "기분 전환용 영화 보기": "🎬",
  "물 한 컵 마시기": "💧",
  "따뜻한 담요 덮기": "🛏️",
  "손 따뜻하게 감싸기": "🤲",
  "ASMR 듣기": "🎧",
  "간단한 집안일 3분 하기": "🧹",
  "정리하고 싶은 것 하나 치우기": "📦",
  "10분 낮잠 자기": "😪",

  // LEVEL 4
  "따뜻한 목욕 즐기기": "🛁",
  "충분한 수면 확보하기": "😴",
  "편안한 옷으로 갈아입기": "👚",
  "긴장 완화 스트레칭": "🧘‍♀️",
  "차분한 영상 보기": "📺",
  "핫팩 사용하기": "🔥",
  "방 불 끄고 쉬기": "🌙",
  "가족과 대화하기": "👪",
  "친구에게 연락하기": "📱",

  // LEVEL 5
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

  // SignupPage → 전달된 정보
  const signupInfo = location.state?.signupInfo;

  // 온보딩 모드 결정
  const isOAuthMode = isAuthenticated && user && !signupInfo;
  const isSignupMode = !isAuthenticated && signupInfo;

  const [step, setStep] = useState(1);
  const [solutions, setSolutions] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [customInput, setCustomInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 부정 접근 방지
  useEffect(() => {
    if (!isOAuthMode && !isSignupMode) {
      alert("잘못된 접근입니다.");
      navigate("/", { replace: true });
    }
  }, [isOAuthMode, isSignupMode, navigate]);

  // 활동 선택
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

  //  온보딩 제출
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 포맷팅
      const formattedSolutions = Object.entries(solutions).flatMap(([level, items]) =>
        items.map((solution) => ({ riskLevel: Number(level), solution }))
      );

      // -------------------------------
      // 일반 회원가입 플로우
      // -------------------------------
      if (isSignupMode) {
        const payload = {
          email: signupInfo.email,
          username: signupInfo.username,
          nickname: signupInfo.nickname,
          password: signupInfo.password,
          confirmPassword: signupInfo.confirmPassword,
          profileImageUrl: "../api/user_profile.jpeg",
          riskSolutions: formattedSolutions,
        };

        await signup(payload);

        alert("회원가입이 완료되었습니다! 😊");
        navigate("/login", { replace: true });
      }

      // -------------------------------
      // OAuth 온보딩
      // -------------------------------
      else if (isOAuthMode) {
        await completeOnboarding({ riskSolutions: formattedSolutions });

        alert("온보딩이 완료되었습니다! 😊");
        navigate("/chat", { replace: true });
      }

    } catch (err) {
      //console.error("[Onboarding submit error]", err);

      let msg = "처리 중 오류가 발생했습니다.";

      if (err.response) {
        const backend = err.response.data?.message || "";

        if (backend.includes("Email already in use"))
          msg = "이미 사용 중인 이메일입니다.";

        else if (backend.includes("Password and confirm password do not match"))
          msg = "비밀번호가 일치하지 않습니다.";

        else if (backend.includes("Username already in use"))
          msg = "이미 사용 중인 아이디입니다.";

        else
          msg = backend || err.response.data?.error || `서버 오류 (${err.response.status})`;
      } 
      else if (err.request) msg = "서버와 연결할 수 없습니다.";
      else msg = err.message;

      setError(msg);
      alert("이미 사용중인 이메일입니다. 다른 이메일을 사용해주세요.");
      navigate("/sign up", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const current = riskLevels.find((r) => r.id === step);
  const currentEmoji = levelEmojis[step];
  const candidates = useMemo(() => [...solutionCandidates].sort(), []);

  // 잘못된 접근 처리
  if (!isOAuthMode && !isSignupMode) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.stepInfo}>
          <span style={styles.stepText}>Step {step} of 5</span>
          {isOAuthMode && <span style={styles.oauthTag}>(OAuth 사용자)</span>}
        </div>

        <div style={styles.progressBar}>
          {[1,2,3,4,5].map((i) => (
            <div
              key={i}
              style={{
                ...styles.progressSegment,
                backgroundColor: i <= step ? "#7c3aed" : "#e5e7eb",
              }}
            />
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        <div style={styles.iconContainer}>
          <span style={styles.icon}>{currentEmoji}</span>
        </div>

        <h2 style={styles.title}>나만의 마음 돌봄 방법</h2>
        <p style={styles.subtitle}>감정 상태에 따라 도움이 되는 해결책을 저장해보세요</p>

        <div style={styles.card}>
          <div style={styles.levelHeader}>
            <h3 style={styles.levelTitle}>LEVEL {step}/5</h3>
            <div style={styles.levelDots}>
              {[1,2,3,4,5].map((i) => (
                <span
                  key={i}
                  style={{
                    ...styles.dot,
                    backgroundColor: i <= step ? "#7c3aed" : "#d1d5db",
                  }}
                />
              ))}
            </div>
          </div>

          <p style={styles.levelDescription}>{current.description}</p>

          {/* 활동 선택 */}
          <div style={styles.activityGrid}>
            {candidates.map((activity) => (
              <button
                key={activity}
                onClick={() => handleSelect(activity)}
                disabled={isSubmitting}
                style={{
                  ...styles.activityButton,
                  ...(solutions[step].includes(activity)
                    ? styles.activityButtonSelected
                    : {}),
                }}
              >
                <span style={styles.activityIcon}>{solutionIcons[activity]}</span>
                <span style={styles.activityText}>{activity}</span>
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
            style={styles.customInput}
          />

          {/* Prev / Next 버튼 */}
          <div style={styles.navRow}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || isSubmitting}
              style={{
                ...styles.navButton,
                ...(step === 1 || isSubmitting ? styles.navButtonDisabled : {})
              }}
            >
              이전 단계
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                ...styles.navButton,
                ...(isSubmitting ? styles.navButtonDisabled : {})
              }}
            >
              {step < 5 ? "다음 단계 →" : "완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: { minHeight: "100vh", backgroundColor: "#fafafa" },
  header: { padding: "24px", backgroundColor: "white" },
  stepInfo: { display: "flex", justifyContent: "center", marginBottom: "8px" },
  stepText: { fontSize: "14px", color: "#6b7280" },
  oauthTag: { fontSize: "12px", color: "#7c3aed", marginLeft: "8px" },
  progressBar: { display: "flex", gap: "8px" },
  progressSegment: { flex: 1, height: "4px", borderRadius: "2px" },
  content: { padding: "28px", maxWidth: "640px", margin: "0 auto" },
  errorBox: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  iconContainer: { textAlign: "center", marginBottom: "16px" },
  icon: { fontSize: "48px" },
  title: { fontSize: "24px", fontWeight: "600", textAlign: "center" },
  subtitle: { fontSize: "14px", textAlign: "center", color: "#6b7280", marginBottom: "32px" },
  card: { padding: "24px", background: "white", borderRadius: "16px" },
  levelHeader: { display: "flex", justifyContent: "space-between" },
  levelTitle: { fontSize: "16px", fontWeight: "600" },
  levelDots: { display: "flex", gap: "6px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%" },
  levelDescription: { fontSize: "13px", color: "#6b7280", marginBottom: "20px" },
  activityGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  activityButton: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 16px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all .2s"
  },
  activityButtonSelected: { border: "1px solid #7c3aed", backgroundColor: "#ede9fe" },
  activityIcon: { fontSize: "16px" },
  activityText: { flex: 1 },
  customInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginTop: "16px",
    marginBottom: "20px"
  },
  navRow: { display: "flex", gap: "12px" },
  navButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#7c3aed",
    color: "white",
    fontWeight: "600",
    border: "none",
    cursor: "pointer"
  },
  navButtonDisabled: { opacity: 0.6, cursor: "not-allowed" }
};

export default OnboardingPage;
