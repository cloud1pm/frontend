import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./CommunityPostPage.css";

const CommunityPostPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await communityAPI.getPostById(postId);
        if (!ignore) {
          setPost(data);
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

    loadPost();

    return () => {
      ignore = true;
    };
  }, [postId]);

  return (
    <section className="community-post-page">
      <div className="community-post-page__container">
        <button
          type="button"
          className="community-post-page__back"
          onClick={() => navigate("/community")}
        >
          ← 목록으로 돌아가기
        </button>

        {loading && (
          <div className="community-post-page__loading">게시글을 불러오는 중입니다...</div>
        )}

        {!loading && error && (
          <div className="community-post-page__alert community-post-page__alert--error">
            게시글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {!loading && !error && post && (
          <article className="community-post-page__meta">
            <h1 className="community-post-page__title">{post.title ?? "커뮤니티 게시글"}</h1>

            <div className="community-post-page__info">
              <strong>{post.nickname}</strong>
              <span>{post.date}</span>
            </div>

            <div className="community-post-page__content">
              {post.fullContent || post.content}
            </div>

            <div className="community-post-page__footer">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

export default CommunityPostPage;

