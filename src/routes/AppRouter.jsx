import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "../styles.css";
import SideNav from "../components/common/SideNav";
import ChatPage from "../pages/ChatPage";
import EmotionReportPage from "../pages/EmotionReportPage";
import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import { useAuth } from "../context/AuthContext";
import "../pages/AuthPage.css";

const NO_SIDENAV_ROUTES = ["/login", "/signup", "/onboarding"];
const PLAIN_LAYOUT_ROUTES = ["/login", "/signup"];

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const hideSideNav = NO_SIDENAV_ROUTES.includes(location.pathname);
  const usePlainLayout = PLAIN_LAYOUT_ROUTES.includes(location.pathname);

  if (usePlainLayout) {
    return <div className="plain-layout">{children}</div>;
  }

  return (
    <div className="app-layout">
      {!hideSideNav && <SideNav user={user} onLogout={logout} />}
      <div className="main-content">{children}</div>
    </div>
  );
};

const LoadingFallback = () => (
  <div className="plain-layout">
    <div className="auth-card">
      <h2>로딩 중...</h2>
    </div>
  </div>
);

const GuestOnly = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();
  if (loading) return <LoadingFallback />;
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.isOnboarded ? "/chat" : "/onboarding"}
        replace
      />
    );
  }
  return children;
};

const RequireAuth = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireNotOnboarded = ({ children }) => {
  const { user } = useAuth();
  if (user?.isOnboarded) {
    return <Navigate to="/chat" replace />;
  }
  return children;
};

const RequireOnboarded = ({ children }) => {
  const { user } = useAuth();
  if (!user?.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <GuestOnly>
          <LoginPage />
        </GuestOnly>
      }
    />
    <Route
      path="/signup"
      element={
        <GuestOnly>
          <SignupPage />
        </GuestOnly>
      }
    />
    <Route
      path="/onboarding"
      element={
        <RequireAuth>
          <RequireNotOnboarded>
            <OnboardingPage />
          </RequireNotOnboarded>
        </RequireAuth>
      }
    />
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
