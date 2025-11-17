// src/api/axiosInstance.js

import axios from 'axios';

// 1. axios 인스턴스 정의
const instance = axios.create({ 
    // 백엔드 API의 기본 URL 설정
    baseURL: 'http://localhost:8080', 
    headers: {
        'Content-Type': 'application/json',
    },
    // CORS 및 세션 관리를 위해 필요할 수 있습니다.
    withCredentials: true, 
});

// 2. 요청 인터셉터 추가 (JWT 토큰 자동 삽입)
// 모든 API 요청이 나가기 전에 localStorage에서 토큰을 가져와 Authorization 헤더에 추가합니다.
instance.interceptors.request.use(
    (config) => {
        // ✅ OAuth2RedirectPage에서 저장하는 일반적인 키인 'authToken'을 사용합니다.
        const token = localStorage.getItem("authToken"); 
        
        if (token) {
            // JWT 표준: 토큰 앞에 'Bearer ' 접두사를 붙입니다.
            config.headers.Authorization = `Bearer ${token}`; 
        }
        
        console.log("API 요청:", config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (401 Unauthorized 처리)
instance.interceptors.response.use(
    (response) => {
        console.log("API 응답:", response.config.url, response.status);
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.warn("인증 실패: 로그인이 필요합니다.");
            // ✅ Mock 키가 아닌 실제 키를 제거합니다.
            localStorage.removeItem("authToken"); 
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// 3. ✅ 이름을 지정하여 내보내기 (Named Export로 수정)
// 이 코드를 통해 다른 파일에서 import { axiosInstance } 를 사용할 수 있습니다.
export const axiosInstance = instance;

// ❌ 기존의 export default instance; 는 제거해야 합니다.