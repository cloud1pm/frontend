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
 * 응답 인터셉터 (★ 핵심 안정 버전)
 * ---------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response) => {
    const contentType = response.headers["content-type"] || "";
    const responseURL = response.request?.responseURL || "";

    // 1) JSON 응답이면 절대 세션 만료 처리하지 않음
    if (contentType.includes("application/json")) {
      return response;
    }

    // 2) HTML이지만 "정상 API URL"이면 오탐 방지
    //    (백엔드가 에러로 HTML을 보내도 이 경우는 정상 처리)
    const apiPaths = ["/api/", "/user/", "/auth/", "/character"];
    const isApiRequest = apiPaths.some((p) => responseURL.includes(p));

    if (isApiRequest) {
      return response; // HTML이어도 API 요청이면 절대 리다이렉트 금지
    }

    // 3) 진짜 로그인 페이지로 리다이렉트된 경우만 세션만료로 판단
    if (
      contentType.includes("text/html") &&
      (responseURL.endsWith("/login") || responseURL.includes("/oauth2/authorization"))
    ) {

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");

      window.location.href = "/login";

      return Promise.reject(new Error("Session expired"));
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;

    // 401/403 → 토큰 만료 or 인증 실패
    if (status === 401 || status === 403) {

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
