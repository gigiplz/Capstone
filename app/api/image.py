from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os

from app.utils.file import is_allowd_file, generate_unique_filename

router = APIRouter()
UPLOAD_DIR = "uploaded_images"

#이미지 업로드 API 구현
@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    print("📥 Upload API called") #이거 다 확인용으로 넣은 거임 나중에 지워도 됨
    if not is_allowd_file(file.filename):
        raise HTTPException(status_code=400, detail = "Only .jpg, .jpeg, .png files allowed")
    
    unique_filename = generate_unique_filename(file.filename)
    print(f"📦 Saving as: {unique_filename}")
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("✅ File saved successfully!")

    return JSONResponse(status_code = 200, content = {
        "filename": unique_filename,
        "url": f"/images/{unique_filename}"
    })

#정상 작동 확인 완료
#uploaded_images에 이미지 업로드된 거 확인 (확인 방법: fastAPI에서 제공하는 swagger UI 사용, 터미널에서 제공해주는 url 접속)

#이미지 리스트 api 구현
#구현 이유: 업로드한 이미지 중 하나 택1 역할, '이미지 선택' 에 필요
#전제조건: uploaded_images 에 '이미지 업로드 api'로 업로드된 이미지들 있어야 함
@router.get("/images")
def list_uploaded_images():
    try:
        files = os.listdir(UPLOAD_DIR)
        image_files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))]

        #이미지 url 형태로 반환 (정적 파일 경로 기준)
        images = [{"filesname": fname, "url": f"/images/{fname}"} for fname in image_files]
        return JSONResponse(content=images)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})