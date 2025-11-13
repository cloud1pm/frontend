import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";

/**
 * Chat 관련 API 래퍼.
 * - mock 모드: 프론트 단에서 임의 응답 생성 (MOCK)
 * - 실제 연동: 백엔드의 /api/chat/message, /api/chat/emotion-trend 엔드포인트 호출
 */

/* -------------------------------------------------------
 *  MOCK DATA — 임시 봇 응답 키워드 매칭 리스트
 * ------------------------------------------------------- */
const BOT_RESPONSES = [
  { match: ["행복", "좋아", "기쁘"], reply: "정말 행복하시겠어요!" },
  { match: ["우울", "힘들", "지쳐"], reply: "많이 힘드셨죠. 잠시 쉬어가도 괜찮아요." },
  { match: ["공부", "과제", "시험"], reply: "공부하느라 수고 많았어요. 잠깐 휴식을 가져보는 건 어떨까요?" },
];

/* -------------------------------------------------------
 *  MOCK DATA — 감정 트렌드 랜덤 생성 함수
 * ------------------------------------------------------- */
const buildMockEmotionTrend = (days) =>
  Array.from({ length: days }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - idx - 1));
    const avgScore = (Math.random() * 0.4 + 0.4).toFixed(2); // 0.40–0.80 랜덤 생성 (임시)

    return {
      date: date.toISOString(),
      averageSentimentScore: Number(avgScore),
    };
  });

/* -------------------------------------------------------
 *  MOCK LOGIC — 사용자 메시지에 따라 임시 응답 생성
 * ------------------------------------------------------- */
const getMockReply = (message) => {
  const lower = message.toLowerCase();
  const matched = BOT_RESPONSES.find((pattern) =>
    pattern.match.some((keyword) => lower.includes(keyword))
  );
  return matched?.reply ?? "그렇군요! 조금 더 이야기해주실 수 있을까요?";
};

/**
 * GET /api/chat/emotion-trend
 * 실제 연동 시: 백엔드 JSON 그대로 반환
 */
export const getEmotionTrend = async (days = 7) => {
  if (USE_MOCK_API) {
    /* -------------------------------------------------------
     *  MOCK RESPONSE — trends 형식으로 감싼 목업 데이터 반환
     * ------------------------------------------------------- */
    return mockResponse({
      trends: buildMockEmotionTrend(days),
    });
  }

  const { data } = await axiosInstance.get("/api/chat/emotion-trend", {
    params: { days },
  });

  return data;
};

/**
 * POST /api/chat/message
 * 실제 연동 시: 백엔드 응답 반환
 */
export const sendChatMessage = async ({ message }) => {
  if (!message) {
    throw new Error("메시지가 비어있습니다.");
  }

  if (USE_MOCK_API) {
    /* -------------------------------------------------------
     * MOCK RESPONSE — 실제 백엔드 응답 형식을 흉내 내는 목업
     * ------------------------------------------------------- */
    const reply = getMockReply(message);

    return mockResponse({
      reply,
      sentiment:
        message.includes("힘들") || message.includes("우울")
          ? "negative"
          : message.includes("행복") || message.includes("좋아")
          ? "positive"
          : "neutral",
      riskLevel: message.includes("힘들") ? 3 : 1,
    });
  }

  const { data } = await axiosInstance.post("/api/chat/message", {
    message,
  });

  return data;
};
