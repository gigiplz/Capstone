import os
import uuid

#다른 이미지 형식은 못 받음. 일단 이 3개가 대표적이니 이렇게 함
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

def is_allowd_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def generate_unique_filename(original_name: str) -> str:
    ext = get_file_extension(original_name)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}{ext}"