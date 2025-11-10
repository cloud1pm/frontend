// src/api/chatApi.js
export const sendMessage = async (message) => {
  console.log("Mock API called with message:", message);

  // 가짜 딜레이 (서버 응답처럼 보이게)
  await new Promise(resolve => setTimeout(resolve, 500));

  // 입력 내용에 따라 단순 분기
  if (message.includes("행복") || message.includes("좋아")) {
    return {
      message: "정말 기분이 좋으시겠어요! 😊 오늘 하루도 행복하게 보내세요.",
      sentiment: "positive",
      riskLevel: 4
    };
  } else if (message.includes("힘들") || message.includes("우울")) {
    return {
      message: "괜찮아요. 오늘 하루 많이 버티셨죠 🫶 잠시 쉬어가는 것도 괜찮아요.",
      sentiment: "negative",
      riskLevel: 2
    };
  } else {
    return {
      message: "소중한 마음을 나눠주셔서 감사해요 💜",
      sentiment: "neutral",
      riskLevel: 3
    };
  }
};
