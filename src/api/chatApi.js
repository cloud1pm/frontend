// src/api/chatApi.js
import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";
import { getStoredSession } from "./authApi";
/**
 * Chat 관련 API 래퍼
 * - USE_MOCK_API === true 일 때: localStorage 기반 mock 데이터 사용
 * - false 일 때: 실제 Spring Boot 백엔드 ChatController와 연동
 */

/* ===========================
 *  Mock용 유틸
 * =========================== */

const CHAT_SESSIONS_KEY = getUserKey("mockChatSessions");
const CHAT_MESSAGES_KEY = getUserKey("mockChatMessages"); // { [sessionId]: ChatMessage[] }

const readMock = (key, fallback) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));

const writeMock = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

const nowIso = () => new Date().toISOString();

const getUserKey = (base) => {
  const session = getStoredSession();
  const userId = session?.user?.id || "guest";
  return `${base}_${userId}`;
};


/* ===========================
 *  1. 단일 메시지 분석 (/api/chat/message)
 * =========================== */

/**
 * POST /api/chat/message
 * Body: { message: string }
 * Response: { message, sentiment, riskLevel }
 */
export const sendQuickMessage = async (message) => {
  if (USE_MOCK_API) {
    // 간단한 mock 로직
    const lower = message.toLowerCase();
    let sentiment = "neutral";
    let riskLevel = 1;

    if (lower.includes("힘들") || lower.includes("우울") || lower.includes("죽고")) {
      sentiment = "negative";
      riskLevel = 3;
    } else if (lower.includes("행복") || lower.includes("좋아") || lower.includes("기뻐")) {
      sentiment = "positive";
      riskLevel = 1;
    }

    return mockResponse({
      message: "안녕하세요, 오늘도 수고 많으셨어요. 무슨 일이 있었나요?",
      sentiment,
      riskLevel,
    });
  }

  const { data } = await axiosInstance.post("/api/chat/message", { message });
  return data; // { message, sentiment, riskLevel }
};

/* ===========================
 *  2. 감정 트렌드 (/api/chat/emotion-trend)
 * =========================== */

/**
 * GET /api/chat/emotion-trend?days=N
 * Response: { trends: [{ date, sentiment, averageScore }] }
 */
export const getEmotionTrend = async (days = 7) => {
  if (USE_MOCK_API) {
    const sentiments = ["negative", "neutral", "positive"];
    const trends = Array.from({ length: days }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - idx));
      return {
        date: d.toISOString().slice(0, 10), // "YYYY-MM-DD"
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        averageScore: Number((Math.random() * 2 - 1).toFixed(2)), // -1 ~ 1
      };
    });

    return mockResponse({ trends });
  }

  const { data } = await axiosInstance.get("/api/chat/emotion-trend", {
    params: { days },
  });
  return data; // { trends: [...] }
};

/* ===========================
 *  3. 채팅 세션 (방) 관리
 * =========================== */

/**
 * POST /api/chat/sessions
 * Body: { title }
 * Response: { sessionId, title, updatedAt }
 */
const createSession = async (title) => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    const newId = Date.now();
    const updatedAt = nowIso();

    const session = { sessionId: newId, title, updatedAt };
    const next = [session, ...sessions];
    writeMock(CHAT_SESSIONS_KEY, next);

    return mockResponse(session);
  }

  const { data } = await axiosInstance.post("/api/chat/sessions", { title });
  return data; // { sessionId, title, updatedAt }
};

/**
 * GET /api/chat/sessions
 * Response: [{ sessionId, title, updatedAt }, ...]
 */
const getSessions = async () => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    // updatedAt 기준 내림차순 정렬
    sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return mockResponse(sessions);
  }

  const { data } = await axiosInstance.get("/api/chat/sessions");
  return data; // Session[]
};

/**
 * PUT /api/chat/sessions/{sessionId}/title
 * Body: { title }
 * Response: { sessionId, title, updatedAt }
 */
const updateSessionTitle = async (sessionId, title) => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    const updatedAt = nowIso();
    const next = sessions.map((s) =>
      String(s.sessionId) === String(sessionId)
        ? { ...s, title, updatedAt }
        : s
    );
    writeMock(CHAT_SESSIONS_KEY, next);

    return mockResponse({
      sessionId,
      title,
      updatedAt,
    });
  }

  const { data } = await axiosInstance.put(
    `/api/chat/sessions/${sessionId}/title`,
    { title }
  );
  return data; // { sessionId, title, updatedAt }
};

/**
 * DELETE /api/chat/sessions/{sessionId}
 * Response: (204 No Content)
 */
const deleteSession = async (sessionId) => {
  if (USE_MOCK_API) {
    const sessions = readMock(CHAT_SESSIONS_KEY, []);
    const messagesDb = readMock(CHAT_MESSAGES_KEY, {});

    const nextSessions = sessions.filter(
      (s) => String(s.sessionId) !== String(sessionId)
    );
    delete messagesDb[sessionId];

    writeMock(CHAT_SESSIONS_KEY, nextSessions);
    writeMock(CHAT_MESSAGES_KEY, messagesDb);

    return mockResponse({ success: true });
  }

  await axiosInstance.delete(`/api/chat/sessions/${sessionId}`);
  // 204 No Content
  return { success: true };
};

/* ===========================
 *  4. 세션별 메시지
 * =========================== */

/**
 * GET /api/chat/sessions/{sessionId}/messages
 * Response: ChatMessage[]
 * ChatMessage = {
 *   messageId,
 *   message,
 *   isUserMessage,
 *   sentiment,
 *   createdAt
 * }
 */
const getSessionMessages = async (sessionId) => {
  if (USE_MOCK_API) {
    const messagesDb = readMock(CHAT_MESSAGES_KEY, {});
    const list = messagesDb[sessionId] ?? [];
    return mockResponse(list);
  }

  const { data } = await axiosInstance.get(
    `/api/chat/sessions/${sessionId}/messages`
  );
  return data; // ChatMessage[]
};

/**
 * POST /api/chat/message/{sessionId}
 * Body: { message }
 * Response (백엔드): { message, sentiment, riskLevel } 또는
 *   ChatMessage 하나로 바뀔 수도 있음.
 *
 * 프론트에서는:
 * 1) 사용자가 보낸 메시지는 UI에서 바로 추가
 * 2) 이 API 응답을 받아 봇 메시지로 리스트에 추가
 */
const sendSessionMessage = async (sessionId, message) => {
  if (USE_MOCK_API) {
    // mock: user/bot 메시지를 모두 localStorage에 저장해 주자
    const messagesDb = readMock(CHAT_MESSAGES_KEY, {});
    const existing = messagesDb[sessionId] ?? [];

    const createdAt = nowIso();

    const userMsg = {
      messageId: Date.now(),
      message,
      isUserMessage: true,
      sentiment: "neutral",
      createdAt,
    };

    const botMsg = {
      messageId: Date.now() + 1,
      message: "정말 고생 많으셨어요. 조금 더 이야기해 주실 수 있을까요?",
      isUserMessage: false,
      sentiment: null,
      createdAt,
    };

    const nextList = [...existing, userMsg, botMsg];
    messagesDb[sessionId] = nextList;
    writeMock(CHAT_MESSAGES_KEY, messagesDb);

    // 실제 백엔드는 보통 bot 응답만 내려줄 가능성이 높지만,
    // mock에선 bot 메시지 하나만 반환해도 되고,
    // 이렇게 둘 다 넘겨줘도 됨. 여기선 bot 메시지만 넘겨볼게.
    return mockResponse(botMsg);
  }

  const { data } = await axiosInstance.post(
    `/api/chat/message/${sessionId}`,
    { message }
  );

  // 실제 백엔드 응답 형태에 맞춰서 그대로 반환
  // (예: { message, sentiment, riskLevel } 혹은 ChatMessage 하나)
  return data;
};

/* ===========================
 *  통합 export
 * =========================== */

export const chatAPI = {
  // 단일 메시지 분석
  sendQuickMessage,
  getEmotionTrend,

  // 세션 관리
  createSession,
  getSessions,
  updateSessionTitle,
  deleteSession,

  // 세션별 메시지
  getSessionMessages,
  sendSessionMessage,
};
