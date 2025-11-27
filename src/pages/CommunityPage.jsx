import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./CommunityPage.css";

const ITEMS_PER_PAGE = 7;
const TABS = [
  { id: "recent", label: "최신글" },
  { id: "popular", label: "인기글" },
  { id: "my-posts", label: "내 작성글" },
];

const formatDate = (iso) => new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (location.state?.refresh) setRefreshKey((p) => p + 1);
  }, [location]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const res = await communityAPI.getPosts({ tab: activeTab });
        setPosts(Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [activeTab, refreshKey]);

  return (
    <div className="comm-wrapper">
      <div className="comm-container">
        
        {/* 상단 헤더 & 버튼 */}
        <header className="comm-header">
          <div>
            <h1 className="comm-title">커뮤니티</h1>
            <p className="comm-subtitle">서로의 마음을 나누고 응원해요</p>
          </div>
          <button className="comm-write-btn" onClick={() => navigate("/community/write")}>
            🖊️ 글쓰기
          </button>
        </header>

        {/* 탭 메뉴 */}
        <div className="comm-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`comm-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 게시글 목록 */}
        <div className="comm-list">
          {loading ? (
            <div className="comm-loading">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="comm-empty">아직 게시글이 없어요 🍂</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="comm-card"
                onClick={() => navigate(`/community/post/${post.id}`)}
              >
                <div className="comm-card-body">
                  <h3 className="comm-card-title">{post.title}</h3>
                  <p className="comm-card-preview">{post.content}</p>
                </div>
                <div className="comm-card-footer">
                  <div className="comm-card-info">
                    <span className="author">{post.authorName}</span>
                    <span className="date">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="comm-card-stats">
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}