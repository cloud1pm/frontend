// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  googleLogin as googleLoginApi,
  completeOnboarding as completeOnboardingApi,
  getStoredSession,
  clearStoredSession,
  persistSession,
} from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟣 user 형식 정규화 + 디버깅
  const normalizeUser = (u) => {
    console.log("🔵 [normalizeUser] 원본 데이터:", u);
    
    if (!u) {
      console.warn("⚠️ [normalizeUser] user 데이터가 null/undefined");
      return null;
    }

    const normalized = {
      id: u.id ?? u.userId ?? null,
      email: u.email ?? null,
      username: u.username ?? null,
      nickname: u.nickname ?? null,
      profileImageUrl: u.profileImageUrl ?? u.profile_image_url ?? null,
      isOnboarded:
        u.isOnboarded ??
        u.has_completed_initial_setup ??
        u.hasCompletedInitialSetup ??
        false,
    };

    console.log("✅ [normalizeUser] 정규화 완료:", normalized);
    return normalized;
  };

  // 🟣 axios + 상태 + localStorage 설정
  const setSession = ({ token: newToken, user: rawUser }) => {
    console.log("🔵 [setSession] 입력:", { token: newToken, user: rawUser });
    
    const normalized = normalizeUser(rawUser);

    if (newToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      console.log("✅ [setSession] Authorization 헤더 설정 완료");
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
      console.log("⚠️ [setSession] Authorization 헤더 제거");
    }

    setToken(newToken || null);
    setUser(normalized);
    console.log("✅ [setSession] 상태 업데이트 완료:", { token: newToken, user: normalized });
  };

  // 🟣 로컬 세션에서 복원
  useEffect(() => {
    console.log("🔵 [useEffect] 세션 복원 시작");
    const saved = getStoredSession();
    
    if (saved?.token && saved?.user) {
      console.log("✅ [useEffect] 저장된 세션 발견:", saved);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${saved.token}`;
      setSession(saved);
    } else {
      console.log("⚠️ [useEffect] 저장된 세션 없음");
    }
    
    setLoading(false);
  }, []);

  // 🟣 로그인
  const handleLogin = async (credentials) => {
    console.log("🔵 [handleLogin] 시작:", credentials);
    
    try {
      const raw = await loginApi(credentials);
      console.log("🔵 [handleLogin] API 응답:", raw);

      // 백엔드 응답 구조 유연하게 처리
      const response = {
        token: raw.token || raw.accessToken || raw.data?.token || raw.data?.accessToken,
        user: normalizeUser(raw.user || raw.data?.user || raw),
      };

      console.log("✅ [handleLogin] 정규화된 응답:", response);

      if (!response.token) {
        throw new Error("토큰이 응답에 포함되지 않았습니다.");
      }

      if (!response.user) {
        throw new Error("사용자 정보가 응답에 포함되지 않았습니다.");
      }

      persistSession(response);
      setSession(response);

      console.log("✅ [handleLogin] 로그인 성공");
      return response;
    } catch (error) {
      console.error("❌ [handleLogin] 로그인 실패:", error);
      throw error;
    }
  };

  // 🟣 구글 로그인
  const handleGoogleLogin = async (credential) => {
    console.log("🔵 [handleGoogleLogin] 시작");
    
    try {
      const raw = await googleLoginApi(credential);
      console.log("🔵 [handleGoogleLogin] API 응답:", raw);

      const response = {
        token: raw.token || raw.accessToken || raw.data?.token,
        user: normalizeUser(raw.user || raw.data?.user || raw),
      };

      console.log("✅ [handleGoogleLogin] 정규화된 응답:", response);

      if (!response.token || !response.user) {
        throw new Error("구글 로그인 응답이 유효하지 않습니다.");
      }

      persistSession(response);
      setSession(response);

      console.log("✅ [handleGoogleLogin] 구글 로그인 성공");
      return response;
    } catch (error) {
      console.error("❌ [handleGoogleLogin] 구글 로그인 실패:", error);
      throw error;
    }
  };

  // 🟣 회원가입 — session 변경 없음
  const handleSignup = async (payload) => {
    console.log("🔵 [handleSignup] 시작:", payload);
    
    try {
      const result = await signupApi(payload);
      console.log("✅ [handleSignup] 회원가입 성공:", result);
      return result;
    } catch (error) {
      console.error("❌ [handleSignup] 회원가입 실패:", error);
      throw error;
    }
  };

  // 🟣 로그아웃
  const handleLogout = async () => {
    console.log("🔵 [handleLogout] 시작");
    
    try {
      await logoutApi();
      console.log("✅ [handleLogout] 로그아웃 API 성공");
    } catch (e) {
      console.warn("⚠️ [handleLogout] 로그아웃 API 실패 (무시 가능):", e);
    }

    setSession({ token: null, user: null });
    clearStoredSession();
    console.log("✅ [handleLogout] 로그아웃 완료");
  };

  // 🟣 온보딩 완료
  const handleCompleteOnboarding = async (payload) => {
    console.log("🔵 [handleCompleteOnboarding] 시작:", payload);
    
    try {
      await completeOnboardingApi(payload);

      const updatedUser = {
        ...user,
        isOnboarded: true,
      };

      const response = { token, user: updatedUser };
      persistSession(response);
      setSession(response);
      
      console.log("✅ [handleCompleteOnboarding] 온보딩 완료");
      return response;
    } catch (error) {
      console.error("❌ [handleCompleteOnboarding] 온보딩 실패:", error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login: handleLogin,
      googleLogin: handleGoogleLogin,
      signup: handleSignup,
      logout: handleLogout,
      completeOnboarding: handleCompleteOnboarding,
    }),
    [user, token, loading]
  );

  console.log("🔵 [AuthProvider] 현재 상태:", { user, token, loading, isAuthenticated: Boolean(user && token) });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  return ctx;
};