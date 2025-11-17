// src/api/config.js
export const USE_MOCK_API = false; // ⭐ false로 변경하면 백엔드 사용

export const mockResponse = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 300);
  });
};

export const mockError = (error, delay = 300) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(error);
    }, delay);
  });
};