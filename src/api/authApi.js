// src/api/authApi.js
import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse, mockError } from "./config";

const USERS_KEY = "mockUsers";
const TOKEN_KEY = "mockAuthToken";

const readUsers = () =>
  JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

const writeUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

const persistSession = ({ token, user }) => {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ token, user, timestamp: Date.now() })
  );
  return { token, user };
};

export const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY));
  } catch {
    return null;
  }
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ------------------------------
// ⭐ 기본 로그인
// ------------------------------
export const login = async ({ email, password }) => {
  if (USE_MOCK_API) {
    const users = readUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) return mockError(new Error("이메일 또는 비밀번호가 올바르지 않습니다."), 200);

    const session = {
      token: `mock-token-${user.id}`,
      user: { ...user, password: undefined }
    };

    return mockResponse(persistSession(session));
  }

  const { data } = await axiosInstance.post("/api/auth/login", { email, password });
  return data;
};

// ------------------------------
// ⭐ 회원가입 (mock)
// ------------------------------
export const signup = async ({ email, password, nickname }) => {
  if (USE_MOCK_API) {
    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      return mockError(new Error("이미 가입된 이메일입니다."), 200);
    }

    const newUser = {
      id: Date.now(),
      email,
      password,
      nickname: nickname || email.split("@")[0],
      isOnboarded: false,
      provider: "local",
    };

    writeUsers([...users, newUser]);
    return mockResponse({ user: newUser });
  }

  const { data } = await axiosInstance.post("/api/auth/signup", {
    email, password, nickname
  });
  return data;
};

// ------------------------------
// ⭐ 구글 로그인 API (mock 포함)
// ------------------------------
export const googleLogin = async (googleIdToken) => {
  if (USE_MOCK_API) {
    const mockUser = {
      id: Date.now(),
      email: "googleuser@example.com",
      nickname: "Google User",
      provider: "google",
      profile_image_url: "",
      isOnboarded: false
    };

    const session = {
      token: `mock-google-token-${mockUser.id}`,
      user: mockUser,
    };

    return mockResponse(persistSession(session));
  }

  const { data } = await axiosInstance.post("/api/auth/google-login", {
    idToken: googleIdToken,
  });

  return data;
};

export const logout = async () => {
  if (USE_MOCK_API) {
    clearStoredSession();
    return mockResponse({ success: true });
  }

  await axiosInstance.post("/api/auth/logout");
  return { success: true };
};

// ------------------------------
// 👈 [추가] 온보딩 완료 (Mock)
// ------------------------------
export const completeOnboarding = async (onboardingData) => {
  // MOCK API가 활성화된 경우 (config.js)
  if (USE_MOCK_API) {
    const session = getStoredSession();
    if (!session) return mockError(new Error("로그인이 필요합니다."));

    // 1. 유저 정보에 온보딩 완료 처리
    const updatedUser = {
      ...session.user,
      ...onboardingData, // riskLevel, interests, goals 등
      isOnboarded: true,  // 온보딩 완료 상태로 변경
    };

    // 2. 새 세션으로 localStorage 저장
    const newSession = {
      token: session.token,
      user: updatedUser,
    };
    persistSession(newSession);

    // 3. 페이지에서 사용할 가짜 API 응답 (riskSolutions)
    const mockApiData = {
      riskSolutions: [
        { riskLevel: 1, solution: "매일 30분 산책하기" },
        { riskLevel: 2, solution: "취미 생활 즐기기" },
      ],
    };

    // 4. 새 세션 + 가짜 응답을 합쳐서 반환
    return mockResponse({ ...newSession, ...mockApiData });
  }

  // (향후 실제 API 연동 시 이 부분에 /api/user/initial-setup 호출 로직 추가)
};