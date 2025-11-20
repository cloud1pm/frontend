// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ----------------------------------------------------
 * 요청 인터셉터: Authorization 토큰 자동 추가
 * ---------------------------------------------------- */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ----------------------------------------------------
 * 응답 인터셉터: 인증 실패 및 HTML 리다이렉트 감지 (중요!)
 * ---------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response) => {
    // 🚨 백엔드가 에러 대신 로그인 페이지(HTML)를 200으로 보냈는지 확인
    const responseURL = response.request?.responseURL || "";
    const contentType = response.headers["content-type"] || "";

    // 조건: 응답이 HTML이거나 URL이 /login으로 변했을 경우
    if (contentType.includes("text/html") || responseURL.includes("/login")) {
      console.warn("⚠️ [Axios] 세션 만료 감지 (HTML 리다이렉트됨)");

      // 1. 토큰 즉시 삭제 (좀비 세션 방지)
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");

      // 2. 로그인 페이지로 강제 이동
      window.location.href = "/login";
      
      // 3. 가짜 성공을 에러로 바꿈
      return Promise.reject(new Error("Session expired (Redirected to login)"));
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn("인증 실패:", status);

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");

      const current = window.location.pathname;
      if (!["/login", "/signup", "/oauth2/redirect"].includes(current)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;