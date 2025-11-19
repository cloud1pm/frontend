import React, { useEffect, useState } from "react";
import "./CharacterPage.css";
import { userAPI } from "../api/userApi"; // userApi 파일 경로에 맞게 수정
// axios 에러 구조를 위한 타입 힌트 (실제 코드에서는 필요 없음)
// import type { AxiosError } from 'axios'; 

// 이미지 Import (경로 확인 필요)
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

  // 서버에서 캐릭터 정보 가져오기
  const fetchCharacterData = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getCharacterInfo();
      setCharacter({
        name: "눈송이", // 이름은 고정이라고 가정
        level: data.characterLevel,
        totalPoints: data.rice,
        totalFed: data.feedCount,
        daysStreak: data.consecutiveDays,
      });
    } catch (error) {
      console.error("❌ 캐릭터 로드 실패:", error);
      // 에러 시 character = null 상태 유지
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, []);

  // 현재 캐릭터 단계 계산
  const currentStage = CHARACTER_STAGES.find(
    (s) => character && character.level >= s.minLevel && character.level <= s.maxLevel
  ) || CHARACTER_STAGES[0];

  const handleFeed = async () => {
    if (!character || feeding) return;

    if (character.totalPoints < 1) {
      alert("밥이 없어요! 게시글을 써서 밥을 모아보세요 🍚");
      return;
    }

    setFeeding(true);
    setFeedSuccess(false);

    try {
      // 💡 [수정] 서버에 밥 주기 요청 후 업데이트된 데이터를 바로 받음
      const updatedData = await userAPI.feedCharacter();
      console.log("✅ Feed response:", updatedData);
      
      setFeedSuccess(true);
      
      // 💡 [수정] 불필요한 재요청 없이 받은 데이터로 상태 즉시 업데이트 (효율성 증가)
      setCharacter(prev => ({
        ...prev,
        level: updatedData.characterLevel,
        totalPoints: updatedData.rice,
        totalFed: updatedData.feedCount,
        // daysStreak은 변경되지 않는다고 가정하고 유지
      }));

      // 1초 후 버튼 상태 초기화
      setTimeout(() => setFeedSuccess(false), 1000);
    } catch (error) {
      console.error("🔥 밥 주기 실패:", error);
      
      // 에러 상세 정보 출력 및 사용자에게 알림
      const axiosError = error; // AxiosError로 가정
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message;

        // 400 Bad Request, 500 Internal Server Error 등에 구체적으로 대응
        if (status === 400 && message.includes("밥이 부족")) {
            alert("🍚 밥이 부족합니다. 게시글을 써서 밥을 모아보세요!");
        } else if (status === 500) {
            alert("🔥 서버 오류: 잠시 후 다시 시도해 주세요.");
        } else {
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

  // 로딩 및 에러 처리
  if (loading) return <div className="loading-container"><div className="loading-spinner">❄️</div></div>;
  if (!character) return <div className="error-container">캐릭터 정보를 불러올 수 없습니다.</div>;

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
              <div className="stat-card stat-purple">
                <p>보유 밥: <strong>{character.totalPoints}</strong>개</p>
              </div>
            </div>
          </div>

          <div className="button-container">
            <button
              onClick={handleFeed}
              disabled={feeding || character.totalPoints < 1} // 💡 밥 부족 시 버튼 비활성화 로직 추가
              className={`feed-button ${feeding ? 'feed-button-disabled' : ''} ${feedSuccess ? 'feed-button-success' : ''}`}
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

        {/* 하단 성장 과정 리스트 */}
        <div className="content-grid">
          <div className="content-card">
            <h3 className="card-title">성장 과정</h3>
            <div className="stages-list">
              {CHARACTER_STAGES.map(s => (
                <div
                  key={s.name}
                  className={`stage-item ${character.level >= s.minLevel && character.level <= s.maxLevel ? 'stage-item-active' : ''}`}
                >
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