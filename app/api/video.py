from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse #영상 다운
import os

router = APIRouter()

#영상 목록 불러오기
@router.get("/videos")
def list_videos():
    video_dir = "outputs"
    videos = []
    for filename in os.listdir(video_dir):
        if filename.endswith(".mp4"):
            videos.append({
                "filename": filename,
                "url": f"/videos/{filename}",
            })
    return videos

#개별 영상 메타데이터 확인
@router.get("/videos/{filename}")
def get_video_detail(filename: str):
    video_path = os.path.join("outputs", filename)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {
        "filename": filename,
        "url": f"/videos/{filename}",
        "download_url": f"/videos/{filename}/download"
    }

#영상 다운로드 링크 제공
@router.get("/videos/{filename}/download")
def download_video(filename: str):
    file_path = os.path.join("outputs", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(path=file_path, filename=filename, media_type='video/mp4')

#영상 재생성 기능은 프론트에서 '재생성' 버튼 누르면
#이전에 사용한 image_filename과 genre를 그대로 POST /generate에 다시 보내기만 하면 됨
