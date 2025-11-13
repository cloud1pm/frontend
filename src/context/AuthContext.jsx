import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosInstance from "../api/axiosInstance";
import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  fetchProfile,
} from "../api/authApi";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "cloud1pm_auth";

const storeAuth = (payload) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

const readAuth = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = readAuth();
    if (saved?.token && saved?.user) {
      setToken(saved.token);
      setUser(saved.user);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${saved.token}`;
    }
    setLoading(false);
  }, []);

  const setSession = ({ token: newToken, user: userInfo }) => {
    if (newToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
    setToken(newToken || null);
    setUser(userInfo || null);
    if (newToken && userInfo) {
      storeAuth({ token: newToken, user: userInfo });
    } else {
      clearAuth();
    }
  };

  const handleLogin = async (credentials) => {
    const response = await loginApi(credentials);
    setSession(response);
    return response;
  };

  const handleSignup = async (payload) => {
    const response = await signupApi(payload);
    return response;
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("로그아웃 처리 중 오류:", err);
    } finally {
      setSession({ token: null, user: null });
    }
  };

  const refreshProfile = async () => {
    if (!token) return null;
    try {
      const profile = await fetchProfile();
      setSession({ token, user: profile });
      return profile;
    } catch (err) {
      handleLogout();
      throw err;
    }
  };

  const completeOnboarding = () => {
    setUser((prev) =>
      prev ? { ...prev, isOnboarded: true } : prev
    );
    const saved = readAuth();
    if (saved?.user) {
      storeAuth({ ...saved, user: { ...saved.user, isOnboarded: true } });
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
      refreshProfile,
      completeOnboarding,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
};

