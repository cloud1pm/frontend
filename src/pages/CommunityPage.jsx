import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./CommunityPage.css";

const COMMUNITY_TABS = [
  { id: "home", label: "Home" },
  { id: "popular", label: "인기글" },
  { id: "recent", label: "최신글" },
  { id: "my-posts", label: "내 작성글" },
];

const buildPagination = (currentPage, totalPages) => {
  if (totalPages <= 1) return [1];

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const pages = [1];

  if (currentPage > 3) {
    pages.push("prev-ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("next-ellipsis");
  }

  pages.push(totalPages);
  return pages;
};

const CommunityPage = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState(COMMUNITY_TABS[0].id);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { items, totalPages: pages = 1 } = await communityAPI.getPosts({
          page: currentPage,
          tab: activeTab,
        });

        if (!ignore) {
          setPosts(items ?? []);
          setTotalPages(Math.max(1, pages));
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      ignore = true;
    };
  }, [activeTab, currentPage]);

  const pagination = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePageChange = (page) => {
    if (page === "prev-ellipsis") {
      setCurrentPage((prev) => Math.max(1, prev - 3));
      return;
    }
    if (page === "next-ellipsis") {
      setCurrentPage((prev) => Math.min(totalPages, prev + 3));
      return;
    }
    if (typeof page === "number" && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  return (
    <section className="community-page">
      <div className="community-page__container">
        <header className="community-page__header">
          <div className="community-page__title-group">
            <h2>커뮤니티</h2>
            <p>서로의 마음을 나누고 응원해요.</p>
          </div>
          <div className="community-page__action">
            <button
              type="button"
              className="community-page__write-button"
              onClick={() => navigate("/community/write")}
            >
              게시글 작성하기
            </button>
          </div>
        </header>

        <nav className="community-page__tabs" aria-label="커뮤니티 탭">
          {COMMUNITY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`community-page__tab ${
                tab.id === activeTab ? "community-page__tab--active" : ""
              }`}
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
            <div className="community-page__error">
              커뮤니티 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </div>
          )}

          {!loading && !error && (
            <>
              {posts.length === 0 ? (
                <div className="community-page__empty">
                  아직 게시글이 없어요. 첫 번째 이야기를 들려주세요!
                </div>
              ) : (
                <>
                  <h3 className="community-page__section-title">최근 게시물</h3>

                  <div className="community-page__posts">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="community-post-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/community/post/${post.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            navigate(`/community/post/${post.id}`);
                          }
                        }}
                      >
                        <div className="community-post-card__header">
                          <div className="community-post-card__author">
                            <div className="community-post-card__avatar" />
                            <span>{post.nickname}</span>
                          </div>
                          <span>{post.date}</span>
                        </div>

                        <p className="community-post-card__content">{post.content}</p>

                        <div className="community-post-card__footer">
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

        {!loading && !error && totalPages > 1 && (
          <div className="community-page__pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← 이전
            </button>

            {pagination.map((pageKey) =>
              typeof pageKey === "string" ? (
                <span key={pageKey} className="community-page__page-number">
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={pageKey}
                  className={`community-page__page-number ${
                    pageKey === currentPage ? "community-page__page-number--active" : ""
                  }`}
                  onClick={() => handlePageChange(pageKey)}
                >
                  {pageKey}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              다음 →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunityPage;
