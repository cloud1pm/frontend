// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../api/axiosInstance";
import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  googleLogin as googleLoginApi,
  completeOnboarding as completeOnboardingApi, // 👈 1. import 추가
  getStoredSession,
  clearStoredSession
} from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 초기 로딩: localStorage session 불러오기
  useEffect(() => {
    const saved = getStoredSession();
    if (saved?.token && saved?.user) {
      setToken(saved.token);
      setUser(saved.user);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${saved.token}`;
    }
    setLoading(false);
  }, []);

  //  session 저장 함수
  const setSession = ({ token: newToken, user: userInfo }) => {
    if (newToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
    setToken(newToken || null);
    setUser(userInfo || null);
  };

  //  일반 로그인
  const handleLogin = async (credentials) => {
    const response = await loginApi(credentials);
    setSession(response);
    return response;
  };

  //  구글 로그인
  const handleGoogleLogin = async (googleIdToken) => {
    const response = await googleLoginApi(googleIdToken);
    setSession(response);
    return response;
  };

  //  회원가입
  const handleSignup = async (payload) => {
    const response = await signupApi(payload);
    return response;
  };

  //  로그아웃
  const handleLogout = async () => {
    await logoutApi();
    setSession({ token: null, user: null });
    clearStoredSession();
  };

  // ------------------------------------
  // 👈 2. 온보딩 핸들러 추가
  // ------------------------------------
  const handleCompleteOnboarding = async (onboardingData) => {
    const response = await completeOnboardingApi(onboardingData);
    setSession(response); // 세션(user) 상태 업데이트
    return response; // 페이지에 riskSolutions 등 전달
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
      completeOnboarding: handleCompleteOnboarding, // 👈 3. value에 추가
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용 가능합니다.");
  return ctx;
};