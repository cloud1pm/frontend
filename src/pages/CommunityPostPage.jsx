import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./CommunityPostPage.css";

// 시간 경과 계산 함수
const getTimeElapsed = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CommunityPostPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // 현재 로그인한 사용자 정보 가져오기
    const session = JSON.parse(localStorage.getItem("mockAuthToken") || "{}");
    if (session.user?.id) {
      setCurrentUserId(session.user.id);
      setCurrentUserNickname(session.user.nickname);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadPostAndComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postData, commentsData, likeStatus] = await Promise.all([
          communityAPI.getPostById(postId),
          communityAPI.getComments(postId),
          communityAPI.checkLikeStatus(postId),
        ]);

        if (!ignore) {
          if (!postData) {
            setError(new Error("게시글을 찾을 수 없습니다."));
          } else {
            setPost(postData);
            setComments(commentsData);
            setIsLiked(likeStatus?.isLiked || false);
          }
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

    loadPostAndComments();

    return () => {
      ignore = true;
    };
  }, [postId]);

  const handleLike = async () => {
    try {
      const response = await communityAPI.likePost(postId);
      if (response?.success) {
        setPost((prev) => ({
          ...prev,
          likes: response.likes,
        }));
        setIsLiked(response.isLiked);
        
        if (response.isLiked) {
          alert("좋아요! 밥 1개를 획득했습니다 🍚");
        }
      }
    } catch (err) {
      console.error(err);
      alert("좋아요를 누르지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim().length === 0 || submittingComment) return;

    setSubmittingComment(true);
    try {
      const response = await communityAPI.addComment(postId, commentText.trim());
      if (response?.success && response?.comment) {
        setComments((prev) => [...prev, response.comment]);
        setCommentText("");
        alert("댓글이 등록되었습니다! 밥 1개를 획득했습니다 🍚");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await communityAPI.deleteComment(postId, commentId);
      if (response?.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        alert("댓글이 삭제되었습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleEditPost = () => {
    navigate(`/community/edit/${postId}`, { state: { post } });
  };

  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await communityAPI.deletePost(postId);
      if (response?.success) {
        alert("게시글이 삭제되었습니다.");
        navigate("/community", { state: { refresh: true } });
      }
    } catch (err) {
      console.error(err);
      alert("게시글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

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
          <>
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
                <button
                  type="button"
                  className="community-post-page__like-button"
                  onClick={handleLike}
                >
                  {isLiked ? "❤️" : "🤍"} {post.likes}
                </button>
                <span>💬 {comments.length}</span>
              </div>

              {currentUserNickname && currentUserNickname === post.nickname && (
                <div className="community-post-page__actions">
                  <button
                    type="button"
                    className="community-post-page__edit-button"
                    onClick={handleEditPost}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="community-post-page__delete-button"
                    onClick={handleDeletePost}
                  >
                    삭제
                  </button>
                </div>
              )}
            </article>

            <div className="community-post-page__divider" />

            <section className="community-post-page__comments-section">
              <h2 className="community-post-page__comments-header">
                댓글 {comments.length}개
              </h2>

              {comments.length > 0 && (
                <div className="community-post-page__comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="community-comment">
                      <div className="community-comment__header">
                        <div className="community-comment__author">
                          <span>{comment.author}</span>
                        </div>
                        <div className="community-comment__meta">
                          <span>{getTimeElapsed(comment.timestamp || comment.id)}</span>
                          {currentUserId && comment.userId === currentUserId && (
                            <button
                              type="button"
                              className="community-comment__delete"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="community-comment__content">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="community-post-page__comment-form">
                <label htmlFor="comment-textarea">댓글 작성하기</label>
                <textarea
                  id="comment-textarea"
                  className="community-post-page__comment-textarea"
                  placeholder="따뜻한 말 한마디를 남겨주세요."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="button"
                  className="community-post-page__comment-submit"
                  onClick={handleCommentSubmit}
                  disabled={commentText.trim().length === 0 || submittingComment}
                >
                  {submittingComment ? "등록 중..." : "댓글 작성하기"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
};

export default CommunityPostPage;