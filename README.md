# Chatbot Project with ChromaDB and Express

## 문제 해결 로그

### 1. ChromaDB 컨테이너 실행 문제

#### 초기 문제

- ChromaDB 컨테이너가 시작되지 않는 문제 발생
- `uvicorn` 명령어 인식 오류

#### 시도한 해결 방법

1. Dockerfile에서 시작 명령어 수정

```dockerfile
CMD ["python", "-m", "chromadb.app"]
```

2. 최종적으로 공식 이미지 직접 사용으로 해결

```yaml
services:
  chromadb:
    image: chromadb/chroma
    ports:
      - "8000:8000"
```

### 2. ChromaDB API 버전 문제

#### 발견된 문제

- v1 API가 더 이상 지원되지 않음
- 헬스체크 엔드포인트 호출 시 v2 사용 필요성 확인

```bash
curl http://localhost:8000/api/v1/heartbeat
# 응답: {"error":"Unimplemented","message":"The v1 API is deprecated. Please use /v2 apis"}
```

#### 해결 방법

1. 서비스 코드를 v2 API 엔드포인트로 업데이트
2. API 응답 형식에 맞게 쿼리 파라미터 수정
3. 컬렉션 조작 메서드들의 엔드포인트 경로 수정

## 현재 상태

- ChromaDB 서버: `localhost:8000`에서 정상 실행 중
- Express 서버: `localhost:3000`에서 정상 실행 중
- ChromaDB v2 API 사용 준비 완료

## 다음 단계

1. API 엔드포인트 테스트
2. 임베딩 생성 및 저장 테스트
3. 유사도 검색 테스트

## Postman 테스트 가이드

### 기본 설정

1. 환경 변수 설정
   - `BASE_URL`: `http://localhost:3000`
   - `COLLECTION_NAME`: `chatbot_data`

### API 엔드포인트

1. 문서 추가 (임베딩 생성 & 저장)

```http
POST {{BASE_URL}}/api/embedding/add
Content-Type: application/json

{
    "collectionName": "chatbot_data",
    "document": "자전거 잠금장치는 QR코드를 스캔하여 열 수 있습니다."
}
```

2. 유사도 검색

```http
POST {{BASE_URL}}/api/embedding/query
Content-Type: application/json

{
    "collectionName": "chatbot_data",
    "query": "자전거 잠금장치 어떻게 열어요?",
    "limit": 1
}
```

### 테스트 시나리오

1. 샘플 데이터 추가하기

```json
// 첫 번째 문서
{
    "collectionName": "chatbot_data",
    "document": "자전거 잠금장치는 QR코드를 스캔하여 열 수 있습니다."
}

// 두 번째 문서
{
    "collectionName": "chatbot_data",
    "document": "헬멧은 자전거 대여소 옆 보관함에서 빌릴 수 있습니다."
}

// 세 번째 문서
{
    "collectionName": "chatbot_data",
    "document": "자전거 대여는 하루 최대 2시간까지 가능합니다."
}
```

2. 검색 테스트

```json
{
  "collectionName": "chatbot_data",
  "query": "자전거 잠금장치 어떻게 열어요?",
  "limit": 1
}
```

### 예상 응답

1. 문서 추가 성공 응답

```json
{
  "success": true,
  "message": "Document added successfully"
}
```

2. 검색 결과 응답

```json
{
  "ids": ["doc_1234567890"],
  "distances": [0.123],
  "documents": ["자전거 잠금장치는 QR코드를 스캔하여 열 수 있습니다."]
}
```

### 주의사항

- 서버와 ChromaDB가 모두 실행 중이어야 합니다
- OpenAI API 키가 환경변수에 설정되어 있어야 합니다
- 처음 컬렉션에 문서를 추가할 때 자동으로 컬렉션이 생성됩니다

## 도커 명령어 가이드

### 기본 명령어

1. 서비스 시작

```bash
# 기본 시작
docker-compose up -d

# 변경사항 있을 때 (이미지 재빌드 포함)
docker-compose up -d --build
```

2. 서비스 중지

```bash
# 컨테이너만 중지
docker-compose stop

# 컨테이너 중지 및 제거
docker-compose down
```

3. 변경사항 적용을 위한 재시작

```bash
# 전체 재시작 (가장 많이 사용)
docker-compose down && docker-compose up -d --build

# 특정 서비스만 재시작
docker-compose restart express-app
```

4. 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs

# 실시간 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs express-app
docker-compose logs chromadb
```

5. 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker-compose ps

# 더 자세한 정보 (일반 도커 명령어)
docker ps
```

6. 컨테이너 접속

```bash
# Express 서버 컨테이너 접속
docker-compose exec express-app sh

# ChromaDB 컨테이너 접속
docker-compose exec chromadb sh
```

7. 볼륨 관리

```bash
# 볼륨을 포함한 전체 초기화
docker-compose down -v

# 사용하지 않는 볼륨 정리
docker volume prune
```

### 자주 발생하는 시나리오

1. 코드 변경 후 재시작

```bash
docker-compose down && docker-compose up -d --build
```

2. 서비스 로그 확인

```bash
# 실시간 로그 (Ctrl+C로 중단)
docker-compose logs -f

# 최근 로그 100줄
docker-compose logs --tail=100
```

3. 특정 서비스만 재시작

```bash
# Express 서버만 재시작
docker-compose restart express-app
```

4. 전체 초기화 (문제 해결 시)

```bash
# 컨테이너, 이미지, 볼륨 모두 제거 후 재시작
docker-compose down -v
docker-compose up -d --build
```

### 유용한 팁

1. 컨테이너 상태 모니터링

```bash
# 실시간 리소스 사용량 확인
docker stats
```

2. 디스크 정리

```bash
# 사용하지 않는 리소스 정리
docker system prune -a
```

3. 빌드 캐시 제거

```bash
# 깨끗한 빌드를 위한 캐시 제거
docker-compose build --no-cache
```

### 주의사항

- `-v` 플래그는 볼륨을 삭제하므로 데이터가 날아갈 수 있습니다
- `--build` 플래그는 이미지를 새로 빌드하므로 시간이 더 걸립니다
- 실시간 로그 확인 시 터미널이 느려질 수 있으므로 필요할 때만 사용
# chatbot
