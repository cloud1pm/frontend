import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// 👉 userApi가 mock/실제 API 전환을 모두 처리합니다.
import { saveInitialSetup } from "../api/userApi";
import { USE_MOCK_API } from "../api/config";
import { useAuth } from "../context/AuthContext";

// 감정 단계 목록
const riskLevels = [
  { id: 1, title: "레벨 1: 살짝 불편할 때", description: "가벼운 스트레스나 불편함을 느낄 때" },
  { id: 2, title: "레벨 2: 기분이 처지거나 짜증날 때", description: "기분이 좋지 않고 예민해질 때" },
  { id: 3, title: "레벨 3: 우울하고 무기력할 때", description: "에너지가 없고 의욕이 떨어질 때" },
  { id: 4, title: "레벨 4: 많이 지치고 눈물 날 때", description: "감정이 북받치고 힘든 상태" },
  { id: 5, title: "레벨 5: 견디기 힘들 때", description: "전문적인 도움이 필요한 상태" },
];

const solutionCandidates = [
  "짧게 산책하기",
  "따뜻한 차 마시기",
  "깊게 호흡하기",
  "좋아하는 음악 듣기",
  "일기 쓰기",
  "가벼운 스트레칭",
  "관심 있는 책 읽기",
  "명상 앱 따라 하기",
  "친구에게 연락하기",
  "화창한 곳 바라보기",
  "기분 전환용 영화 보기",
  "따뜻한 목욕 즐기기",
  "충분한 수면 확보하기",
  "전문 상담 예약하기",
  "감정 일기 정리하기",
  "가족과 대화하기",
  "위기 상담 전화하기",
  "나에게 응원 메시지 보내기",
  "SNS 잠시 끄기",
  "좋아하는 취미 하기",
];

const solutionIcons = {
  "짧게 산책하기": "🚶‍♀️",
  "따뜻한 차 마시기": "🍵",
  "깊게 호흡하기": "🫁",
  "좋아하는 음악 듣기": "🎧",
  "일기 쓰기": "📝",
  "가벼운 스트레칭": "🤸",
  "관심 있는 책 읽기": "📚",
  "명상 앱 따라 하기": "🧘",
  "친구에게 연락하기": "📱",
  "화창한 곳 바라보기": "🌤️",
  "기분 전환용 영화 보기": "🎬",
  "따뜻한 목욕 즐기기": "🛁",
  "충분한 수면 확보하기": "😴",
  "전문 상담 예약하기": "📞",
  "감정 일기 정리하기": "📓",
  "가족과 대화하기": "👪",
  "위기 상담 전화하기": "🆘",
  "나에게 응원 메시지 보내기": "💌",
  "SNS 잠시 끄기": "📴",
  "좋아하는 취미 하기": "🎨",
};

