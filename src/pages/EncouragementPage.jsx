// src/pages/EncouragementPage.jsx
import React, { useState, useEffect } from "react";
import { userAPI } from "../api/userApi";
import "./EncouragementPage.css";
import { useNavigate } from "react-router-dom";

export default function EncouragementPage() {
  const [input, setInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyWrittenToday, setAlreadyWrittenToday] = useState(false);
  const navigate = useNavigate();

  const recommended = [
    "힘든 시간도 지나갈거야",
    "천천히 해도 괜찮아",
    "오늘도 잘 해낼 수 있어",
    "너는 충분히 잘하고 있어",
  ];

  const emotions = [
    { id: "기쁨", emoji: "😊", label: "기쁨" },
    { id: "슬픔", emoji: "😢", label: "슬픔" },
    { id: "분노", emoji: "😠", label: "분노" },
    { id: "불안", emoji: "😰", label: "불안" },
    { id: "무감정", emoji: "😐", label: "무감정" },
  ];

  // 페이지 로드 시 오늘 작성 여부 확인
  useEffect(() => {
    const checkTodayMessage = async () => {
      try {
        const messages = await userAPI.getEncouragement();
        
        const today = new Date().toISOString().split('T')[0];
        const writtenToday = messages.some(msg => {
          const msgDate = new Date(msg.date || msg.createdAt).toISOString().split('T')[0];
          return msgDate === today;
        });
        
        console.log("📅 오늘 작성 여부:", writtenToday);
        setAlreadyWrittenToday(writtenToday);
        
      } catch (err) {
        console.error("작성 여부 확인 실패:", err);
      }
    };

    checkTodayMessage();
  }, []);

  const handleSubmit = async () => {
    //console.group("🔵 [응원 메시지 전송 시작]");
    
    if (!input.trim()) {
      console.warn("⚠️ 메시지 미입력");
      alert("응원 메시지를 입력해주세요.");
      console.groupEnd();
      return;
    }

    if (!selectedEmotion) {
      console.warn("⚠️ 감정 미선택");
      alert("지금 느끼는 감정을 선택해주세요.");
      console.groupEnd();
      return;
    }

    console.log("✅ 유효성 검사 통과");
    console.log("📝 메시지:", input.trim());
    console.log("😊 감정:", selectedEmotion);

    setLoading(true);

    try {
      const requestData = {
        message: input.trim(),
        emotion: selectedEmotion,
      };
      
      console.log("📤 전송 데이터:", requestData);

      console.log("🔄 API 호출 시작: saveEncouragement");
      await userAPI.saveEncouragement(requestData);
      console.log("✅ saveEncouragement 성공");

      console.log("🔄 API 호출 시작: getCharacterInfo");
      const newStatus = await userAPI.getCharacterInfo();
      console.log("✅ getCharacterInfo 성공:", newStatus);
      console.log("🍚 보유 밥:", newStatus.rice);

      setSuccess(true);
      setInput("");
      setSelectedEmotion("");
      setAlreadyWrittenToday(true); // 작성 완료 상태로 변경
      
      alert("응원 메시지가 저장되었고, 밥 1개를 획득했어요! 🍚");
      console.log("✅ 전체 프로세스 완료");

    } catch (err) {
      console.error("❌ [응원 메시지 전송 실패]");
      console.error("에러 객체:", err);
      console.error("응답 상태:", err.response?.status);
      console.error("응답 데이터:", err.response?.data);
      console.error("에러 메시지:", err.message);
      
      let errorMessage = "메시지 전송 실패";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        const rawMessage = typeof errorData === 'string' 
          ? errorData 
          : (errorData.message || errorData.error || "");
        
        if (rawMessage.includes("already exists") || 
            rawMessage.includes("이미") || 
            rawMessage.includes("today")) {
          errorMessage = "오늘은 이미 응원 메시지를 작성하셨어요. 내일 다시 작성해주세요! 😊";
          setAlreadyWrittenToday(true);
        } else {
          errorMessage = rawMessage || "메시지 전송 실패";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  return (
    <div className="encouragement-page">
      <h1>오늘의 응원 메시지</h1>
      <p className="sub">
        오늘 하루를 시작하는 나에게<br />
        응원의 메시지를 보내주세요.
      </p>

      {alreadyWrittenToday && (
        <div style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          border: "2px solid #fbbf24",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, color: "#92400e", fontWeight: 600 }}>
            ✨ 오늘은 이미 응원 메시지를 작성하셨어요!
          </p>
          <p style={{ margin: "8px 0 0 0", color: "#b45309", fontSize: "14px" }}>
            내일 또 새로운 마음으로 작성해보세요 😊
          </p>
        </div>
      )}

      <div className="emotion-section">
        <div className="recommend-title">지금 느끼는 감정</div>
        <div className="emotion-buttons">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className={`emotion-btn ${selectedEmotion === emotion.id ? "selected" : ""}`}
              onClick={() => {
                console.log("😊 감정 선택:", emotion.id);
                setSelectedEmotion(emotion.id);
              }}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-label">{emotion.label}</span>
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="encouragement-input"
        placeholder="예) 오늘도 최선을 다한 내가 자랑스러워"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="recommend-title">추천 메시지:</div>
      <div className="recommend-box">
        {recommended.map((msg, i) => (
          <button
            key={i}
            className="recommend-chip"
            onClick={() => setInput(msg)}
          >
            {msg}
          </button>
        ))}
      </div>
    
      <div className="btn-row">
        <button
          className="sub-btn"
          onClick={() => navigate("/chat")}
        >
          나중에 할게요
        </button>

        <button
          className="main-btn"
          onClick={handleSubmit}
          disabled={loading || !selectedEmotion || !input.trim() || alreadyWrittenToday}
        >
          {loading 
            ? "전송 중..." 
            : alreadyWrittenToday
            ? "오늘은 이미 작성 완료 ✓"
            : "확인 (밥 +1 🍚)"}
        </button>
      </div>

      {success && (
        <div className="success-text">응원 메시지가 저장되었어요!</div>
      )}
    </div>
  );
}
