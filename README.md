## 🕺 MY-DANCE-BACKEND

AI 기반 댄스 영상 생성 플랫폼의 백엔드입니다.
사용자가 이미지를 업로드하고, 원하는 장르를 선택하면 해당 이미지와 장르에 맞는 댄스 영상을 생성합니다.

---

### 📁 프로젝트 구조

```
MY-DANCE-BACKEND/
│
├── app/                        # 주요 백엔드 앱 코드
│   ├── api/                   # API 라우팅
│   │   ├── generate.py        # 영상 생성 관련 API
│   │   ├── genre.py           # 장르 목록 제공 API
│   │   ├── image.py           # 이미지 업로드 / 조회 API
│   │   └── video.py           # 생성된 영상 조회 및 다운로드 API
│   ├── core/                  # 설정 및 실행 관련 코드
│   ├── models/                # (미사용) 데이터베이스 모델
│   ├── schemas/              # API 요청/응답 스키마 정의
│   └── utils/                # 파일 유틸 등 기능 모음
│
├── outputs/                   # 생성된 영상이 저장되는 폴더
├── uploaded_images/          # 업로드된 이미지가 저장되는 폴더
├── requirements.txt          # 의존성 패키지 목록
├── .env                      # 환경변수 파일 (Git에 포함 안 됨)
└── .gitignore                # Git 추적 제외 설정 파일
```

---

### 🚀 실행 방법

#### 1. 가상환경 설정 (권장)

```bash
python -m venv venv
source venv/Scripts/activate  # Mac/Linux: source venv/bin/activate
```

#### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

#### 3. 서버 실행

```bash
uvicorn app.main:app --reload
```

#### 4. Swagger UI 확인 (API 테스트 페이지)

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 💡 주요 기능

| 단계 | 기능 설명         | API                                   |
| -- | ------------- | ------------------------------------- |
| 1  | 이미지 업로드       | `POST /api/upload/image`              |
| 2  | 이미지 목록 보기     | `GET /api/images`                     |
| 3  | 장르 목록 보기      | `GET /api/genres`                     |
| 4  | 영상 생성 요청      | `POST /api/generate`                  |
| 5  | 생성된 영상 리스트 보기 | `GET /api/videos`                     |
| 6  | 영상 다운로드       | `GET /api/videos/{filename}/download` |

---

### 🤖 AI 모델 연동 구조 (예정)

* AI 모델은 Google Colab에서 개발 중입니다.
* 영상 생성 시 선택된 장르에 따라 Colab 상의 모델을 수동 또는 자동으로 호출할 수 있도록 설계 예정입니다.
* 현재는 영상 생성이 더미(dummy)로 처리되고 있습니다.

---

### 📌 참고 사항

* `.env`, `outputs`, `uploaded_images`, `.mp4` 파일은 `.gitignore`에 포함되어 있으므로 Git에 업로드되지 않습니다.
* `.gitignore`를 통해 민감정보 및 불필요한 파일 관리가 이루어지고 있습니다.

