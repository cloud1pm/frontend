import axiosInstance from "./axiosInstance";

/* ----------------------------------------------------
 *  LocalStorage 저장 관리 (authToken + authUser)
 * ---------------------------------------------------- */

export const persistSession = ({ token, user }) => {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
};

export const getStoredSession = () => {
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("authUser");

  if (!token || !userStr) return null;

  return {
    token,
    user: JSON.parse(userStr)
  };
};

export const clearStoredSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
};

/* ----------------------------------------------------
 *  API 호출
 * ---------------------------------------------------- */
export const initiateGoogleLogin = () => {
  console.log("🔵 [authApi] 구글 로그인 시작");
  window.location.href = "http://localhost:8080/oauth2/authorization/google";
};

export const checkUsername = async (username) => {
  try {
    const res = await axiosInstance.get("/user/check-username", {
      params: { username },
    });
    return res.data; // true or false
  } catch (error) {
    console.error("❌ username 중복 체크 오류", error);
    return false;
  }
};

export const login = async (payload) => {
  const res = await axiosInstance.post("/user/login", payload);
  return res.data;
};

export const signup = async (payload) => {
  const res = await axiosInstance.post("/user/signup", payload);
  return res.data;
};

export const logout = async () => {
  clearStoredSession();
};

export const handleGoogleCallback = async (token) => {
  // 백엔드에서 /api/user/status 호출로 user 정보 가져오기
  const res = await axiosInstance.get("/user/status", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return {
    token,
    user: res.data
  };
};

// 온보딩 완료
export const completeOnboarding = async (payload) => {
  const res = await axiosInstance.post("/user/initial-setup", payload);
  return res.data;
};
