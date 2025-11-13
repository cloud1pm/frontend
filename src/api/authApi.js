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
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
};

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
    };
    writeUsers([...users, newUser]);
    return mockResponse({ user: newUser });
  }

  const { data } = await axiosInstance.post("/api/auth/signup", {
    email,
    password,
    nickname,
  });

  return data;
};

export const login = async ({ email, password }) => {
  if (USE_MOCK_API) {
    const users = readUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return mockError(new Error("이메일 또는 비밀번호가 올바르지 않습니다."), 200);
    }
    const session = {
      token: `mock-token-${user.id}`,
      user: { ...user, password: undefined },
    };
    return mockResponse(persistSession(session), 200);
  }

  const { data } = await axiosInstance.post("/api/auth/login", {
    email,
    password,
  });

  return data;
};

export const logout = async () => {
  if (USE_MOCK_API) {
    clearStoredSession();
    return mockResponse({ success: true }, 150);
  }

  await axiosInstance.post("/api/auth/logout");
  return { success: true };
};

export const fetchProfile = async () => {
  if (USE_MOCK_API) {
    const session = getStoredSession();
    if (!session?.user) {
      return mockError(new Error("세션이 없습니다."), 150);
    }
    return mockResponse(session.user, 150);
  }

  const { data } = await axiosInstance.get("/api/user/profile");
  return data;
};

