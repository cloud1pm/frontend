// src/pages/OAuth2RedirectPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";

const OAuth2RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        // URL에서 token 파라미터 추출
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          console.error("OAuth2 토큰이 없습니다.");
          alert("로그인 처리 중 오류가 발생했습니다.");
          navigate("/login");
          return;
        }

        console.log("OAuth2 토큰 받음:", token);

        // 토큰을 Authorization 헤더에 설정하여 사용자 정보 가져오기
        const { data: userData } = await axiosInstance.get("/api/user", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        console.log("사용자 정보:", userData);

        // 세션 저장
        const session = {
          token: token,
          user: {
            id: userData.id,
            email: userData.email,
            nickname: userData.nickname,
            profileImageUrl: userData.profileImageUrl,
            isOnboarded: userData.hasCompletedInitialSetup,
            provider: userData.provider
          }
        };

        localStorage.setItem("mockAuthToken", JSON.stringify(session));

        // 온보딩 완료 여부에 따라 리다이렉트
        if (userData.hasCompletedInitialSetup) {
          navigate("/chat");
        } else {
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("OAuth2 처리 중 오류:", error);
        alert("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    };

    handleOAuth2Redirect();
  }, [location, navigate]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
      backgroundColor: "#f8fafc"
    }}>
      <div style={{ 
        textAlign: "center",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <h2 style={{ 
          fontSize: "24px", 
          fontWeight: "700", 
          color: "#111827",
          marginBottom: "8px"
        }}>
          로그인 중...
        </h2>
        <p style={{ 
          fontSize: "16px", 
          color: "#6b7280" 
        }}>
          잠시만 기다려주세요.
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OAuth2RedirectPage;