import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiHeart, FiMessageCircle, FiTrash2, FiEdit3 } from "react-icons/fi";
import "./CommunityPostPage.css";

const timeFormat = (t) => {
  if (!t) return "";
  return new Date(t).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CommunityPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const postData = await communityAPI.getPostById(postId);
      const commentsData = await communityAPI.getComments(postId);
      setPost(postData);
      setIsLiked(postData.isLiked);
      setCommentList(commentsData || []);
    } catch (err) {
      alert("게시글을 불러오지 못했어요.");
      navigate("/community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      await communityAPI.likePost(postId);
      // 낙관적 업데이트 (UI 즉시 반영)
      setPost(prev => ({ ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 }));
      setIsLiked(!isLiked);
    } catch (err) {
      alert("좋아요 처리 실패!");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      await communityAPI.addComment(postId, commentText.trim());
      setCommentText("");
      // 댓글 목록만 다시 불러오기
      const commentsData = await communityAPI.getComments(postId);
      setCommentList(commentsData || []);
      // 댓글 수 업데이트
      setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠어요?")) return;
    try {
      await communityAPI.deleteComment(commentId);
      const commentsData = await communityAPI.getComments(postId);
      setCommentList(commentsData || []);
      setPost(prev => ({ ...prev, comments: Math.max(0, (prev.comments || 0) - 1) }));
    } catch (err) {
      alert("댓글 삭제 실패");
    }
  };

  const handlePostDelete = async () => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await communityAPI.deletePost(postId);
      alert("게시글이 삭제되었습니다.");
      navigate("/community", { replace: true });
    } catch (err) {
      alert("게시글 삭제 실패");
    }
  };

  if (loading) return <div className="cpp-loading">로딩 중...</div>;
  if (!post) return null;

  return (
    <div className="cpp-wrapper">
      <div className="cpp-container">
        
        {/* 상단 네비게이션 */}
        <div className="cpp-nav">
          <button className="cpp-back-btn" onClick={() => navigate("/community")}>
            <FiArrowLeft size={20} />
            <span>목록으로</span>
          </button>
        </div>

        {/* 게시글 본문 카드 */}
        <article className="cpp-card">
          <header className="cpp-header">
            <h1 className="cpp-title">{post.title}</h1>
            <div className="cpp-meta">
              <div className="cpp-author">
                <span className="cpp-avatar">{post.nickname?.[0] || "U"}</span>
                <span className="cpp-name">{post.nickname || post.authorName}</span>
              </div>
              <span className="cpp-date">{timeFormat(post.createdAt)}</span>
            </div>
          </header>

          <div className="cpp-body">
            <p className="cpp-content">{post.fullContent || post.content}</p>
          </div>

          <div className="cpp-actions">
            <button 
              className={`cpp-like-btn ${isLiked ? "liked" : ""}`} 
              onClick={handleLike}
            >
              <FiHeart className={isLiked ? "fill-heart" : ""} />
              <span>좋아요 {post.likes}</span>
            </button>

            {/* 작성자 본인일 경우 수정/삭제 */}
            {currentUser?.nickname === post.nickname && (
              <div className="cpp-owner-actions">
                <button 
                  onClick={() => navigate(`/community/edit/${postId}`, { state: { post } })}
                >
                  <FiEdit3 /> 수정
                </button>
                <button className="delete" onClick={handlePostDelete}>
                  <FiTrash2 /> 삭제
                </button>
              </div>
            )}
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="cpp-comments-section">
          <h3 className="cpp-comments-title">
            <FiMessageCircle /> 댓글 {commentList.length}개
          </h3>

          <div className="cpp-comment-list">
            {commentList.length === 0 ? (
              <p className="cpp-no-comments">첫 번째 댓글을 남겨보세요! 💬</p>
            ) : (
              commentList.map((c) => (
                <div key={c.id} className="cpp-comment-item">
                  <div className="cpp-comment-header">
                    <span className="cpp-comment-author">{c.authorName}</span>
                    <span className="cpp-comment-date">{timeFormat(c.createdAt)}</span>
                  </div>
                  <p className="cpp-comment-text">{c.content}</p>
                  
                  {currentUser?.nickname === c.authorName && (
                    <button 
                      className="cpp-comment-delete" 
                      onClick={() => handleCommentDelete(c.id)}
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 댓글 입력창 */}
          <div className="cpp-comment-form">
            <textarea
              className="cpp-comment-input"
              placeholder="따뜻한 말 한마디를 남겨주세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button 
              className="cpp-comment-submit" 
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              등록
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}