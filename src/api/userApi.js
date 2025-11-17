import  axiosInstance  from "../api/axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";

/**
 * User 관련 API 래퍼.
 * - mock 모드: localStorage 기반 임시 데이터 사용
 * - 실제 연동: 백엔드 UserController 엔드포인트 사용
 */

const RISK_SOLUTIONS_KEY = "mockRiskSolutions";
const ENCOURAGEMENT_KEY = "mockEncouragement";
const STATUS_KEY = "mockUserStatus";
const CHARACTER_KEY = "mockCharacterInfo";
const GROWTH_MISSIONS_KEY = "mockGrowthMissions";
const DAILY_MISSIONS_KEY = "mockDailyMissions";

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

  const { data } = await axiosInstance.post("/user/initial-setup", {
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
    
  const { data } = await axiosInstance.get("/user/risk-solutions", {
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

  const { data } = await axiosInstance.post("/user/encouragement", {
    message,
  });

  return data;
};

/**
 * GET /api/user/encouragement
 * Response: [
 *   {  "message": "오늘도 수고했어요!" },
 *   ...
 * ]
 */
export const getEncouragement = async ({ userId = "guest" } = {}) => {
  if (USE_MOCK_API) {
    const db = readMock(ENCOURAGEMENT_KEY);
    return mockResponse(db[userId] ?? []);
  }

  const { data } = await axiosInstance.get("/user/encouragement");
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

const defaultCharacter = () => ({
  name: "눈송이",
  level: 6,
  experience: 3,
  experienceToNext: 8,
  personality: "미소 가득한 눈송이",
  statusMessage: "오늘도 따뜻하게 쉬어가요.",
  daysStreak: 3,
  totalPoints: 6,
  totalFed: 18,
});

const defaultGrowthMissions = () => [
  { id: 1, level: "Lv. 1-2", title: "물방울", completed: false },
  { id: 2, level: "Lv. 3-4", title: "얼음 결정", completed: false },
  { id: 3, level: "Lv. 5-6", title: "아기 눈송이", completed: false },
  { id: 4, level: "Lv. 7-8", title: "눈송이", completed: false },
];

const defaultDailyMissions = () => [
  { id: 1, icon: "📣", title: "응원 메시지 작성하기", points: 1, completed: false },
  { id: 2, icon: "💬", title: "댓글 작성하기", points: 1, completed: false },
  { id: 3, icon: "❤️", title: "좋아요 남기기", points: 1, completed: false },
  { id: 4, icon: "🌞", title: "연속 출석", points: 1, completed: true },
  { id: 5, icon: "✏️", title: "게시글 작성하기", points: 1, completed: true }
];

const readCharacter = () => {
  const stored = readMock(CHARACTER_KEY, defaultCharacter());
  if (!stored.experienceToNext) {
    stored.experienceToNext = 8;
  }
  return stored;
};

// 📌 사용자 상태 조회 (밥 개수, 캐릭터 레벨 등)
export const getUserStatus = async () => {
  if (USE_MOCK_API) {
    const character = readCharacter();
    return mockResponse({
      food: character.totalPoints,
      level: character.level,
      experience: character.experience,
      experienceToNext: character.experienceToNext,
      totalFed: character.totalFed,
      daysStreak: character.daysStreak,
    });
  }

  const { data } = await axiosInstance.get("/api/user/status");
  return data;
};

export const getCharacterInfo = async () => {
  if (USE_MOCK_API) {
    return mockResponse(readCharacter());
  }

  const { data } = await axiosInstance.get("/user/character");
  return data;
};

export const getGrowthMissions = async () => {
  if (USE_MOCK_API) {
    return mockResponse(readMock(GROWTH_MISSIONS_KEY, defaultGrowthMissions()));
  }

  const { data } = await axiosInstance.get("/user/character/growth-missions");
  return data;
};

export const getDailyMissions = async () => {
  if (USE_MOCK_API) {
    return mockResponse(readMock(DAILY_MISSIONS_KEY, defaultDailyMissions()));
  }

  const { data } = await axiosInstance.get("/user/character/daily-missions");
  return data;
};

export const feedCharacter = async () => {
  if (USE_MOCK_API) {
    const current = readCharacter();
    if (current.totalPoints <= 0) {
      return mockResponse({
        success: false,
        message: "보유한 밥이 부족합니다.",
      });
    }

    let { experience, level, experienceToNext } = current;
    let totalPoints = Math.max(current.totalPoints - 1, 0);
    let totalFed = current.totalFed + 1;

    experience += 1;

    if (experience >= experienceToNext) {
      level += 1;
      experience -= experienceToNext;
      experienceToNext = Math.round(experienceToNext * 1.2);
    }

    const updated = {
      ...current,
      experience,
      level,
      experienceToNext,
      totalPoints,
      totalFed,
    };

    writeMock(CHARACTER_KEY, updated);

    return mockResponse({
      success: true,
      character: updated,
    });
  }

  const { data } = await axiosInstance.post("/user/feed-character");
  return data;
};


export const clearMockData = () => {
  localStorage.removeItem(RISK_SOLUTIONS_KEY);
  localStorage.removeItem(ENCOURAGEMENT_KEY);
  localStorage.removeItem(STATUS_KEY);
  localStorage.removeItem(CHARACTER_KEY);
  localStorage.removeItem(GROWTH_MISSIONS_KEY);
  localStorage.removeItem(DAILY_MISSIONS_KEY);
  console.log("🧹 [MOCK CLEAR] 초기화 완료");
};

export const userAPI = {
  getCharacterInfo,
  getUserStatus,
  getGrowthMissions,
  getDailyMissions,
  feedCharacter,
  saveInitialSetup,
  getRiskSolutions,
  saveEncouragement,
  getEncouragement,
  clearMockData,
};