const levelEmojis = {
  1: "😊",
  2: "😀",
  3: "🙂",
  4: "🥲",
  5: "💜",
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [solutions, setSolutions] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [customInput, setCustomInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const displayName =
    user?.nickname ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "친구";

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.isOnboarded) {
      navigate("/chat", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  // 활동 선택/해제
  const handleSelect = (activity) => {
    setSolutions((prev) => {
      const selected = prev[step];
      const updated = selected.includes(activity)
        ? selected.filter((a) => a !== activity)
        : [...selected, activity];
      return { ...prev, [step]: updated };
    });
  };

  // 직접 입력 추가
  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (solutions[step].includes(trimmed)) {
      alert("이미 추가된 활동입니다.");
      return;
    }
    setSolutions((prev) => ({
      ...prev,
      [step]: [...prev[step], trimmed],
    }));
    setCustomInput("");
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddCustom();
    }
  };

  // 다음 단계
  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  // 이전 단계
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // 최종 저장
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 데이터 포맷팅
      const formatted = Object.entries(solutions).flatMap(([level, items]) =>
        items.map((solution) => ({
          riskLevel: Number(level),
          solution,
        }))
      );

      // API 호출 (mock 모드에서는 localStorage, 실제 모드에서는 백엔드 호출)
      const userId =
        user?.id ||
        user?.userId ||
        user?.email ||
        "guest";

      await saveInitialSetup({
        riskSolutions: formatted,
      });

      alert(
        USE_MOCK_API
          ? "온보딩 정보가 임시 저장되었습니다! (mock)"
          : "온보딩 정보가 저장되었습니다!"
      );
      completeOnboarding();
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error("온보딩 저장 실패:", error);
      alert(
        error.response?.status === 401
          ? "로그인이 필요합니다. 인증 토큰을 확인해주세요."
          : "저장 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const current = riskLevels.find((r) => r.id === step);
  const currentEmoji = levelEmojis[step] || "💛";
  const candidates = useMemo(
    () => [...solutionCandidates].sort(),
    []
  );

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.stepInfo}>
          <span style={styles.stepText}>Step {step} of 5</span>
        </div>
        <div style={styles.progressBar}>
          {[1, 2, 3, 4, 5].map((i) => (
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

      {/* 메인 컨텐츠 */}
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>{currentEmoji}</span>
        </div>
        
        <h2 style={styles.title}>나만의 마음 돌봄 방법</h2>
        <p style={styles.greeting}>
          {displayName}님, 나만의 감정 처방을 저장하고,위기 순간엔 스스로의 해결책을 꺼내드릴게요
          
        </p>
        <p style={styles.subtitle}>
          감정 상태에 따라 나에게 도움이 되는 해결책을 미리 저장해보세요
        </p>
        <p style={styles.helper}>
          각 단계에서 동일한 후보 리스트 중 원하는 것들을 자유롭게 선택하거나 직접 추가할 수 있어요.
        </p>

        <div style={styles.card}>
          <div style={styles.levelHeader}>
            <h3 style={styles.levelTitle}>LEVEL: {step}/5</h3>
            <div style={styles.levelDots}>
              {[1, 2, 3, 4, 5].map((i) => (
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

          <p style={styles.levelDescription}>
            {current.description}
          </p>

          {/* 추천 솔루션 그리드 */}
          <div style={styles.activityGrid}>
            {candidates.map((activity) => (
              <button
                key={activity}
                style={{
                  ...styles.activityButton,
                  ...(solutions[step].includes(activity) ? styles.activityButtonSelected : {}),
                }}
                onClick={() => handleSelect(activity)}
              >
                <span style={styles.activityIcon}>
                  {solutionIcons[activity] || "✨"}
                </span>
                <span style={styles.activityText}>{activity}</span>
              </button>
            ))}
          </div>

          {/* 직접 입력 */}
          <div style={styles.customInputContainer}>
            <input
              type="text"
              placeholder="기타"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.customInput}
            />
          </div>

          {/* 선택된 항목 표시 */}
          {solutions[step].length > 0 && (
            <div style={styles.selectedSection}>
              <p style={styles.selectedLabel}>선택한 활동 ({solutions[step].length}개)</p>
              <div style={styles.selectedList}>
                {solutions[step].map((s, idx) => (
                  <div key={idx} style={styles.selectedItem}>
                    <span>{s}</span>
                    <button
                      style={styles.removeButton}
                      onClick={() =>
                        setSolutions((prev) => ({
                          ...prev,
                          [step]: prev[step].filter((v) => v !== s),
                        }))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.navRow}>
            <button
              type="button"
              style={{
                ...styles.navButton,
                ...styles.prevNavButton,
                ...(step === 1 || isSubmitting ? styles.navButtonDisabled : {}),
              }}
              onClick={handlePrev}
              disabled={step === 1 || isSubmitting}
            >
              이전 단계
            </button>
            <button
              type="button"
              style={{
                ...styles.navButton,
                ...styles.nextNavButton,
                ...(isSubmitting ? styles.navButtonDisabled : {}),
              }}
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "저장 중..."
                : step < 5
                  ? "다음 단계로 →"
                  : "모두 완료!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  header: {
    padding: "24px 24px 16px",
    backgroundColor: "white",
  },
  stepInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  stepText: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },
  progressBar: {
    display: "flex",
    gap: "8px",
    height: "4px",
  },
  progressSegment: {
    flex: 1,
    borderRadius: "2px",
    transition: "background-color 0.3s",
  },
  content: {
    flex: 1,
    padding: "32px 24px",
    maxWidth: "640px",
    width: "100%",
    margin: "0 auto",
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "16px",
  },
  icon: {
    fontSize: "48px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "8px",
    color: "#111827",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "32px",
  },
  greeting: {
    fontSize: "15px",
    color: "#4c1d95",
    textAlign: "center",
    marginBottom: "12px",
    fontWeight: "600",
  },
  helper: {
    fontSize: "13px",
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  levelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  levelTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  levelDots: {
    display: "flex",
    gap: "6px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transition: "background-color 0.3s",
  },
  levelDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  activityButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "14px",
  },
  activityButtonSelected: {
    backgroundColor: "#ede9fe",
    borderColor: "#7c3aed",
  },
  activityIcon: {
    fontSize: "16px",
  },
  activityText: {
    flex: 1,
    textAlign: "left",
    color: "#374151",
  },
  customInputContainer: {
    marginBottom: "20px",
  },
  customInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  selectedSection: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "16px",
  },
  selectedLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
    fontWeight: "500",
  },
  selectedList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  selectedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    fontSize: "14px",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0 4px",
  },
  navRow: {
    marginTop: "24px",
    display: "flex",
    gap: "12px",
  },
  navButton: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  prevNavButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  },
  nextNavButton: {
    backgroundColor: "#7c3aed",
    color: "white",
  },
  navButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default OnboardingPage;