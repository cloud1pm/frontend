import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  handleGoogleCallback as googleCallbackApi,
  completeOnboarding as completeOnboardingApi,
  getStoredSession,
  clearStoredSession,
  persistSession,
} from "../api/authApi";

const AuthContext = createContext(null);

/* ----------------------------------------------------
 * 두 API 병합 유틸 (핵심)
 * ---------------------------------------------------- */
const fetchMergedUser = async () => {
  const statusRes = await axiosInstance.get("/user/status");
  const userRes = await axiosInstance.get("/user");

  return {
    ...userRes.data,    // user 기본 정보
    ...statusRes.data,  // character + 초기설정 정보
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------------
   * camelCase 변환
   * ---------------------------------------------------- */
  const normalizeUser = (u) => {
    if (!u) return null;

    const hasCompleted = 
      u.hasCompletedInitialSetup ??
      u.has_completed_initial_setup ??
      false;

    return {
      id: u.id,
      email: u.email,
      username: u.username,
      nickname: u.nickname,
      profileImageUrl: u.profileImageUrl ?? u.profile_image_url,
      provider: u.provider,
      providerId: u.providerId ?? u.provider_id,

      rice: u.rice ?? 0,
      characterLevel: u.characterLevel ?? u.character_level ?? 1,
      feedCount: u.feedCount ?? u.feed_count ?? 0,
      consecutiveDays: u.consecutiveDays ?? u.consecutive_days ?? 0,
      lastLoginDate: u.lastLoginDate ?? u.last_login_date,

      hasCompletedInitialSetup: hasCompleted,
    };
  };

  /* ----------------------------------------------------
   * 세션 저장
   * ---------------------------------------------------- */
  const setSession = ({ token: newToken, user: rawUser }) => {
    const normalized = normalizeUser(rawUser);

    console.log("🔵 [AuthContext] setSession 호출:", {
      token: newToken ? `${newToken.substring(0, 20)}...` : null,
      user: normalized,
    });

    if (newToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }

    setToken(newToken || null);
    setUser(normalized);
  };

  /* ----------------------------------------------------
   * LocalStorage 복원
   * ---------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const saved = getStoredSession();

      if (saved?.token) {
        console.log("🔵 [AuthContext] LocalStorage 세션 발견");

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${saved.token}`;

        // 최신 정보로 업데이트 (두 API 병합)
        const fullUser = await fetchMergedUser();

        setSession({ token: saved.token, user: fullUser });
      } else {
        console.log("🔵 [AuthContext] 저장된 세션 없음");
      }

      setLoading(false);
    })();
  }, []);

  /* ----------------------------------------------------
   * 일반 로그인
   * ---------------------------------------------------- */
  const handleLogin = async (credentials) => {
    console.log("🔵 [AuthContext] 일반 로그인 시작");

    const raw = await loginApi(credentials);
    const token = raw.token;

    // token 먼저 저장 (인증 헤더 적용)
    persistSession({ token, user: raw.user });
    setSession({ token, user: raw.user });

    // 병합된 최신 유저 정보 가져오기
    const fullUser = await fetchMergedUser();

    const sessionData = { token, user: fullUser };
    persistSession(sessionData);
    setSession(sessionData);

    return sessionData;
  };

  /* ----------------------------------------------------
   * OAuth2 (구글 로그인)
   * ---------------------------------------------------- */
  const handleGoogleLogin = async (token) => {
    console.log("🔵 [AuthContext] 구글 로그인 처리 시작");

    const raw = await googleCallbackApi(token);

    // callback 응답은 최소한의 정보만 담겨 있음 → 병합 필요
    persistSession(raw);
    setSession(raw);

    const fullUser = await fetchMergedUser();

    const sessionData = { token: raw.token, user: fullUser };
    persistSession(sessionData);
    setSession(sessionData);

    return sessionData;
  };

  /* ----------------------------------------------------
   * 회원가입
   * ---------------------------------------------------- */
  const handleSignup = async (payload) => {
    console.log("🔵 [AuthContext] 회원가입 시작");
    return await signupApi(payload);
  };

  /* ----------------------------------------------------
   * 로그아웃
   * ---------------------------------------------------- */
  const handleLogout = async () => {
    console.log("🔵 [AuthContext] 로그아웃");
    try {
      await logoutApi();
    } catch {}

    clearStoredSession();
    setSession({ token: null, user: null });
  };

  /* ----------------------------------------------------
   * 온보딩 완료 후 상태 갱신
   * ---------------------------------------------------- */
  const handleCompleteOnboarding = async (payload) => {
    console.log("🔵 [AuthContext] 온보딩 완료 처리");

    await completeOnboardingApi(payload);

    // 최신 사용자 정보 병합
    const fullUser = await fetchMergedUser();

    const sessionData = { token, user: fullUser };
    persistSession(sessionData);
    setSession(sessionData);

    return sessionData;
  };

  /* ----------------------------------------------------
   * Context Value
   * ---------------------------------------------------- */
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
  return ctx;
};
