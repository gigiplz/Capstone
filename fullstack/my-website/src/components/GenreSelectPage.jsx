// src/components/GenreSelectPage.jsx
import { useState, useEffect } from 'react';
import { getGenres } from '../api/api';

function GenreSelectPage({ uploadedImage, onGenerate }) {
  const [genres, setGenres] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0); // ✅ 예시 선택 상태

  function normalize(name = '') {
    return name.toLowerCase().replace(/\s|-/g, '');
  }

  const GENRE_DESC = {
    hiphop: '강한 비트와 리듬감 있는 동작이 특징인 스트리트 기반의 춤 스타일입니다.',
    jazz: '유연한 몸동작과 리듬감 있는 움직임이 특징인 대중적 무용 스타일입니다.',
    waacking : '디스코 리듬에 맞춰 팔을 빠르고 리드미컬하게 움직이는 표현력 강한 춤입니다.'
  };

  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await getGenres();
        setGenres(response.genres || []);
        setSelectedIndex(0);
        setExampleIndex(0); // 장르 바뀔 때 예시도 초기화
      } catch (error) {
        console.error('장르 불러오기 실패:', error);
      }
    }
    fetchGenres();
  }, []);

  // ✅ 예시 영상 화살표 이동
  function handlePrevExample() {
    setExampleIndex((prev) => (prev === 0 ? 2 : prev - 1));
  }

  function handleNextExample() {
    setExampleIndex((prev) => (prev === 2 ? 0 : prev + 1));
  }

  const selectedGenre = genres[selectedIndex] || '';
  const normalized = normalize(selectedGenre);
  const selectedDesc =
    GENRE_DESC[normalized] || '이 장르에 대한 설명이 준비 중입니다.';

  // ✅ 선택된 장르 + 예시 번호 조합
  const videoSrc = normalized
    ? `/example_${normalized}_${exampleIndex + 1}.mp4`
    : '';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      padding: '60px 20px',
      overflowY: 'auto',
      gap: '40px'
    }}>
      {/* 1. 장르 선택 버튼 */}
      <div style={{
        display: 'flex',
        gap: '35px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '720px'
      }}>
        {genres.map((g, i) => (
          <button
            key={g}
            onClick={() => {
              setSelectedIndex(i);
              setExampleIndex(0);
            }}
            style={{
              padding: '14px 22px',  // ✅ 예시 버튼보다 크게
              borderRadius: '12px',  // ✅ 둥근 정도 줄임
              border: '1px solid #ff9f85',
              backgroundColor: selectedIndex === i ? '#ff7e65' : '#fff',
              color: selectedIndex === i ? '#fff' : '#333',
              fontWeight: selectedIndex === i ? '700' : '500',
              fontSize: '18px',      // ✅ 더 크게
              cursor: 'pointer',
              boxShadow: selectedIndex === i ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              minWidth: '120px'      // 버튼 최소 폭 확보
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* 2. 장르 설명 */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        backgroundColor: '#fff5f2',
        border: '1px solid #ffddcf',
        borderRadius: '12px',
        padding: '18px 20px',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 700, marginBottom: '6px' }}>
          {selectedGenre || '장르 선택'}
        </div>
        <div style={{ color: '#444' }}>
          {genres.length ? selectedDesc : '장르를 불러오는 중입니다...'}
        </div>
      </div>

      {/* 3. 예시 선택 (버튼 + 화살표) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* 왼쪽 화살표 */}
        <button onClick={handlePrevExample}
          style={{
            background: 'transparent',
            border: '1px solid #ff9f85',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >◀</button>

        {/* 예시 버튼 그룹 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setExampleIndex(i)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',   // ✅ 예시 버튼도 약간 둥글게만
                border: '1px solid #ff9f85',
                backgroundColor: exampleIndex === i ? '#ff7e65' : '#fff',
                color: exampleIndex === i ? '#fff' : '#333',
                fontWeight: exampleIndex === i ? '700' : '500',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              예시 {i + 1}
            </button>
          ))}
        </div>

        {/* 오른쪽 화살표 */}
        <button onClick={handleNextExample}
          style={{
            background: 'transparent',
            border: '1px solid #ff9f85',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >▶</button>
      </div>

      {/* 4. 장르 예시 영상 */}
      <div style={{
        width: '360px',
        height: `${(360 * 16) / 9}px`,  // ✅ 3:5 비율 유지 → 600px
        border: '1px solid #ffb5a2',
        borderRadius: '15px',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#999' }}>예시 영상 없음</span>
        )}
      </div>

      {/* 5. 생성 버튼 */}
      <button
        onClick={() => onGenerate(genres[selectedIndex])}
        disabled={!genres.length}
        style={{
          backgroundColor: genres.length ? '#ff7e65' : '#ccc',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '20px',
          fontWeight: '700',
          cursor: genres.length ? 'pointer' : 'not-allowed',
          width: '280px'
        }}
      >
        생성하기
      </button>
    </div>
  );
}

export default GenreSelectPage;
