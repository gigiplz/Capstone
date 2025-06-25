from fastapi import FastAPI
from app.api import image, genre, generate, video
from fastapi.staticfiles import StaticFiles

app = FastAPI()

#fastapi 잘 실행되는지 확인용으로 둠
@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}

#/api image.py에서 router 가져오기
app.include_router(image.router, prefix="/api")

# 정적 파일 경로 설정 (uploaded_images를 /images URL로 노출)
app.mount("/images", StaticFiles(directory="uploaded_images"), name="images")

#genre 선택 (위에 image랑 똑같은 거임) 목적: 장르 목록 조회 api
app.include_router(genre.router, prefix="/api")

#generate 목적: 영상 생성 요청 api, 영상 url 리턴
app.include_router(generate.router, prefix="/api")

#video
app.include_router(video.router, prefix="/api")
