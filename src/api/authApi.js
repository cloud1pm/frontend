// src/api/authApi.js
import { axiosInstance } from "./axiosInstance";
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

// 로그인
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

  // 백엔드 API: POST /api/user/login
  // 요청: { username, password }
  // 응답: { token, userId }
  const { data } = await axiosInstance.post("/api/user/login", { 
    username: email.split('@')[0], // username으로 변환
    password 
  });

  // 사용자 정보 가져오기
  const userProfile = await axiosInstance.get("/api/user");
  
  const session = {
    token: data.token,
    user: {
      id: userProfile.data.id,
      email: userProfile.data.email,
      nickname: userProfile.data.nickname,
      profileImageUrl: userProfile.data.profileImageUrl,
      isOnboarded: userProfile.data.hasCompletedInitialSetup,
      provider: userProfile.data.provider
    }
  };

  persistSession(session);
  return session;
};

// 회원가입
export const signup = async ({ email, password, nickname, riskSolutions }) => {
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
      isOnboarded: true,
      provider: "local",
    };

    writeUsers([...users, newUser]);
    return mockResponse({ user: newUser });
  }

  // 백엔드 API: POST /api/user/signup
  // 요청: { email, username, nickname, password, confirmPassword, riskSolutions }
  const { data } = await axiosInstance.post("/api/user/signup", {
    email,
    username: email.split('@')[0],
    nickname: nickname || email.split('@')[0],
    password,
    confirmPassword: password,
    riskSolutions: riskSolutions || []
  });

  return { user: data };
};

// 구글 로그인 (OAuth는 백엔드에서 처리하므로 프론트는 리다이렉트만)
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

  // OAuth2는 백엔드 리다이렉트로 처리됨
  // 프론트에서는 /oauth2/authorization/google로 리다이렉트
  window.location.href = "http://localhost:8080/oauth2/authorization/google";
};

export const logout = async () => {
  clearStoredSession();
  
  if (USE_MOCK_API) {
    return mockResponse({ success: true });
  }

  // 백엔드 로그아웃 API가 있다면 호출
  return { success: true };
};

// 온보딩 완료
export const completeOnboarding = async (onboardingData) => {
  if (USE_MOCK_API) {
    const session = getStoredSession();
    if (!session) return mockError(new Error("로그인이 필요합니다."));

    const updatedUser = {
      ...session.user,
      ...onboardingData,
      isOnboarded: true,
    };

    const newSession = {
      token: session.token,
      user: updatedUser,
    };
    persistSession(newSession);

    const mockApiData = {
      riskSolutions: [
        { riskLevel: 1, solution: "매일 30분 산책하기" },
        { riskLevel: 2, solution: "취미 생활 즐기기" },
      ],
    };

    return mockResponse({ ...newSession, ...mockApiData });
  }

  // 백엔드 API: POST /api/user/initial-setup
  // 요청: { riskSolutions: [{ riskLevel, solution }] }
  await axiosInstance.post("/api/user/initial-setup", {
    riskSolutions: onboardingData.riskSolutions || []
  });

  // 세션 업데이트
  const session = getStoredSession();
  if (session) {
    session.user.isOnboarded = true;
    persistSession(session);
  }

  return { success: true };
};