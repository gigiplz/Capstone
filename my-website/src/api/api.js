// src/api/api.js
import axios from 'axios';


const BASE_URL = 'http://localhost:8000/api';

// ✅ 이미지 업로드 API
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file); // ✅ 반드시 key가 "file"이어야 함

  const res = await axios.post(`${BASE_URL}/upload/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}

// ✅ 장르 목록 불러오기
export async function getGenres() {
  const res = await axios.get(`${BASE_URL}/genres`);
  return res.data; // 예: ['힙합', '보깅', '재즈']
}

// ✅ 영상 생성 요청
export async function generateVideo(imageFilename, genre) {
  const res = await axios.post(`${BASE_URL}/generate`, {
    image_filename: imageFilename,
    genre: genre,
  });

  return res.data; // 예: { generated_filename: 'abc123_hiphop.mp4', ... }
}
