#현 스키마의 역할: image_filename과 genre 두 값을
#클라이언트가 POST 요청에서 보내줄 때 검증 도와줌
from pydantic import BaseModel

class GenerateRequestSchema(BaseModel):
    image_filename: str
    genre: str