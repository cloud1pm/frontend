import React, { useEffect, useMemo, useState } from "react";
import "./CharacterPage.css"; // ✅ 아래의 CSS 파일이 꼭 있어야 디자인이 적용됩니다.
import { userAPI } from "../api/userApi";

// 이미지 Import
import waterImg from "../assets/character/water.png";
import snowImg from "../assets/character/snow.png";
import babyImg from "../assets/character/baby.png";
import noonsongImg from "../assets/character/noonsong.png";

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
  
  const fetchCharacterData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await userAPI.getCharacterInfo();
      console.log("📦 데이터 로드:", data);

      setCharacter({
        name: "눈송이",
        level: data.characterLevel,
        experience: data.feedCount,     
        experienceToNext: 3,            
        daysStreak: data.consecutiveDays,
        totalPoints: data.rice,        
        totalFed: data.feedCount,
      });
    } catch (error) {
      console.error("❌ 로드 실패:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, []);

  const progressPercentage = useMemo(() => {
    if (!character) return 0;
    return Math.min(Math.round((character.experience / 3) * 100), 100);
  }, [character]);

  const currentStage = useMemo(() => {
    if (!character) return CHARACTER_STAGES[0];
    return CHARACTER_STAGES.find(s => character.level >= s.minLevel && character.level <= s.maxLevel) ?? CHARACTER_STAGES[0];
  }, [character]);

  const handleFeed = async () => {
    console.log("👇 밥 주기 버튼 클릭!");

    if (!character || feeding) return;

    if (character.totalPoints < 1) {
      alert("밥이 없어요! 게시글을 써서 밥을 모아보세요 🍚");
      return;
    }

    setFeeding(true);
    setFeedSuccess(false);

    // Optimistic Update
    const prevCharacter = { ...character };
    setCharacter((prev) => {
      const nextExp = prev.experience + 1;
      const isLevelUp = nextExp >= 3; 
      return {
        ...prev,
        totalPoints: prev.totalPoints - 1,
        experience: isLevelUp ? 0 : nextExp,
        level: isLevelUp ? prev.level + 1 : prev.level,
        totalFed: prev.totalFed + 1
      };
    });

    try {
      await userAPI.feedCharacter();
      setFeedSuccess(true);
      await fetchCharacterData(true); 
      setTimeout(() => setFeedSuccess(false), 1000);
    } catch (error) {
      console.error("🔥 에러 발생:", error);
      alert("오류가 발생했습니다.");
      setCharacter(prevCharacter);
    } finally {
      setFeeding(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner">❄️</div></div>;
  if (!character) return <div className="error-container">로딩 실패</div>;

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
                <img src={currentStage.img} alt={currentStage.name} style={{width:"100%", height:"100%", objectFit:"contain"}}/>
              </div>
              <div className="character-level-badge">Lv.{character.level}</div>
            </div>
            <div className="character-details">
              <h2 className="character-name">{character.name}</h2>
              <div className="stat-card stat-purple"><p>보유 밥: <strong>{character.totalPoints}</strong>개</p></div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar-wrapper">
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%`, transition: "width 0.3s ease" }} />
            </div>
            <p className="progress-description">다음 레벨까지 {3 - character.experience}번 남았어요</p>
          </div>

          {/* 🔥 버튼 디자인 적용됨 */}
          <div className="button-container">
            <button
                onClick={handleFeed}
                disabled={feeding}
                className={`feed-button ${feeding ? 'feed-button-disabled' : ''} ${feedSuccess ? 'feed-button-success' : ''}`}
            >
                {feeding ? (
                "⏳ 밥 주는 중..."
                ) : feedSuccess ? (
                "냠냠! 맛있어요 😋"
                ) : (
                `🍚 밥 주기 (밥 1개 소모)`
                )}
            </button>
          </div>
        </div>
        
        {/* 하단 성장 과정 리스트 */}
        <div className="content-grid">
          <div className="content-card">
             <h3 className="card-title">성장 과정</h3>
             <div className="stages-list">
               {CHARACTER_STAGES.map(s => (
                 <div key={s.name} className={`stage-item ${character.level >= s.minLevel && character.level <= s.maxLevel ? 'stage-item-active' : ''}`}>
                   <img src={s.img} alt="" style={{width:24, height:24, marginRight:8}}/>
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