import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 나중에 API 서버 주소로 변경
  withCredentials: true,
});

export default axiosInstance; 
