from fastapi import APIRouter

router = APIRouter()

USE_DYNAMIC_GENRES = False  # True로 바꾸면 동적 방식으로 전환

#딕셔너리가 유지보수 좋음 왜? 딕셔너리만 장르 수정하면 돼서
#현재는 정적리스트, 하단에 동적으로 장르 추출하는 방법도 있음
GENRE_MODEL_MAP = {
    #딕셔너리에 적은 내용은 임의로 이런 장르가 있겠거니 하고 쓴 것 
    "hiphop": "models/hiphop_model",
    "ballet": "models/ballet_model",
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
