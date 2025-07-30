### 📁 `README.md`

```markdown
# My Dance Generator

사용자 업로드 사진과 장르 선택을 기반으로 AI 댄스 영상을 생성하는 웹 서비스입니다.


## ✅ 전체 프로젝트 구성

* **백엔드 (FastAPI)**: `backend-files/app/` 안에서 운영
* **프론트엔드 (React + Vite)**: `my-website/` 디렉토리 안에서 운영
* 전체 프로젝트 루트는 `my-dance-backend/`

---

## ✅ 백엔드 작업 요약 (250730)

1. **FastAPI 앱 실행**

   ```bash
   cd backend-files
   uvicorn app.main:app --reload --port 8000 --reload-dir app
   ```

2. **라우터 등록 (`app/main.py`)**

   ```python
   app.include_router(image.router, prefix="/api")
   app.include_router(genre.router, prefix="/api")
   app.include_router(generate.router, prefix="/api")
   app.include_router(video.router, prefix="/api")
   ```

3. **이미지 업로드 API (`image.py`)**

   * `UploadFile = File(...)`로 받음
   * `uploaded_images/`에 저장
   * 업로드 성공 시 `{"filename": "...jpg"}` 반환

4. **장르 API (`genre.py`)**

   * 정적 또는 동적 방식으로 장르 반환
   * 예: `["hiphop", "ballet", "voguing"]`

5. **영상 생성 API (`generate.py`)**

   * 실제 AI 모델이 아직 없음 → 임시로 더미 응답 or 미리 녹화된 영상 반환
   * `POST /api/generate` → 422 오류 해결: `image_filename` 필드 체크

---

## ✅ 프론트엔드 작업 요약

1. **이미지 업로드 페이지 (`ImageUploadPage.jsx`)**

   * `URL.createObjectURL()`로 미리보기
   * `uploadImage()` 호출 → 백엔드에 전송
   * 콘솔에 `업로드 성공:` 로그 확인

2. **장르 선택 페이지 (`GenreSelectPage.jsx`)**

   * `getGenres()`로 장르 목록 받아와 버튼 렌더링
   * 선택 후 `Generate` 버튼 클릭 시 영상 생성 요청

3. **영상 결과 페이지 (`VideoResultPage.jsx`)**

   * AI 팀 미완 상태 고려 → 임시 영상으로 결과 확인
   * 영상 재생, 다운로드, reuse 기능 구현됨

4. **중간 오류들 해결**

   * 404 오류: 백엔드 라우터 prefix 문제 해결 (`/api/...`)
   * 422 오류: `image_filename` 빠져서 생긴 문제 수정
   * 콘솔로그 안 뜨던 이슈: `console.log(response)` 위치 수정 등으로 해결

---

## ✅ 디버깅 및 테스트 방법

* 개발자 도구 콘솔(F12) 열고 다음 로그 확인:

  * ✅ 이미지 업로드 성공
  * ✅ 장르 목록 불러오기 성공
  * ✅ 영상 생성 요청 성공

* 확인용 로그:

  ```js
  console.log('업로드 성공:', response);
  console.log('장르 목록:', genres);
  console.log('영상 생성 응답:', data);
  ```


---

## 🧩 프로젝트 구조

```

my-dance-backend/
│
├── backend-files/          # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py         # FastAPI 엔트리포인트
│   │   ├── api/            # 라우터들
│   │   │   ├── image.py    # 이미지 업로드 API
│   │   │   ├── genre.py    # 장르 조회 API
│   │   │   ├── generate.py # 영상 생성 요청 API
│   │   │   └── video.py    # 영상 조회 API
│   │   ├── utils/          # 유틸리티 함수
│   │   └── ...
│   └── uploaded\_images/    # 업로드된 이미지 저장 폴더
│
├── my-website/             # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUploadPage.jsx
│   │   │   ├── GenreSelectPage.jsx
│   │   │   └── VideoResultPage.jsx
│   │   ├── api/api.js      # axios API 호출 모듈
│   │   └── App.jsx         # 전체 페이지 흐름 제어
│   └── public/
│       └── example.png     # 예시 이미지
│
└── README.md

````

---

## 🚀 실행 방법

### 백엔드 (FastAPI)
```bash
cd backend-files
uvicorn app.main:app --reload --port 8000 --reload-dir app
````

* Swagger UI 확인: [http://localhost:8000/docs](http://localhost:8000/docs)

### 프론트엔드 (React + Vite)

```bash
cd my-website
npm install
npm run dev
```

* 접속: [http://localhost:5173](http://localhost:5173)

---

## 🛠 사용 기술

### 백엔드

* Python 3.10+
* FastAPI
* Uvicorn
* shutil / os 모듈
* CORS 설정 포함

### 프론트엔드

* React 18
* Vite
* Axios
* Tailwind 미사용 (Custom CSS)
* HTML5 Video Tag

---

## 🎯 기능 요약

* ✅ 이미지 업로드 (.jpg/.jpeg/.png)
* ✅ 장르 선택 (정적/동적 방식 가능)
* ✅ 영상 생성 요청 (AI 모델과 연동 시 실제 작동 예정)
* ✅ 생성된 영상 미리보기 + 다운로드
* ✅ 재사용 (reuse) 기능

---

## 📌 참고 사항

* AI 영상 생성 기능은 아직 완성되지 않았으며, 추후 팀 연동 예정입니다.
* API URL Prefix는 `/api/`로 고정되어 있습니다.
* `.gitignore`에 `uploaded_images/`, `.env`, `node_modules/` 등이 포함되어 있어야 합니다.

