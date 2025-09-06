
#outputs 와 uploaded_images 파일 자동 생성코드
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
(BASE_DIR / "uploaded_images").mkdir(parents=True, exist_ok=True)
(BASE_DIR / "outputs").mkdir(parents=True, exist_ok=True)




from fastapi import FastAPI
from app.api import image, genre, generate, video
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 설정 (프론트 React 서버에서 호출 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



#fastapi 잘 실행되는지 확인용으로 둠
@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}



# 정적 파일 경로 설정 (uploaded_images를 /images URL로 노출)
app.mount("/images", StaticFiles(directory="uploaded_images"), name="images")
app.mount("/videos", StaticFiles(directory="outputs"), name="videos")



#/api image.py에서 router 가져오기
app.include_router(image.router, prefix="/api")

#genre 선택 (위에 image랑 똑같은 거임) 목적: 장르 목록 조회 api
app.include_router(genre.router, prefix="/api")

#generate 목적: 영상 생성 요청 api, 영상 url 리턴
app.include_router(generate.router, prefix="/api")

#video
app.include_router(video.router, prefix="/api")
