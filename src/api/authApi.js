// src/api/authApi.js

import axiosInstance from "./axiosInstance";
import axios from "axios";
import { USE_MOCK_API, mockResponse, mockError } from "./config";

// ------------------------------
// Mock Helper
// ------------------------------
const USERS_KEY = "mockUsers";
const TOKEN_KEY = "mockAuthToken";

const readUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const persistSession = ({ token, user }) => {
  console.log("🔵 [persistSession] 저장:", { token, user });
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ token, user, timestamp: Date.now() })
  );
  return { token, user };
};

export const getStoredSession = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(TOKEN_KEY));
    console.log("🔵 [getStoredSession] 불러오기:", stored);
    return stored;
  } catch {
    console.warn("⚠️ [getStoredSession] 파싱 실패");
    return null;
  }
};

export const clearStoredSession = () => {
  console.log("🔵 [clearStoredSession] 세션 삭제");
  localStorage.removeItem(TOKEN_KEY);
};

// ------------------------------
// 인증 비필요 전용 axios
// ------------------------------
const authAxios = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  timeout: 10000,
});

// 응답 인터셉터 추가
authAxios.interceptors.response.use(
  (response) => {
    console.log("✅ [authAxios] 응답 성공:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ [authAxios] 응답 에러:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ------------------------------
// ⭐ 로그인
// ------------------------------
export const login = async ({ username, password }) => {
  console.log("🔵 [login API] 요청:", { username, password: "***" });

  try {
    const { data } = await authAxios.post("/api/user/login", {
      username,
      password,
    });

    console.log("✅ [login API] 응답:", data);

    if (!data) {
      throw new Error("응답 데이터가 없습니다.");
    }

    // ⭐ 수정된 부분: nickname이 없으면 username을 nickname으로 사용
    const result = {
      token: data.token || data.accessToken,
      user: {
        id: data.userId,
        nickname: data.nickname || username,   // ← 여기 중요!
        isOnboarded: true,
      },
    };

    console.log("✅ [login API] 정규화된 결과:", result);

    if (!result.token) {
      console.error("❌ [login API] 토큰 없음. 원본 응답:", data);
      throw new Error("토큰을 받지 못했습니다.");
    }

    return result;
  } catch (error) {
    console.error("❌ [login API] 오류:", error.response?.data || error.message);
    throw error;
  }
};
// ------------------------------
// ⭐ 현재 사용자 정보 가져오기 (선택적)
// ------------------------------
export const getCurrentUser = async () => {
  console.log("🔵 [getCurrentUser API] 요청");

  try {
    const { data } = await axiosInstance.get("/api/user/me");
    console.log("✅ [getCurrentUser API] 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [getCurrentUser API] 오류:", error.response?.data || error.message);
    throw error;
  }
};;

// ------------------------------
// ⭐ 회원가입
// ------------------------------
export const signup = async (payload) => {
  console.log("🔵 [signup API] 요청:", payload);

  if (USE_MOCK_API) {
    const users = readUsers();
    if (users.some((u) => u.email === payload.email)) {
      return mockError(new Error("이미 가입된 이메일입니다."), 200);
    }

    const newUser = {
      id: Date.now(),
      email: payload.email,
      username: payload.username,
      nickname: payload.nickname ,
      password: payload.password,
      isOnboarded: true, // riskSolutions 포함하므로 온보딩 완료
    };
    writeUsers([...users, newUser]);
    return mockResponse({ message: "회원가입 성공", userId: newUser.id });
  }

  try {
    // profileImageUrl 기본값 설정
    const signupData = {
      ...payload,
      profileImageUrl: payload.profileImageUrl || "./user_profile.jpeg"
    };

    console.log("🔵 [signup API] 최종 요청 데이터:", signupData);

    const { data } = await authAxios.post("/api/user/signup", signupData);
    console.log("✅ [signup API] 응답:", data);
    
    // 백엔드 응답이 { message, userId } 또는 빈 응답일 수 있음
    return data || { message: "회원가입 성공" };
  } catch (error) {
    console.error("❌ [signup API] 오류:", error.response?.data || error.message);
    throw error;
  }
};

// ------------------------------
// ⭐ 구글 로그인
// ------------------------------
export const googleLogin = async (googleIdToken) => {
  console.log("🔵 [googleLogin API] 요청");

  if (USE_MOCK_API) {
    const mockUser = {
      id: Date.now(),
      email: "google@example.com",
      nickname: "GoogleUser",
      isOnboarded: false,
    };
    return mockResponse(
      persistSession({
        token: `mock-google-${mockUser.id}`,
        user: mockUser,
      })
    );
  }

  try {
    const { data } = await authAxios.post("/api/auth/google-login", {
      idToken: googleIdToken,
    });
    
    console.log("✅ [googleLogin API] 응답:", data);

    const result = {
      token: data.token || data.accessToken || data.data?.token,
      user: data.user || data.data?.user || data,
    };

    console.log("✅ [googleLogin API] 정규화된 결과:", result);
    return result;
  } catch (error) {
    console.error("❌ [googleLogin API] 오류:", error.response?.data || error.message);
    throw error;
  }
};

// ------------------------------
// ⭐ 로그아웃
// ------------------------------
export const logout = async () => {
  console.log("🔵 [logout API] 요청");

  if (USE_MOCK_API) {
    clearStoredSession();
    return mockResponse({ success: true });
  }

  try {
    await axiosInstance.post("/api/auth/logout");
    console.log("✅ [logout API] 성공");
    return { success: true };
  } catch (error) {
    console.error("❌ [logout API] 오류:", error.response?.data || error.message);
    throw error;
  }
};

// ------------------------------
// ⭐ 온보딩 (초기설정 저장)
// ------------------------------
export const completeOnboarding = async (onboardingData) => {
  console.log("🔵 [completeOnboarding API] 요청:", onboardingData);

  if (USE_MOCK_API) {
    const session = getStoredSession();
    if (!session) {
      return mockError(new Error("로그인이 필요합니다."), 401);
    }

    const updated = {
      ...session.user,
      ...onboardingData,
      isOnboarded: true,
    };

    persistSession({ token: session.token, user: updated });

    return mockResponse({
      user: updated,
      riskSolutions: onboardingData.riskSolutions,
    });
  }

  try {
    const { data } = await axiosInstance.post(
      "/user/initial-setup",
      onboardingData
    );
    console.log("✅ [completeOnboarding API] 응답:", data);
    return data;
  } catch (error) {
    console.error("❌ [completeOnboarding API] 오류:", error.response?.data || error.message);
    throw error;
  }
};