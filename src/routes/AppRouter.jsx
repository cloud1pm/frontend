import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import OnboardingPage from "../pages/OnboardingPage";
import ChatPage from "../pages/ChatPage";
import EmotionReportPage from "../pages/EmotionReportPage";
import CommunityPage from "../pages/CommunityPage";
import CharacterPage from "../pages/CharacterPage";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/report" element={<EmotionReportPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/character" element={<CharacterPage />} />
    </Routes>
  </Router>
);

export default AppRouter;
