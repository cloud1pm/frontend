import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import "./EmotionReportPage.css";
import { getEmotionTrend } from "../api/chatApi";

const EmotionReportPage = () => {
  const [period, setPeriod] = useState("week");
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const days = period === "week" ? 7 : 30;
        const res = await getEmotionTrend(days);
        const trendList = res.trends ?? [];
        const formatted = trendList.map((item) => ({
          date: new Date(item.date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
          score: (item.averageSentimentScore ?? 0) * 10,
        }));
        setEmotionData(formatted);
      } catch {
        setEmotionData([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  return (
    <div className="report-wrapper">
      <div className="report-container">
        <header className="report-header">
          <h1 className="report-title">감정 리포트</h1>
          <p className="report-subtitle">나의 감정 날씨를 확인해보세요 🌤️</p>
        </header>

        {/* 탭 */}
        <div className="report-tabs-wrapper">
          <div className="report-tabs">
            <button className={period === "week" ? "active" : ""} onClick={() => setPeriod("week")}>
              최근 7일
            </button>
            <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>
              한 달
            </button>
          </div>
        </div>

        {/* 차트 카드 */}
        <div className="report-card">
          {loading ? (
            <div className="report-msg">데이터 불러오는 중...</div>
          ) : emotionData.length === 0 ? (
            <div className="report-msg">
              <p>아직 기록된 감정이 없어요 😢</p>
              <p className="sub">대화를 나누면 감정 그래프가 그려집니다.</p>
            </div>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[-10, 10]} hide />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 설명 카드 */}
        <div className="report-info-card">
          <h3>💡 감정 점수란?</h3>
          <p>
            <span className="highlight-pos">0점 위쪽</span>은 긍정적인 기분,<br/>
            <span className="highlight-neg">0점 아래</span>는 마음이 조금 힘든 상태를 의미해요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmotionReportPage;