# 1. Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
# 의존성 설치 (CI 환경에서는 npm ci 권장)
RUN npm install
COPY . .
# Vite 빌드 (dist 폴더 생성)
RUN npm run build

# 2. Production Stage (Nginx)
FROM nginx:alpine
# 빌드된 정적 파일들을 Nginx의 서빙 디렉토리로 복사
COPY --from=build /app/dist /usr/share/nginx/html
# SPA 라우팅 설정을 위한 Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트 노출
EXPOSE 80
# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]