import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
      const trendList = response.trends ?? [];

      if (trendList.length > 0) {
        const formattedData = trendList.map((item) => ({
          date: formatDate(item.date),
          score: normalizeScore(item.averageSentimentScore ?? item.score ?? 0),
        }));
        setEmotionData(formattedData);
      } else {
        // 데이터가 없을 경우 예시 데이터 사용
        setEmotionData(generateMockData(period));
      }
    } catch (err) {
      console.error("감정 트렌드 조회 실패:", err);
      setError("데이터를 불러오지 못해 예시를 보여드려요.");
      // 에러 시에도 예시 데이터 표시 (UI 유지)
      setEmotionData(generateMockData(period));
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

  // 감정 점수 변환 (-1.0 ~ 1.0 -> -10 ~ 10)
  const normalizeScore = (value) => {
    if (value === null || value === undefined) return 0;
    return Math.round(Number(value) * 10);
  };

  // 예시 데이터 생성
  const generateMockData = (periodType) => {
    const days = periodType === "week" ? 7 : 30;
    const today = new Date();
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // -5 ~ 8 사이의 랜덤 점수
      const randomScore = Math.floor(Math.random() * 14) - 5;
      data.push({
        date: formatDate(date),
        score: randomScore,
      });
    }
    return data;
  };

  return (
    <div className="report-wrapper">
      <div className="report-container">
        
        {/* 헤더 */}
        <header className="report-header">
          <h1 className="report-title">감정 리포트</h1>
          <p className="report-subtitle">
            지난 {period === "week" ? "일주일" : "한 달"} 동안의<br />
            나의 감정 날씨를 확인해보세요 🌤️
          </p>
        </header>

        {/* 기간 선택 탭 */}
        <div className="report-tabs-wrapper">
          <div className="report-tabs">
            <button
              className={`report-tab-btn ${period === "week" ? "active" : ""}`}
              onClick={() => setPeriod("week")}
            >
              최근 7일
            </button>
            <button
              className={`report-tab-btn ${period === "month" ? "active" : ""}`}
              onClick={() => setPeriod("month")}
            >
              한 달
            </button>
          </div>
        </div>

        {/* 차트 카드 */}
        <div className="report-card">
          <div className="chart-header-row">
            <h3>감정 흐름</h3>
            {error && <span className="mock-badge">예시 데이터</span>}
          </div>

          {loading ? (
            <div className="report-msg">
              <div className="spinner"></div>
              <p>데이터를 분석하고 있어요...</p>
            </div>
          ) : (
            <div style={{ width: "100%", height: "300px" }}> {/* 높이 고정 컨테이너 */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={emotionData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    hide
                    domain={[-10, 10]}
                  />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#1e3a8a"
                    }}
                    formatter={(value) => [`${value}점`, "감정 점수"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "white", stroke: "#2563eb", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#2563eb", stroke: "white", strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 하단 안내 카드 */}
        <div className="report-info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h3>감정 점수는 어떻게 보나요?</h3>
            <p>
              <span className="highlight-pos">0점 위</span>는 긍정적인 마음,<br />
              <span className="highlight-neg">0점 아래</span>는 조금 지친 마음을 의미해요.<br />
              그래프가 내려가도 괜찮아요. 잠시 쉬어가라는 신호니까요. ☕
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmotionReportPage;