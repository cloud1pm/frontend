// src/api/chatApi.js
import axiosInstance from "./axiosInstance";

/* ===========================
 *  1. 단일 메시지 분석
 * =========================== */
export const sendQuickMessage = async (message) => {
  const { data } = await axiosInstance.post("/chat/message", { message });
  return data;
};

/* ===========================
 *  2. 감정 트렌드
 * =========================== */
export const getEmotionTrend = async (days = 7) => {
  const { data } = await axiosInstance.get("/chat/emotion-trend", {
    params: { days },
  });
  return data;
};

/* ===========================
 *  3. 채팅 세션 관리
 * =========================== */
const createSession = async (title) => {
  const { data } = await axiosInstance.post("/chat/sessions", { title });
  return data;
};

const getSessions = async () => {
  const { data } = await axiosInstance.get("/chat/sessions");
  return data;
};

const updateSessionTitle = async (sessionId, title) => {
  const { data } = await axiosInstance.put(
    `/chat/sessions/${sessionId}/title`,
    { title }
  );
  return data;
};

const deleteSession = async (sessionId) => {
  await axiosInstance.delete(`/chat/sessions/${sessionId}`);
  return { success: true };
};

/* ===========================
 *  4. 세션별 메시지
 * =========================== */
const getSessionMessages = async (sessionId) => {
  const { data } = await axiosInstance.get(
    `/chat/sessions/${sessionId}/messages`
  );
  return data;
};

const sendSessionMessage = async (sessionId, message) => {
  const { data } = await axiosInstance.post(
    `/chat/message/${sessionId}`,
    { message }
  );
  return data;
};

/* ===========================
 *  통합 export
 * =========================== */
export const chatAPI = {
  sendQuickMessage,
  getEmotionTrend,
  createSession,
  getSessions,
  updateSessionTitle,
  deleteSession,
  getSessionMessages,
  sendSessionMessage
};
