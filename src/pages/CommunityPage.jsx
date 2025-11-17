// src/pages/CommunityPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./CommunityPage.css";

const COMMUNITY_TABS = [
  { id: "popular", label: "인기글" },
  { id: "recent", label: "최신글" },
  { id: "my-posts", label: "내 작성글" },
];

const buildPagination = (currentPage, totalPages) => {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = [1];

  if (currentPage > 3) pages.push("prev-ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (currentPage < totalPages - 2) pages.push("next-ellipsis");

  pages.push(totalPages);
  return pages;
};

export default function CommunityPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState(COMMUNITY_TABS[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    let ignore = false;

    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await communityAPI.getPosts({ page: currentPage, tab: activeTab });

        if (!ignore) {
          if (Array.isArray(response?.items)) {
            setPosts(response.items);
            setTotalPages(Math.max(1, response.totalPages || 1));
          } else if (Array.isArray(response)) {
            setPosts(response);
            setTotalPages(1);
          } else {
            setPosts([]);
            setTotalPages(1);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setPosts([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadPosts();
    return () => { ignore = true; };
  }, [activeTab, currentPage, refreshKey]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (!document.hidden) setRefreshKey((prev) => prev + 1);
    };
    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, []);

  const pagination = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePageChange = (page) => {
    if (page === "prev-ellipsis") return setCurrentPage((p) => Math.max(1, p - 3));
    if (page === "next-ellipsis") return setCurrentPage((p) => Math.min(totalPages, p + 3));
    if (typeof page === "number" && page !== currentPage) setCurrentPage(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <section className="community-page">
      <div className="community-page__container">

        {/* 헤더 */}
        <header className="community-page__header">
          <div className="community-page__title-group">
            <h2>커뮤니티</h2>
            <p>서로의 마음을 나누고 응원해요.</p>
          </div>

          <button
            className="community-page__write-button"
            onClick={() => navigate("/community/write")}
          >
            게시글 작성하기
          </button>
        </header>

        {/* 탭 */}
        <nav className="community-page__tabs">
          {COMMUNITY_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`community-page__tab ${tab.id === activeTab ? "community-page__tab--active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="community-page__body">

          {loading && (
            <div className="community-page__loading">게시글을 불러오는 중입니다...</div>
          )}

          {!loading && error && (
            <div className="community-page__error">커뮤니티 정보를 불러오지 못했어요.</div>
          )}

          {!loading && !error && (
            <>
              {posts.length === 0 ? (
                <div className="community-page__empty">아직 게시글이 없어요.</div>
              ) : (
                <>
                  <h3 className="community-page__section-title">최근 게시물</h3>

                  <div className="community-page__posts">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="community-post-card"
                        onClick={() => navigate(`/community/post/${post.id}`)}
                      >
                        <div className="community-post-card__header">
                          <div className="community-post-card__author">
                            <div className="community-post-card__avatar" />

                            {/* ✔ username 최우선 */}
                            <span>{post.username || post.nickname || post.authorName}</span>
                          </div>
                          <span>{post.date}</span>
                        </div>

                        <h3 className="community-post-card__title">{post.title}</h3>

                        <p className="community-post-card__content">{post.content}</p>

                        <div className="community-post-card__footer">
                          {/* ✔ 좋아요(❤️), 댓글(💬) 표시 */}
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && !error && totalPages > 1 && (
          <div className="community-page__pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              ← 이전
            </button>

            {pagination.map((p) =>
              typeof p === "string" ? (
                <span key={p} className="community-page__page-number">...</span>
              ) : (
                <button
                  key={p}
                  className={`community-page__page-number ${p === currentPage ? "community-page__page-number--active" : ""}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              )
            )}

            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              다음 →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
