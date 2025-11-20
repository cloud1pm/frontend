// src/pages/OAuth2RedirectPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuth2RedirectPage = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");

        if (!token) {
          //console.error("OAuth Redirect: token 없음");
          setError("인증 토큰을 받지 못했습니다.");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        //console.log("[OAuth2Redirect] 받은 토큰:", token);

        // AuthContext 처리 → 자동 세션 저장 + 사용자 정보 업데이트
        const session = await googleLogin(token);
        const user = session.user;

        //console.log(" [OAuth2Redirect] 유저 정보:", user);

        // hasCompletedInitialSetup 체크
        if (user.hasCompletedInitialSetup === false || user.hasCompletedInitialSetup === null) {
          //console.log("[OAuth2Redirect] 온보딩 미완료 → /onboarding 이동");
          navigate("/onboarding", { replace: true });
        } else {
         //console.log(" [OAuth2Redirect] 온보딩 완료 → /chat 이동");
          navigate("/chat", { replace: true });
        }
      } catch (err) {
        //console.error(" OAuth 처리 실패:", err);
        setError(err.response?.data?.message || "로그인 처리 중 오류가 발생했습니다.");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleOAuthCallback();
  }, [googleLogin, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fafafa",
      gap: "16px",
    }}>
      {error ? (
        <>
          <div style={{
            padding: "16px 24px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            maxWidth: "400px",
            textAlign: "center",
          }}>
            {error}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            로그인 페이지로 이동합니다...
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e5e7eb",
            borderTopColor: "#7c3aed",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "16px", color: "#111827", fontWeight: "500" }}>
            로그인 처리 중...
          </div>
        </>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuth2RedirectPage;