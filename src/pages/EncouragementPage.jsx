import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../api/userApi";
import "./EncouragementPage.css";

export default function EncouragementPage() {
  const [input, setInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyWrittenToday, setAlreadyWrittenToday] = useState(false);
  const navigate = useNavigate();

  // 추천 메시지 (칩)
  const recommended = [
    "힘든 시간도 지나갈거야 🕰️",
    "천천히 해도 괜찮아 🐌",
    "오늘도 잘 해낼 수 있어 💪",
    "너는 충분히 잘하고 있어 ✨",
  ];

  // 감정 목록
  const emotions = [
    { id: "기쁨", emoji: "🥰", label: "기쁨" },
    { id: "슬픔", emoji: "😢", label: "슬픔" },
    { id: "분노", emoji: "😡", label: "분노" },
    { id: "불안", emoji: "😰", label: "불안" },
    { id: "무감정", emoji: "😶", label: "무감정" },
  ];

  // 오늘 작성 여부 확인
  useEffect(() => {
    const checkTodayMessage = async () => {
      try {
        const messages = await userAPI.getEncouragement();
        const today = new Date().toISOString().split('T')[0];
        const writtenToday = messages.some(msg => {
          const msgDate = new Date(msg.date || msg.createdAt).toISOString().split('T')[0];
          return msgDate === today;
        });
        setAlreadyWrittenToday(writtenToday);
      } catch (err) {
        console.error("작성 여부 확인 실패:", err);
      }
    };
    checkTodayMessage();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) {
      alert("응원 메시지를 입력해주세요.");
      return;
    }
    if (!selectedEmotion) {
      alert("지금 느끼는 감정을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      await userAPI.saveEncouragement({
        message: input.trim(),
        emotion: selectedEmotion,
      });
      
      // 캐릭터 정보 갱신 (밥 개수 업데이트)
      await userAPI.getCharacterInfo(); 

      setInput("");
      setSelectedEmotion("");
      setAlreadyWrittenToday(true);
      
      alert("응원 메시지가 저장되었고, 밥 1개를 획득했어요! 🍚");
    } catch (err) {
      let errorMessage = "메시지 전송 실패";
      if (err.response?.data) {
        const msg = typeof err.response.data === 'string' ? err.response.data : err.response.data.message;
        if (msg && msg.includes("today")) {
          errorMessage = "오늘은 이미 작성하셨어요!";
          setAlreadyWrittenToday(true);
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enc-wrapper">
      <div className="enc-container">
        
        {/* 헤더 */}
        <header className="enc-header">
          <h1 className="enc-title">오늘의 응원</h1>
          <p className="enc-subtitle">나에게 따뜻한 말 한마디를 건네주세요.</p>
        </header>

        {/* 이미 작성한 경우 알림 카드 */}
        {alreadyWrittenToday && (
          <div className="enc-completed-card">
            <span className="enc-completed-icon">✨</span>
            <div className="enc-completed-text">
              <strong>오늘의 응원을 완료했어요!</strong>
              <span>내일 또 새로운 마음으로 만나요.</span>
            </div>
          </div>
        )}

        {/* 메인 작성 카드 */}
        <div className="enc-card">
          {/* 1. 감정 선택 섹션 */}
          <section className="enc-section">
            <label className="enc-label">지금 기분은 어떠신가요?</label>
            <div className="enc-emotion-grid">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  className={`enc-emotion-btn ${selectedEmotion === emotion.id ? "active" : ""}`}
                  onClick={() => setSelectedEmotion(emotion.id)}
                  disabled={alreadyWrittenToday}
                >
                  <span className="emoji">{emotion.emoji}</span>
                  <span className="label">{emotion.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. 텍스트 입력 섹션 */}
          <section className="enc-section">
            <label className="enc-label">나에게 보내는 메시지</label>
            <div className="enc-input-wrapper">
              <textarea
                className="enc-textarea"
                placeholder="ex) 오늘도 고생 많았어, 푹 쉬자."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={alreadyWrittenToday}
              />
            </div>
          </section>

          {/* 3. 추천 메시지 칩 */}
          <section className="enc-section">
            <label className="enc-label-sub">어떤 말을 할지 고민된다면?</label>
            <div className="enc-chips">
              {recommended.map((msg, i) => (
                <button
                  key={i}
                  className="enc-chip"
                  onClick={() => setInput(msg)}
                  disabled={alreadyWrittenToday}
                >
                  {msg}
                </button>
              ))}
            </div>
          </section>

          {/* 하단 버튼 그룹 */}
          <div className="enc-btn-group">
            <button className="enc-btn secondary" onClick={() => navigate("/chat")}>
              채팅 페이지로
            </button>
            <button
              className="enc-btn primary"
              onClick={handleSubmit}
              disabled={loading || !selectedEmotion || !input.trim() || alreadyWrittenToday}
            >
              {loading ? "저장 중..." : alreadyWrittenToday ? "작성 완료" : "보내기 (밥 +1 🍚)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}