// src/pages/EncouragementPage.jsx
import React, { useState } from "react";
import { userAPI } from "../api/userApi";
import "./EncouragementPage.css";

export default function EncouragementPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const recommended = [
    "힘든 시간도 지나갈거야",
    "천천히 해도 괜찮아",
    "오늘도 잘 해낼 수 있어",
    "너는 충분히 잘하고 있어",
  ];

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      // 1) 응원 메시지 저장
      await userAPI.saveEncouragement({
        message: input.trim(),
      });

      // 2) 사용자 상태 갱신(밥 + 1을 백엔드가 처리)
      const newStatus = await userAPI.getUserStatus();

      console.log("새 상태:", newStatus);

      setSuccess(true);
      setInput("");
    } catch (err) {
      alert("메시지 전송 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encouragement-page">
      <h1>오늘의 응원 메시지</h1>
      <p className="sub">
        오늘 하루를 시작하는 나에게<br />
        응원의 메시지를 보내주세요.
      </p>

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

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        확인 (밥 +1 🍚)
      </button>

      {success && (
        <div className="success-text">응원 메시지가 저장되었어요!</div>
      )}
    </div>
  );
}
