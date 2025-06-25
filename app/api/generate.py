from fastapi import APIRouter
from app.schemas.generate import GenerateRequestSchema
import os
import shutil

router = APIRouter()

@router.post("/generate")
def generate_video(request: GenerateRequestSchema):
    # 1. 요청 정보 확인
    image_filename = request.image_filename
    genre = request.genre

    # 2. 출력 파일명 정의
    output_filename = f"{os.path.splitext(image_filename)[0]}_{genre}.mp4"
    output_path = os.path.join("outputs", output_filename)

    # 3. 더미 파일 복사 (AI 모델 결과가 없는 상태니까 더미 파일을 이용해서 마치 생성된 것처럼 관리)
    # 기존 dummy 영상 경로를 새로운 파일로 변경
    dummy_video = "free_hiphop_video.mp4"
    if not os.path.exists("outputs"):
        os.makedirs("outputs")
    shutil.copy(dummy_video, output_path)

    # 4. 응답 반환
    return {
        "message": "영상 생성 요청이 접수되었습니다.",
        "generated_filename": output_filename,
        "genre": genre
    }
