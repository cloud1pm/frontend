import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./EmotionReportPage.css";
import { getEmotionTrend } from "../api/chatApi";

const EmotionReportPage = () => {
  const [period, setPeriod] = useState("week");
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmotionTrend();
  }, [period]);

  const fetchEmotionTrend = async () => {
    setLoading(true);
    setError(null);

    try {
      const days = period === "week" ? 7 : 30;
      const response = await getEmotionTrend(days);

      // ✅ 백엔드가 { trends: [...] } 형태를 반환하므로 trends로 접근
      const trendList = response.trends ?? [];

      const formattedData = trendList.map((item) => ({
        date: formatDate(item.date),
        score: normalizeScore(
          item.averageSentimentScore ??
          item.averageScore ??
          item.score ??
          0
        ),
      }));

      setEmotionData(formattedData);
    } catch (err) {
      console.error("감정 트렌드 조회 실패:", err);
      setError("감정 데이터를 불러오는데 실패했습니다.");
      setEmotionData(generateMockData(period)); // 실패 시 fallback
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  const generateMockData = (periodType) => {
    const days = periodType === "week" ? 7 : 30;
    const today = new Date();
    const data = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: formatDate(date),
        score: Math.floor(Math.random() * 30) + 40, // 40~70
      });
    }
    return data;
  };
/** 
  const getEmotionStatus = () => {
    if (emotionData.length === 0) return { text: "-", color: "#9ca3af", emoji: "😶" };
    const avg = emotionData.reduce((s, v) => s + v.score, 0) / emotionData.length;
    if (avg >= 70) return { text: "긍정적", color: "#10b981", emoji: "😊" };
    if (avg >= 50) return { text: "보통", color: "#f59e0b", emoji: "😐" };
    return { text: "부정적", color: "#ef4444", emoji: "😔" };
  };
*/
  const normalizeScore = (value) => {
    if (value === null || value === undefined) return 0;
    const numeric = Number(value);
    return numeric > 1 ? Math.round(numeric) : Math.round(numeric * 100);
  };

  /*const emotionStatus = getEmotionStatus();*/

  return (
    <div className="emotion-report-container">
      {/* 헤더 */}
      <div className="report-header">
        <h1 className="report-title">감정 변화 추이</h1>
        <p className="report-subtitle">
          지난 {period === "week" ? "일주일" : "한 달"} 간, 감정의 흐름이 이렇게 움직였어요
        </p>
      </div>

      {/* 기간 선택 */}
      <div className="period-tabs">
        <button className={`period-tab ${period === "week" ? "active" : ""}`} onClick={() => setPeriod("week")}>
          최근 7일
        </button>
        <button className={`period-tab ${period === "month" ? "active" : ""}`} onClick={() => setPeriod("month")}>
          한 달
        </button>
      </div>
      
      

      {/* 차트 */}
      <div className="chart-container">
        {loading ? (
          <div className="loading-state"><div className="spinner"></div><p>감정 데이터를 불러오는 중...</p></div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchEmotionTrend}>다시 시도</button>
          </div>
        ) : emotionData.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">아직 감정 데이터가 없어요</p>
            <p className="empty-description">채팅을 통해 감정을 기록하면 여기에 표시됩니다</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={emotionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                formatter={(value) => [`${value}점`, "감정 점수"]}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default EmotionReportPage;
