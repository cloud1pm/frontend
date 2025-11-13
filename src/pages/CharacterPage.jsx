import React, { useEffect, useMemo, useState } from "react";
import "./CharacterPage.css";
import { userAPI } from "../api/userApi";

import waterImg from "../assets/character/water.png";
import snowImg from "../assets/character/snow.png";
import babyImg from "../assets/character/baby.png";
import noonsongImg from "../assets/character/noonsong.png";

const CHARACTER_STAGES = [
  { id: "Lv. 1-2", minLevel: 1, maxLevel: 2, name: "물방울", image: waterImg },
  { id: "Lv. 3-4", minLevel: 3, maxLevel: 4, name: "얼음 결정", image: snowImg },
  { id: "Lv. 5-6", minLevel: 5, maxLevel: 6, name: "아기 눈송이", image: babyImg },
  { id: "Lv. 7-8", minLevel: 7, maxLevel: 8, name: "눈송이", image: noonsongImg },
];

const CharacterPage = () => {
  const [character, setCharacter] = useState(null);
  const [growthMissions, setGrowthMissions] = useState([]);
  const [dailyMissions, setDailyMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeding, setFeeding] = useState(false);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [characterInfo, growthList, missions] = await Promise.all([
          userAPI.getCharacterInfo(),
          userAPI.getGrowthMissions(),
          userAPI.getDailyMissions(),
        ]);

        if (!ignore) {
          setCharacter(characterInfo);
          setGrowthMissions(growthList);
          setDailyMissions(missions);
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

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const remainingExp = useMemo(() => {
    if (!character) return 0;
    return Math.max(character.experienceToNext - character.experience, 0);
  }, [character]);

  const progressPercentage = useMemo(() => {
    if (!character) return 0;
    if (character.experienceToNext === 0) return 0;
    return Math.min(
      Math.round((character.experience / character.experienceToNext) * 100),
      100
    );
  }, [character]);

  const currentStage = useMemo(() => {
    if (!character) return CHARACTER_STAGES[0];
    return (
      CHARACTER_STAGES.find(
        (stage) => character.level >= stage.minLevel && character.level <= stage.maxLevel
      ) ?? CHARACTER_STAGES[CHARACTER_STAGES.length - 1]
    );
  }, [character]);

  const growthStages = useMemo(() => {
  if (!character) return CHARACTER_STAGES;
  return CHARACTER_STAGES.map((stage) => {
    const mission = growthMissions.find(
      (item) => item.level === stage.id || item.title === stage.name
    );
    return {
      ...stage,
      completed: mission?.completed ?? character.level > stage.maxLevel,
    };
  });
}, [character, growthMissions]);


  const handleFeed = async () => {
    if (!character || feeding || character.totalPoints <= 0) return;

    setFeeding(true);
    try {
      const response = await userAPI.feedCharacter();
      if (response?.success) {
        setCharacter((prev) => {
          if (!prev) return prev;

          const updatedExperience = prev.experience + 1;
          const updatedTotalPoints = Math.max(prev.totalPoints - 1, 0);
          const updatedTotalFed = prev.totalFed + 1;

          let experience = updatedExperience;
          let level = prev.level;
          let experienceToNext = prev.experienceToNext;

          if (updatedExperience >= prev.experienceToNext) {
            level = prev.level + 1;
            experience = updatedExperience - prev.experienceToNext;
            experienceToNext = Math.round(prev.experienceToNext * 1.2);
          }

          return {
            ...prev,
            experience,
            level,
            experienceToNext,
            totalPoints: updatedTotalPoints,
            totalFed: updatedTotalFed,
          };
        });
      }
    } catch (err) {
      console.error(err);
      alert("밥 주기 도중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setFeeding(false);
    }
  };

  if (loading) {
    return (
      <section className="character-page">
        <div className="character-page__container">캐릭터 정보를 불러오는 중입니다...</div>
      </section>
    );
  }

  if (error || !character) {
    return (
      <section className="character-page">
        <div className="character-page__container">
          캐릭터 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </div>
      </section>
    );
  }

  return (
    <section className="character-page">
      <div className="character-page__container">
        <header className="character-page__header">
          <h2>나의 캐릭터</h2>
          <p>챗봇과 함께 성장하는 눈송이를 돌봐주세요.</p>
        </header>

        <div className="character-page__summary-card">
          <div className="character-page__identity">
            <img
              className="character-page__avatar"
              src={currentStage.image}
              alt={`${currentStage.name} 단계 캐릭터`}
            />
            <div>
              <h3>
                {character.name}
                <span className="character-page__level-chip">Lv.{character.level}</span>
              </h3>
              <p>{character.statusMessage}</p>
              <p>오늘은 {character.personality} 상태예요.</p>
            </div>
          </div>

          <div className="character-page__badges">
            <div className="character-page__badge character-page__badge--yellow">
              <span className="character-page__badge-title">⭐ 연속 {character.daysStreak}일</span>
              <span className="character-page__badge-desc">
                꾸준히 접속하면 매일 밥을 1개 얻을 수 있어요!
              </span>
            </div>
            <div className="character-page__badge character-page__badge--purple">
              <span className="character-page__badge-title">✨ 총 밥 급여</span>
              <span className="character-page__badge-desc">
                지금까지 {character.totalFed}번 밥을 먹였어요.
              </span>
            </div>
          </div>
        </div>

        <div className="character-page__progress">
          <span className="character-page__progress-label">
            다음 레벨까지 {remainingExp}번 남았어요!
          </span>
          <div className="character-page__progress-bar">
            <div
              className="character-page__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <button
            type="button"
            className="character-page__feed-button"
            onClick={handleFeed}
            disabled={character.totalPoints <= 0 || feeding}
          >
            {feeding ? "밥 주는 중..." : `밥 주기 🍚 (보유 ${character.totalPoints}개)`}
          </button>
        </div>

        <div className="character-page__columns">
          <section className="character-card">
            <div className="character-card__header">📈 성장 단계</div>
            <div className="character-card__list">
              {growthStages.map((stage) => {
                const isActive =
                  character.level >= stage.minLevel && character.level <= stage.maxLevel;
                return (
                  <div
                    key={stage.name}
                    className={`character-growth-item ${
                      isActive ? "character-growth-item--active" : ""
                    }`}
                  >
                    <div className="character-growth-item__info">
                      <img
                        className="character-growth-item__icon"
                        src={stage.image}
                        alt={stage.name}
                      />
                      <div className="character-growth-item__text">
                        <span className="character-growth-item__stage">
                          Lv.{stage.minLevel}-{stage.maxLevel}
                        </span>
                        <span>{stage.name}</span>
                      </div>
                    </div>
                    {(isActive || stage.completed) && (
                      <span className="character-growth-item__check">✔</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="character-card">
            <div className="character-card__header">📅 밥 획득 방법</div>
            <div className="character-card__list">
              {dailyMissions.map((mission) => (
                <div key={mission.id} className="character-mission">
                  <span>
                    {mission.icon} {mission.title}
                  </span>
                  <span>+{mission.points}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="character-page__rice-box">
          <span>🍚 보유 밥</span>
          <strong>{character.totalPoints}</strong>
        </footer>
      </div>
    </section>
  );
};

export default CharacterPage;
