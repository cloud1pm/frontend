import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityAPI } from "../api/communityApi";
import "./PostEditorPage.css";

const EMOTIONS = ["😊 기쁨", "😢 슬픔", "😡 분노", "😨 불안", "😐 무감정"];

const PostEditorPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

      await communityAPI.createPost(payload);
      alert("게시글이 등록되었습니다!");
      navigate("/community");
    } catch (error) {
      console.error(error);
      alert("게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
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

          <h2>게시글 작성하기</h2>

          <div className="post-editor-page__nickname">
            <strong>❄️ 눈송이</strong>
            <span>닉네임이 표시됩니다</span>
            <label className="post-editor-page__toggle">
              <input type="checkbox" defaultChecked />
              <span className="post-editor-page__toggle-pill" />
            </label>
          </div>
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
              <button type="button">파일</button>
              <button type="button">서식</button>
              <button type="button">사진 첨부하기</button>
              <button type="button" onClick={handleReset}>
                모두 지우기
              </button>
              <button
                type="button"
                className="post-editor-toolbar__submit"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {submitting ? "등록 중..." : "등록하기"}
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

              <div className="post-editor-upload">
                <span>사진 첨부</span>
                {uploadFile ? (
                  <span>{uploadFile.name}</span>
                ) : (
                  <span className="post-editor-upload__placeholder">
                    이미지를 업로드해주세요.
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                />
              </div>

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

