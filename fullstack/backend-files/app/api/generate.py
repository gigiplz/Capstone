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

    # 3. 장르별 더미 영상 매핑
    genre_to_dummy = {
        "hiphop": "free_hiphop_video.mp4",
        "jazz": "free_jazz_video.mp4",
        "waacking": "free_waacking_video.mp4"
    }

    # 4. 장르에 맞는 더미 영상 선택 (없을 경우 기본값 hiphop)
    dummy_video = genre_to_dummy.get(genre.lower(), "free_hiphop_video.mp4")

    # 5. outputs 폴더 생성 및 더미 파일 복사
    if not os.path.exists("outputs"):
        os.makedirs("outputs")

    if os.path.exists(dummy_video):
        shutil.copy(dummy_video, output_path)
    else:
        # 더미 영상 파일이 없을 경우 예외 처리
        return {
            "message": f"더미 영상 파일({dummy_video})을 찾을 수 없습니다.",
            "status": "error"
        }

    # 6. 응답 반환
    return {
        "message": f"{genre} 장르 영상 생성이 완료되었습니다.",
        "generated_filename": output_filename,
        "genre": genre
    }
