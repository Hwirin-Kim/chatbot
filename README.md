# Chatbot Project

## 시작하기

### 필수 요구사항

- Docker
- Docker Compose
- OpenAI API 키

### 환경 설정

1. `.env` 파일 생성

```bash
OPENAI_API_KEY=your_api_key_here
```

### 실행 방법

1. 서비스 시작

```bash
# 처음 시작 또는 코드 변경시
docker-compose up -d --build

# 이후 시작시
docker-compose up -d
```

2. 서비스 중지

```bash
docker-compose down
```

3. 데이터 초기화가 필요한 경우

```bash
# 볼륨을 포함한 전체 초기화
docker-compose down -v
```

### 서비스 상태 확인

- Express 서버: http://localhost:3000/api/health
- ChromaDB: http://localhost:8000/api/v1/heartbeat

### 로그 확인

```bash
# 전체 로그
docker-compose logs

# 실시간 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs express-app
docker-compose logs chromadb
```
