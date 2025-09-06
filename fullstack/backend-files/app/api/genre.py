from fastapi import APIRouter

router = APIRouter()

USE_DYNAMIC_GENRES = False  # True로 바꾸면 동적 방식으로 전환

GENRE_MODEL_MAP = {
    
    "hiphop": "models/hiphop_model",
    "kpop": "models/ballet_model",
    "voguing": "models/voguing_model"
}

@router.get("/genres")
def list_genres():
    if USE_DYNAMIC_GENRES:
        genres = get_genres_from_models()
        return {"genres": genres}
    else:
        return {"genres": list(GENRE_MODEL_MAP.keys())}


# 동적 장르 추출 예시
# 구글 드라이브나 폴더에 있는 model_hiphop.py 와 같은 파일명 읽어서 장르 추출
import os

def get_genres_from_models():
    try:
        model_files = os.listdir("models/")
        genres = [
            f.split("_")[1].replace(".py", "")
            for f in model_files
            if f.startswith("model_") and f.endswith(".py")
        ]
        return genres
    except FileNotFoundError:
        return []
