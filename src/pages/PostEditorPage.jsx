import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./PostEditorPage.css";

const EMOTIONS = ["😊 기쁨", "😢 슬픔", "😡 분노", "😨 불안", "😐 무감정"];

const PostEditorPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  const isEditMode = !!postId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && location.state?.post) {
      const { post } = location.state;
      setTitle(post.title || "");
      setContent(post.content || "");
      setSelectedEmotion(post.emotion || null);
    }
  }, [isEditMode, location.state]);

  const isSubmitDisabled = useMemo(
    () => submitting || title.trim().length === 0 || content.trim().length === 0,
    [content, submitting, title]
  );

  const handleReset = () => {
    setTitle("");
    setContent("");
    setSelectedEmotion(null);
    setUploadFile(null);
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        emotion: selectedEmotion,
        image: uploadFile,
      };

      if (isEditMode) {
        // 수정 모드
        const response = await communityAPI.updatePost(postId, payload);
        if (response?.success) {
          alert("게시글이 수정되었습니다!");
          navigate(`/community/post/${postId}`, { state: { refresh: true } });
        }
      } else {
        // 작성 모드
        const response = await communityAPI.createPost(payload);
        if (response?.success) {
          alert("게시글이 등록되었습니다! 밥 1개를 획득했습니다 🍚");
          navigate("/community", { state: { refresh: true } });
        }
      }
    } catch (error) {
      console.error(error);
      alert(`게시글 ${isEditMode ? '수정' : '등록'}에 실패했습니다. 잠시 후 다시 시도해주세요.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="post-editor-page">
      <div className="post-editor-page__container">
        <header className="post-editor-page__header">
          <button
            type="button"
            className="post-editor-page__back-button"
            onClick={() => navigate(-1)}
          >
            ← 돌아가기
          </button>

          <h2>{isEditMode ? "게시글 수정하기" : "게시글 작성하기"}</h2>
        </header>

        <div className="post-editor-page__body">
          <aside className="post-editor-emotions">
            <div>
              <h4>지금 느끼는 감정</h4>
              <div className="post-editor-emotions__list">
                {EMOTIONS.map((emotion) => (
                  <label
                    key={emotion}
                    className={`post-editor-emotions__item ${
                      selectedEmotion === emotion ? "post-editor-emotions__item--active" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmotion === emotion}
                      onChange={() =>
                        setSelectedEmotion((prev) => (prev === emotion ? null : emotion))
                      }
                    />
                    {emotion}
                  </label>
                ))}
              </div>
            </div>

            <div className="post-editor-guide">
              <h5>✏️ 글쓰기 가이드</h5>
              <ul>
                <li>진솔한 나의 감정을 나눠주세요.</li>
                <li>타인을 비하하거나 상처주는 표현은 삼가주세요.</li>
                <li>개인정보(전화번호, 주소)는 공개하지 마세요.</li>
              </ul>
            </div>
          </aside>

          <div className="post-editor-form">
            <div className="post-editor-toolbar">
              <button
                type="button"
                className="post-editor-toolbar__submit"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {submitting ? (isEditMode ? "수정 중..." : "등록 중...") : (isEditMode ? "수정하기" : "등록하기")}
              </button>
            </div>

            <div className="post-editor-fields">
              <label htmlFor="post-editor-title">제목</label>
              <input
                id="post-editor-title"
                className="post-editor-input"
                type="text"
                placeholder="제목을 입력하세요."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor="post-editor-content">내용</label>
              <textarea
                id="post-editor-content"
                className="post-editor-textarea"
                placeholder="오늘의 감정, 생각을 자유롭게 나눠보세요."
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostEditorPage;