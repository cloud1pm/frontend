import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";

/**
 * User 관련 API 래퍼.
 * - mock 모드: localStorage 기반 임시 데이터 사용
 * - 실제 연동: 백엔드 UserController 엔드포인트 사용
 */

const RISK_SOLUTIONS_KEY = "mockRiskSolutions";
const ENCOURAGEMENT_KEY = "mockEncouragement";
const STATUS_KEY = "mockUserStatus";

const readMock = (key, fallback = {}) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));

const writeMock = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

/**
 * 수정: 백엔드 요청 형식에 맞춤
 * POST /api/user/initial-setup
 * Body: {
 *   "riskSolutions": [
 *     { "riskLevel": 1, "solution": "매일 30분 산책하기" },
 *     { "riskLevel": 2, "solution": "취미 생활 즐기기" }
 *   ]
 * }
  */
export const saveInitialSetup = async ({ userId = "guest", riskSolutions }) => {
  if (USE_MOCK_API) {
    const db = readMock(RISK_SOLUTIONS_KEY);
    db[userId] = riskSolutions ?? [];
    writeMock(RISK_SOLUTIONS_KEY, db);
    
    const storedUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const matchedIndex = storedUsers.findIndex(
      (u) => String(u.id) === String(userId) || u.email === userId
    );
    if (matchedIndex >= 0) {
      storedUsers[matchedIndex] = {
        ...storedUsers[matchedIndex],
        isOnboarded: true,
      };
      localStorage.setItem("mockUsers", JSON.stringify(storedUsers));
    }
    
    return mockResponse({ message: "Mock 저장 완료" });
  }

  const { data } = await axiosInstance.post("/api/user/initial-setup", {
    riskSolutions,  // 
  });

  return data;
};

/**
 *  수정: 백엔드 응답 형식 명확화
 * GET /api/user/risk-solutions?riskLevel=1
 * Response: [
 *   { "riskLevel": 1, "solution": "매일 30분 산책하기" },
 *   { "riskLevel": 1, "solution": "좋아하는 음악 듣기" }
 * ]
 * 
 * riskLevel 파라미터 생략 시 전체 반환
 */
export const getRiskSolutions = async ({ userId = "guest", riskLevel }) => {
  if (USE_MOCK_API) {
    const db = readMock(RISK_SOLUTIONS_KEY);
    const allSolutions = db[userId] ?? [];
    if (riskLevel === undefined || riskLevel === null) {
      return mockResponse(allSolutions);
    }
    return mockResponse(
      allSolutions.filter((solution) => solution.riskLevel === riskLevel)
    );
  }

  const params = riskLevel !== undefined && riskLevel !== null 
    ? { riskLevel } 
    : {};
    
  const { data } = await axiosInstance.get("/api/user/risk-solutions", {
    params,
  });

  return data;
};

/**
 * POST /api/user/encouragement
 * Body: { "message": "오늘도 수고했어요!" }
 */
export const saveEncouragement = async ({ userId = "guest", message }) => {
  if (USE_MOCK_API) {
    const db = readMock(ENCOURAGEMENT_KEY);
    const entry = {
      id: Date.now(),
      message,
      createdAt: new Date().toISOString(),
    };
    db[userId] = [entry, ...(db[userId] ?? [])].slice(0, 20);
    writeMock(ENCOURAGEMENT_KEY, db);
    return mockResponse(entry);
  }

  const { data } = await axiosInstance.post("/api/user/encouragement", {
    message,
  });

  return data;
};

/**
 * GET /api/user/encouragement
 * Response: [
 *   { "id": 1, "message": "오늘도 수고했어요!", "createdAt": "2025-01-01T10:00:00Z" },
 *   ...
 * ]
 */
export const getEncouragement = async ({ userId = "guest" } = {}) => {
  if (USE_MOCK_API) {
    const db = readMock(ENCOURAGEMENT_KEY);
    return mockResponse(db[userId] ?? []);
  }

  const { data } = await axiosInstance.get("/api/user/encouragement");
  return data;
};

/**
 * POST /api/user/feed-character
 * Response: {
 *   "food": 2,
 *   "level": 1,
 *   "experience": 10
 * }
 */


export const clearMockData = () => {
  localStorage.removeItem(RISK_SOLUTIONS_KEY);
  localStorage.removeItem(ENCOURAGEMENT_KEY);
  localStorage.removeItem(STATUS_KEY);
  console.log("🧹 [MOCK CLEAR] 초기화 완료");
};