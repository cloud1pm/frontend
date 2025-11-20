import React, { useEffect, useState } from "react";
import "./CharacterPage.css";
import { userAPI } from "../api/userApi";

// 이미지 Import
import waterImg from "../assets/character/water.png";
import snowImg from "../assets/character/snow.png";
import babyImg from "../assets/character/baby.png";
import noonsongImg from "../assets/character/noonsong.png";

// 캐릭터 성장 단계 정의
const CHARACTER_STAGES = [
  { minLevel: 1, maxLevel: 2, name: "물", img: waterImg, gradient: "gradient-blue" },
  { minLevel: 3, maxLevel: 4, name: "얼음결정", img: snowImg, gradient: "gradient-cyan" },
  { minLevel: 5, maxLevel: 6, name: "아기 눈송이", img: babyImg, gradient: "gradient-indigo" },
  { minLevel: 7, maxLevel: 8, name: "눈송이", img: noonsongImg, gradient: "gradient-purple" },
];

const CharacterPage = () => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeding, setFeeding] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);

  // 상태 조회
  const fetchCharacterData = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getCharacterInfo();
      setCharacter({
        name: "눈송이",
        level: data.characterLevel,
        totalPoints: data.rice,
        totalFed: data.feedCount,
        daysStreak: data.consecutiveDays,
      });
    } catch (error) {
      console.error("❌ 캐릭터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, []);

  // 현재 단계 계산
  const currentStage =
    (character &&
      CHARACTER_STAGES.find(
        (s) => character.level >= s.minLevel && character.level <= s.maxLevel
      )) ||
    CHARACTER_STAGES[0];

  // 🍚 밥 주기 처리
  const handleFeed = async () => {
    if (!character || feeding) return;

    if (character.totalPoints < 1) {
      alert("밥이 없어요! 게시글을 써서 밥을 모아보세요 🍚");
      return;
    }

    setFeeding(true);
    setFeedSuccess(false);

    try {
      const updatedData = await userAPI.feedCharacter();
      console.log("🔥 Feed response:", updatedData);

      const { newRiceCount, newLevel, message } = updatedData;

      // ❗ 밥 부족
      if (message && message.includes("밥이 부족")) {
        alert(message);
        return;
      }

      // 정상 feeding 시 UI에서 직접 rice - 1
      const nextRice =
        newRiceCount !== undefined ? newRiceCount : character.totalPoints - 1;

      setFeedSuccess(true);

      setCharacter((prev) => ({
        ...prev,
        level: newLevel !== undefined ? newLevel : prev.level,
        totalPoints: nextRice, // rice 감소 처리
        totalFed: prev.totalFed + 1, // feedCount 증가
      }));

      setTimeout(() => setFeedSuccess(false), 1000);
    } catch (error) {
      console.error("🔥 밥 주기 실패:", error);

      const axiosError = error;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message;

        if (status === 400 && message?.includes("밥이 부족")) {
          alert(message);
        } else if (status === 500) {
          alert("🔥 서버 오류: 잠시 후 다시 시도해주세요.");
        } else {
          alert(`오류: ${message || status}`);
        }
      } else if (axiosError.request) {
        alert("서버 응답이 없습니다. 네트워크를 확인해주세요.");
      } else {
        alert("요청 중 오류가 발생했습니다.");
      }
    } finally {
      setFeeding(false);
    }
  };

  // 로딩 처리
  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner">❄️</div>
      </div>
    );

  if (!character)
    return <div className="error-container">캐릭터 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="character-page">
      <div className="character-container">
        <div className="page-header">
          <h1 className="page-title">나의 캐릭터</h1>
        </div>

        <div className="character-main-card">
          <div className={`card-background ${currentStage.gradient}`}></div>

          <div className="character-info-section">
            <div className="character-avatar-wrapper">
              <div className="character-avatar">
                <img
                  src={currentStage.img}
                  alt={currentStage.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div className="character-level-badge">Lv.{character.level}</div>
            </div>

            <div className="character-details">
              <h2 className="character-name">{character.name}</h2>
              <div className="stat-card stat-purple">
                <p>
                  보유 밥: <strong>{character.totalPoints}</strong>개
                </p>
              </div>
            </div>
          </div>

          <div className="button-container">
            <button
              onClick={handleFeed}
              disabled={feeding || character.totalPoints < 1}
              className={`feed-button ${
                feeding ? "feed-button-disabled" : ""
              } ${feedSuccess ? "feed-button-success" : ""}`}
            >
              {feeding
                ? "⏳ 밥 주는 중..."
                : feedSuccess
                ? "냠냠! 맛있어요 😋"
                : character.totalPoints < 1
                ? "밥 부족 (게시글 쓰기)"
                : `🍚 밥 주기 (밥 1개 소모)`}
            </button>
          </div>
        </div>

        {/* 성장 리스트 */}
        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">성장 과정</h3>

            <div className="stages-list">
              {CHARACTER_STAGES.map((s) => (
                <div
                  key={s.name}
                  className={`stage-item ${
                    character.level >= s.minLevel && character.level <= s.maxLevel
                      ? "stage-item-active"
                      : ""
                  }`}
                >
                  <img src={s.img} alt="" style={{ width: 24, height: 24, marginRight: 8 }} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CharacterPage;
