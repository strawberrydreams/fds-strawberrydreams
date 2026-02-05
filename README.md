# FDS Strawberrydreams

FDS Strawberrydreams는 FDS(Fraud Detection System) 데이터를 기반으로 통계 대시보드와 챗봇 프로토타입을 실험하는 멀티 앱 워크스페이스입니다.
React SPA 버전, Thymeleaf 서버 렌더링 버전, 그리고 Python 기반 RAG 챗봇이 함께 포함되어 있습니다.

**Components**
| 모듈 | 설명 | 기술 스택 |
| --- | --- | --- |
| `fds-statsdashboard-react` | 통계 API + React SPA 대시보드 | Spring Boot 4.0.1, Java 21, React, Vite |
| `fds-statsdashboard-thymeleaf` | 서버 렌더링 통계 대시보드 | Spring Boot 3.5.9, Java 17, Thymeleaf |
| `fds-aichatbot` | TF-IDF + OpenAI 호환 LLM RAG 챗봇 | Python, Flask, scikit-learn |

**Key Features**
- 사용자 통계 대시보드: KPI, 계좌/카드/거래/탐지 요약, 최근 거래
- 관리자 통계 대시보드: 사용자/계좌/카드/거래/탐지/신고/블랙리스트/코드북 지표
- 스냅샷 관리: 주간 스냅샷 자동 생성(월 00:00 Asia/Seoul), 목록/상세 조회, 관리자 재생성
- 코드북 CRUD API
- JWT 기반 인증 + Refresh token 쿠키, CSRF 보호 (React API 서버)

**Getting Started**
1. React API 서버
```bash
cd fds-statsdashboard-react
./gradlew bootRun
```
`./gradlew bootRun` (Windows에서는 `gradlew.bat bootRun`)
기본 포트는 `8080`이며 `application-ora.yml`의 Oracle 설정을 환경에 맞게 변경해야 합니다.
JWT 시크릿은 `jwt_secret.env`의 `FDS_SECURITY_JWT_SECRET` 값을 사용합니다.

2. React UI (Vite)
```bash
cd fds-statsdashboard-react/frontend
```
Vite 설정은 `vite.config.ts`에서 `/api`를 `http://localhost:8080`으로 프록시합니다.
현재 `package.json`이 최소 구성이라 의존성/스크립트를 정리한 뒤 실행해야 합니다.

3. Thymeleaf 대시보드
```bash
cd fds-statsdashboard-thymeleaf
./gradlew bootRun
```
이 모듈에는 `application.properties`가 없으므로 DB/보안 설정을 별도로 추가해야 합니다.

4. AI 챗봇
```bash
cd fds-aichatbot
pip install -r requirements.txt
python 12_01/lmstudio_gptoss20b_chat.py
```
기본 포트는 `5001`이며 환경 변수 `LLM_MODEL`, `LLM_API_URL`, `CORS_ALLOW_ORIGINS`로 LLM 설정을 변경할 수 있습니다.

**Configuration**
- `fds-statsdashboard-react/jwt_secret.env`: JWT 시크릿
- `fds-statsdashboard-react/src/main/resources/application-ora.yml`: Oracle DB 접속 정보
- `fds-statsdashboard-react/src/main/resources/application.properties`: 스냅샷 저장 경로(`fds.snapshots.base-path`)
- `fds-aichatbot/12_01/lmstudio_gptoss20b_chat.py`: LLM API URL 및 모델명

**API Quick Reference (React API)**
- Auth: `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/csrf`
- User stats: `GET /api/stats/user/summary`, `GET /api/stats/user/dashboard`
- Admin stats: `GET /api/stats/admin/dashboard`
- Snapshots: `GET /api/stats/snapshots`, `GET /api/stats/snapshots/{id}`, `POST /api/stats/admin/snapshots`, `GET /api/stats/admin/snapshots`, `GET /api/stats/admin/snapshots/{id}`
- Codebook: `GET/POST/PUT/DELETE /api/stats/codebook`

**Notes**
- `fds-aichatbot/main.py`는 CIFAR-100 학습 실험용 스크립트이며 챗봇과 별개입니다.
