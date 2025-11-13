import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "../styles.css";

// Common Components
import SideNav from "../components/common/SideNav";

// Pages
import ChatPage from "../pages/ChatPage";
import EmotionReportPage from "../pages/EmotionReportPage";
import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage"; // 사용할지 말지 결정
import { useAuth } from "../context/AuthContext";

import "../pages/AuthPage.css";
// 로그인 필수
const RequireAuth = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// 온보딩 끝나야 접근 가능
const RequireOnboarded = ({ children }) => {
  const { user } = useAuth();
  if (!user?.isOnboarded) return <Navigate to="/onboarding" replace />;
  return children;
};

/* ----------------------------------------------
   메인 레이아웃 (SideNav 숨김 처리)
---------------------------------------------- */

const NO_SIDENAV_ROUTES = ["/login", "/signup", "/onboarding"];

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const hideSideNav = NO_SIDENAV_ROUTES.includes(location.pathname);

  return (
    <div className="app-layout">
      {!hideSideNav && <SideNav user={user} onLogout={logout} />}
      <div className="main-content">{children}</div>
    </div>
  );
};

/* ----------------------------------------------
   실제 Route 설정
---------------------------------------------- */

const AppRoutes = () => (
  <Routes>
    {/* 로그인 페이지 */}
    <Route path="/login" element={<LoginPage />} />

    {/* 회원가입 페이지 (구글 로그인만 쓸 거면 나중에 지워도 됨) */}
    <Route path="/signup" element={<SignupPage />} />

    {/* 온보딩 */}
    <Route
      path="/onboarding"
      element={
        <RequireAuth>
          <OnboardingPage />
        </RequireAuth>
      }
    />

    {/* 채팅 */}
    <Route
      path="/chat"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <ChatPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 감정 리포트 */}
    <Route
      path="/report"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <EmotionReportPage />
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 커뮤니티 (향후용) */}
    <Route
      path="/community"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <div style={{ padding: "32px" }}>Community Page</div>
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 캐릭터 페이지 */}
    <Route
      path="/character"
      element={
        <RequireAuth>
          <RequireOnboarded>
            <div style={{ padding: "32px" }}>Character Page</div>
          </RequireOnboarded>
        </RequireAuth>
      }
    />

    {/* 기본 라우팅 */}
    <Route path="/" element={<Navigate to="/chat" replace />} />
    <Route path="*" element={<Navigate to="/chat" replace />} />
  </Routes>
);

const AppRouter = () => {
  return (
    <Router>
      <LayoutWrapper>
        <AppRoutes />
      </LayoutWrapper>
    </Router>
  );
};

export default AppRouter;
