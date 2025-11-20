// CharacterPage.jsx - 최종 수정본 (요청사항 반영)

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
  const [error, setError] = useState(null);

  // 현재 캐릭터 단계 계산
  const currentStage = CHARACTER_STAGES.find(
    (s) => character && character.level >= s.minLevel && character.level <= s.maxLevel
  ) || CHARACTER_STAGES[0];

  // 서버에서 캐릭터 정보 가져오기
  const fetchCharacterData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getCharacterInfo();
      console.log("✅ 캐릭터 정보 로드:", data);
      
      setCharacter({
        name: "눈송이",
        level: data.characterLevel,
        totalPoints: data.rice,
        totalFed: data.feedCount,
        daysStreak: data.consecutiveDays,
      });
    } catch (error) {
      console.error("❌ 캐릭터 로드 실패:", error);
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

    // 밥이 부족할 때 메시지를 보여주기 위해 0 이하일 때 return
    if (character.totalPoints <= 0) {
      alert("밥이 부족합니다. 게시글, 댓글, 좋아요, 응원 메시지 작성으로 밥을 획득하세요.");
      return; 
    }

    setFeeding(true);
    setFeedSuccess(false);

    try {
      const updatedData = await userAPI.feedCharacter();
      console.log("✅ Feed response:", updatedData);
      
      setFeedSuccess(true);
      
      const isLevelUp = updatedData.newLevel > character.level;
      
      setCharacter(prev => ({
        ...prev,
        level: updatedData.newLevel,
        totalPoints: updatedData.newRiceCount,
        // 레벨업 시 feedCount를 0으로 리셋, 아니면 1 증가
        totalFed: isLevelUp ? 0 : (prev.totalFed + 1), 
      }));
      
      alert(updatedData.message);

      setTimeout(() => setFeedSuccess(false), 1000);
      
    } catch (error) {
      console.error("🔥 밥 주기 실패:", error);
      
      const axiosError = error;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message;

        if (status !== 400) { 
          alert(`오류가 발생했습니다: ${message || status}`);
        }
      } else if (axiosError.request) {
        alert("서버로부터 응답이 없습니다. 네트워크 연결을 확인하세요.");
      } else {
        alert("요청 설정 중 오류가 발생했습니다.");
      }
    } finally {
      setFeeding(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="character-page">
        <div className="character-container">
          <div className="loading-container">
            <div className="loading-spinner">❄️</div>
            <p className="loading-text">캐릭터 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !character) {
    return (
      <div className="character-page">
        <div className="character-container">
          <div className="error-container">
            <div className="error-icon">😢</div>
            <p className="error-text">{error || "캐릭터 정보를 불러올 수 없습니다."}</p>
            <button className="retry-button" onClick={fetchCharacterData}>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 밥 주기 횟수 (5번당 레벨업)
  const feedCountToLevelUp = 5; 
  const currentFed = character.totalFed % feedCountToLevelUp;
  const progressPercent = (currentFed / feedCountToLevelUp) * 100;
  const remainingFeeds = feedCountToLevelUp - currentFed;

  return (
    <div className="character-page">
      <div className="character-container">
        <div className="page-header">
          <h1 className="page-title">나의 캐릭터</h1>
          <p className="page-subtitle">💧 물방울에서 눈송이로 성장하는 여정</p>
        </div>

        {/* 1. 메인 캐릭터 카드 (이미지, 이름, 레벨, 버튼) */}
        <div className="character-main-card">
          <div className={`card-background ${currentStage.gradient}`}></div>
          
          <div className="character-info-section">
            {/* 중앙으로 이동한 큰 캐릭터 이미지 */}
            <div className="character-avatar-wrapper large-avatar">
              <div className="character-avatar">
                <img 
                  src={currentStage.img} 
                  alt={currentStage.name} 
                  style={{
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain"
                  }}
                />
              </div>
            </div>
            
            {/* 캐릭터 이름 및 레벨 */}
            <div className="character-details text-center">
              <h2 className="character-name">{currentStage.name}</h2>
              <div className="character-level-name">
                <span className="level-text">Lv.{character.level}</span>
              </div>
            </div>

            {/* 연속 출석일과 먹인 횟수 Stat Card */}
            <div className="character-stats-grid">
              <div className="stat-card stat-purple">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-label">연속 출석</span>
                </div>
                <div className="stat-value">{character.daysStreak}일</div>
              </div>
              
              <div className="stat-card stat-amber">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">🔥</span>
                  <span className="stat-label">먹인 횟수</span>
                </div>
                <div className="stat-value">{character.totalFed}번</div>
              </div>
            </div>
          </div>

          {/* 성장 진행도 */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">다음 단계까지 성장 진행도</span>
              <span className="progress-value">{currentFed}/{feedCountToLevelUp}</span>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="progress-description">
              다음 레벨업까지 <strong>{remainingFeeds}번</strong> 남았어요!
            </p>
          </div>

          {/* 밥 주기 버튼 (원래대로 활성화) */}
          <div className="button-container">
            <button
              onClick={handleFeed}
              // 원래의 활성화/비활성화 로직으로 복원
              disabled={feeding || character.totalPoints < 1} 
              className={`feed-button ${
                feeding || character.totalPoints < 1 
                  ? 'feed-button-disabled' 
                  : ''
              } ${feedSuccess ? 'feed-button-success' : ''}`}
            >
              <span className="button-content">
                {feeding ? (
                  <>
                    <span className="button-spinner">⏳</span>
                    밥 주는 중...
                  </>
                ) : feedSuccess ? (
                  "냠냠! 맛있어요 😋"
                ) : character.totalPoints < 1 ? (
                  "밥이 부족해요! 😢"
                ) : (
                  `🍚 밥 주기 1개 (보유: ${character.totalPoints}개)`
                )}
              </span>
            </button>
          </div>
        </div>
        
        {/* 2. 보유 밥 양 (캐릭터 카드와 컨텐츠 그리드 사이) */}
        <div className="rice-mid-section">
          <p className="rice-label">총 보유 밥</p>
          <h2 className="rice-count-mid">
            <span className="rice-icon">🍚</span>
            {character.totalPoints}개
          </h2>
        </div>


        {/* 3. 컨텐츠 그리드 (성장 단계, 밥 획득 방법 - 나란히 배치) */}
        <div className="content-grid">
          {/* 성장 단계 (비활성화 스타일 적용) */}
          <div className="content-card non-interactive-card">
            <div className="card-header">
              <span className="header-icon">🌱</span>
              <h3 className="card-title">성장 단계</h3>
            </div>
            <div className="stages-list">
              {CHARACTER_STAGES.map((stage) => {
                const isActive = character.level >= stage.minLevel && character.level <= stage.maxLevel;
                const isCompleted = character.level > stage.maxLevel;
                
                return (
                  // non-interactive-item 클래스 추가
                  <div
                    key={stage.name}
                    className={`stage-item non-interactive-item ${isActive ? 'stage-item-active' : ''} ${isCompleted ? 'stage-item-completed' : ''}`}
                  >
                    <div className="stage-info">
                      <span className={`stage-emoji ${isActive ? 'stage-emoji-active' : ''}`}>
                        <img 
                          src={stage.img} 
                          alt={stage.name}
                          style={{
                            width: "2rem",
                            height: "2rem",
                            objectFit: "contain"
                          }}
                        />
                      </span>
                      <div className="stage-text">
                        <div className="stage-name">{stage.name}</div>
                        <div className="stage-level">
                          Lv.{stage.minLevel}~{stage.maxLevel}
                        </div>
                      </div>
                    </div>
                    {isCompleted && <div className="stage-check">✓</div>}
                    {isActive && <div className="stage-check">●</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 밥 획득 방법 (비활성화 스타일 적용) */}
          <div className="content-card non-interactive-card">
            <div className="card-header">
              <span className="header-icon">🎯</span>
              <h3 className="card-title">밥 획득 방법</h3>
            </div>
            <div className="missions-list">
              {/* non-interactive-item 클래스 추가 */}
              <div className="mission-item mission-pink non-interactive-item">
                <div className="mission-info">
                  <span className="mission-icon">✍️</span>
                  <span className="mission-title">게시글 작성</span>
                </div>
                <span className="mission-points">+1 🍚</span>
              </div>
              <div className="mission-item mission-blue non-interactive-item">
                <div className="mission-info">
                  <span className="mission-icon">💬</span>
                  <span className="mission-title">댓글 작성</span>
                </div>
                <span className="mission-points">+1 🍚</span>
              </div>
              <div className="mission-item mission-red non-interactive-item">
                <div className="mission-info">
                  <span className="mission-icon">❤️</span>
                  <span className="mission-title">좋아요 누르기</span>
                </div>
                <span className="mission-points">+1 🍚</span>
              </div>
              <div className="mission-item mission-amber non-interactive-item">
                <div className="mission-info">
                  <span className="mission-icon">📝</span>
                  <span className="mission-title">응원 메시지</span>
                </div>
                <span className="mission-points">+1 🍚</span>
              </div>
            </div>
            <div className="missions-hint">
              <p>
                매일 출석하면 밥 +1개, 7일 연속 출석 시 보너스 +5개! 🎁
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
