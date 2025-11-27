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
  { minLevel: 1, maxLevel: 2, name: "물방울", img: waterImg, desc: "아직은 작고 투명해요" },
  { minLevel: 3, maxLevel: 4, name: "얼음결정", img: snowImg, desc: "형태가 잡히기 시작했어요" },
  { minLevel: 5, maxLevel: 6, name: "아기 눈송이", img: babyImg, desc: "포동포동해진 눈송이" },
  { minLevel: 7, maxLevel: 8, name: "눈송이", img: noonsongImg, desc: "완전한 눈송이가 되었어요!" },
];

const CharacterPage = () => {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeding, setFeeding] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 현재 캐릭터 단계 계산
  const currentStage = CHARACTER_STAGES.find(
    (s) => character && character.level >= s.minLevel && character.level <= s.maxLevel
  ) || CHARACTER_STAGES[0];

  // 상태 조회
  const fetchCharacterData = async () => {
    setLoading(true);
    setError(null);
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
      setError("캐릭터 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, []);

  // 밥 주기 핸들러
  const handleFeed = async () => {
    if (!character || feeding) return;

    if (character.totalPoints <= 0) {
      alert("밥이 부족해요! 🍚\n게시글, 댓글, 좋아요, 응원 메시지로 밥을 모아주세요.");
      return;
    }

    setFeeding(true);
    setFeedSuccess(false);

    try {
      const updatedData = await userAPI.feedCharacter();
      const { newRiceCount, newLevel, message } = updatedData;

      if (message && message.includes("밥이 부족")) {
        alert(message);
        return;
      }

      const isLevelUp = updatedData.newLevel > character.level;

      setFeedSuccess(true);
      setCharacter((prev) => ({
        ...prev,
        level: updatedData.newLevel,
        totalPoints: updatedData.newRiceCount,
        totalFed: isLevelUp ? 0 : prev.totalFed + 1,
      }));

      setTimeout(() => setFeedSuccess(false), 1500);

    } catch (error) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setFeeding(false);
    }
  };

  if (loading) return <div className="cp-loading">❄️ 캐릭터를 불러오고 있어요...</div>;
  if (error) return (
    <div className="cp-error">
      <p>{error}</p>
      <button onClick={fetchCharacterData}>다시 시도</button>
    </div>
  );

  const feedCountToLevelUp = 5;
  const currentFed = character.totalFed % feedCountToLevelUp;
  const progressPercent = (currentFed / feedCountToLevelUp) * 100;
  const remainingFeeds = feedCountToLevelUp - currentFed;

  return (
    <div className="cp-wrapper">
      <div className="cp-container">
        
        {/* [왼쪽 패널] 캐릭터 메인 */}
        <section className="cp-left-panel">
          <div className="cp-room-header">
            <h1 className="cp-title">My Character</h1>
            <span className="cp-subtitle">함께 성장하는 눈송이</span>
          </div>

          <div className="cp-character-area">
            <div className={`cp-avatar-container ${feedSuccess ? 'bounce' : ''}`}>
              <img 
                src={currentStage.img} 
                alt={currentStage.name} 
                className="cp-avatar-img"
              />
              {feedSuccess && <div className="cp-heart-effect">💖</div>}
            </div>

            <div className="cp-character-info">
              <h2 className="cp-char-name">{currentStage.name}</h2>
              <span className="cp-char-level">Lv.{character.level}</span>
            </div>

            {/* 경험치 바 */}
            <div className="cp-progress-container">
              <div className="cp-progress-labels">
                <span>성장 진행도</span>
                <span>{currentFed} / {feedCountToLevelUp}</span>
              </div>
              <div className="cp-progress-bar-bg">
                <div 
                  className="cp-progress-bar-fill" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="cp-progress-msg">
                {remainingFeeds}번 더 밥을 먹으면 자라나요! 🌱
              </p>
            </div>
          </div>

          {/* 밥 주기 버튼 */}
          <button 
            className={`cp-feed-btn ${character.totalPoints <= 0 ? 'disabled' : ''}`}
            onClick={handleFeed}
            disabled={feeding || character.totalPoints <= 0}
          >
            {feeding ? "냠냠..." : (
              <>
                <span className="icon">🍚</span> 밥 주기
              </>
            )}
          </button>
        </section>

        {/* [오른쪽 패널] 정보 대시보드 */}
        <section className="cp-right-panel">
          
          {/* 보유 밥 & 스탯 */}
          <div className="cp-card cp-stat-card">
            <div className="cp-rice-display">
              <span className="cp-rice-icon">🍚</span>
              <div className="cp-rice-text">
                <span className="label">보유한 밥</span>
                <span className="count">{character.totalPoints}개</span>
              </div>
            </div>
            <div className="cp-mini-stats">
              <div className="cp-mini-stat">
                <span className="emoji">🔥</span>
                <span className="val">{character.daysStreak}일째 출석</span>
              </div>
              <div className="cp-mini-stat">
                <span className="emoji">🍽️</span>
                <span className="val">총 {character.totalFed}번 식사</span>
              </div>
            </div>
          </div>

          {/* 미션 리스트 */}
          <div className="cp-card cp-mission-card">
            <h3 className="cp-card-title">밥 모으기 미션</h3>
            <ul className="cp-mission-list">
              <li>
                <span className="icon">📝</span>
                <span className="text">게시글 작성</span>
                <span className="reward">+1</span>
              </li>
              <li>
                <span className="icon">💬</span>
                <span className="text">댓글 작성</span>
                <span className="reward">+1</span>
              </li>
              <li>
                <span className="icon">💌</span>
                <span className="text">응원 메시지 남기기</span>
                <span className="reward">+1</span>
              </li>
              <li>
                <span className="icon">❤️</span>
                <span className="text">좋아요 누르기</span>
                <span className="reward">+1</span>
              </li>
            </ul>
          </div>

          {/* 성장 지도 */}
          <div className="cp-card cp-map-card">
            <h3 className="cp-card-title">성장 지도</h3>
            <div className="cp-stage-list">
              {CHARACTER_STAGES.map((stage) => {
                const isPassed = character.level > stage.maxLevel;
                const isCurrent = character.level >= stage.minLevel && character.level <= stage.maxLevel;
                
                return (
                  <div key={stage.name} className={`cp-stage-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}>
                    <div className="dot"></div>
                    <div className="info">
                      <span className="name">{stage.name}</span>
                      {isCurrent && <span className="badge">현재</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default CharacterPage;