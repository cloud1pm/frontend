/**
 * 백엔드 연동 여부 토글.
 * - .env 파일에서 VITE_USE_MOCK_API=false 로 설정하면 실제 API로 전환
 */
export const USE_MOCK_API =
  (import.meta.env.VITE_USE_MOCK_API ?? "true").toLowerCase() !== "false";

export const mockResponse = (data, delay = 300) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });

export const mockError = (error, delay = 300) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });

  