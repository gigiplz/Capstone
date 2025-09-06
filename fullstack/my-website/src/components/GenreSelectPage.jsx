import { useState, useEffect } from 'react';
import { getGenres } from '../api/api'; // 🔹 장르 호출용 axios 함수

function GenreSelectPage({ uploadedImage, onGenerate }) {
  const [genres, setGenres] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 업로드 이미지 비율에 맞춰 동적으로 박스 크기를 조절 (최대 400×400)
  const [imgBox, setImgBox] = useState({ w: 400, h: 400 });

  // 장르 설명 매핑(없으면 기본 문구)
  function normalize(name = '') {
    return name.toLowerCase().replace(/\s|-/g, '');
  }
  const GENRE_DESC = {
    hiphop: '강한 비트와 리듬감 있는 동작이 특징인 스트리트 기반의 춤 스타일입니다.',
    jazz: '리듬감과 라인의 표현이 중요한 장르로, 스윙과 즉흥성이 돋보입니다.',
    kpop: '팝 기반 안무로, 포인트 동작과 팀 동작을 중심으로 구성됩니다.',
    ballet: '정확한 자세와 라인을 바탕으로 한 클래식 무용입니다.',
    contemporary: '발레와 현대적 움직임이 결합된 감정 표현 중심의 장르입니다.',
    popping: '근수축을 이용한 펑! 하는 움직임이 특징인 스트리트 스타일입니다.',
    voguing: ' 스트릿댄스와는 다른 배경인 LGBTQ+ 볼룸(Ballroom)씬을 배경으로 둔 춤의 장르입니다.'
  };

  useEffect(() => {
    console.log('🎵 [GenreSelectPage] 장르 선택 페이지 로드됨');
    async function fetchGenres() {
      try {
        const response = await getGenres();
        console.log('📡 [GenreSelectPage] 장르 API 응답:', response);
        setGenres(response.genres || []); // 예: ['Jazz', 'HipHop']
        setSelectedIndex(0);
      } catch (error) {
        console.error('장르 불러오기 실패:', error);
      }
    }
    fetchGenres();
  }, []);

  // ✅ 업로드한 이미지의 원본 크기로 비율 계산 → 박스 크기 조절 (여백 제거)
  useEffect(() => {
    const MAX_W = 400;
    const MAX_H = 400;

    if (!uploadedImage?.url) {
      setImgBox({ w: MAX_W, h: MAX_H });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w0, naturalHeight: h0 } = img;
      if (!w0 || !h0) {
        setImgBox({ w: MAX_W, h: MAX_H });
        return;
      }
      const scale = Math.min(MAX_W / w0, MAX_H / h0, 1); // 박스를 넘지 않게 축소
      const w = Math.round(w0 * scale);
      const h = Math.round(h0 * scale);
      setImgBox({ w, h });
    };
    img.src = uploadedImage.url;
  }, [uploadedImage]);

  function handlePrev() {
    setSelectedIndex((prev) =>
      genres.length ? (prev === 0 ? genres.length - 1 : prev - 1) : 0
    );
  }

  function handleNext() {
    setSelectedIndex((prev) =>
      genres.length ? (prev === genres.length - 1 ? 0 : prev + 1) : 0
    );
  }

  const selectedGenre = genres[selectedIndex] || '';
  const selectedDesc =
    GENRE_DESC[normalize(selectedGenre)] || '이 장르에 대한 설명이 준비 중입니다.';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'center',   // ⬅️ 화면 세로 중앙 정렬
      alignItems: 'center'        // ⬅️ 가로 중앙 정렬
    }}>
      {/* 상단: 업로드 이미지 (중앙 배치) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: `${imgBox.w}px`,
          height: `${imgBox.h}px`,
          backgroundColor: '#ffe5e5',
          borderRadius: '15px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {uploadedImage ? (
            <img
              src={uploadedImage.url}
              alt="업로드한 이미지"
              // 컨테이너가 이미지 비율과 동일하므로 contain/cover 상관없이 여백 없음
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <span style={{ color: '#999' }}>이미지 없음</span>
          )}
        </div>
      </div>

      {/* 가운데: 장르 선택 + 설명 + 생성 버튼 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 16px',
        marginTop: '4px'
      }}>
        {/* 장르 선택(가운데 정렬) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '720px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePrev}
            aria-label="이전 장르"
            style={{
              background: 'transparent',
              border: '1px solid #ff9f85',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            ◀
          </button>

          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            flex: 1
          }}>
            {genres.map((g, i) => (
              <button
                key={g}
                onClick={() => setSelectedIndex(i)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '999px',
                  border: '1px solid #ff9f85',
                  backgroundColor: selectedIndex === i ? '#ff7e65' : '#fff',
                  color: selectedIndex === i ? '#fff' : '#333',
                  fontWeight: selectedIndex === i ? '700' : '500',
                  cursor: 'pointer',
                  boxShadow: selectedIndex === i ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {g}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="다음 장르"
            style={{
              background: 'transparent',
              border: '1px solid #ff9f85',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            ▶
          </button>
        </div>

        {/* 장르 설명 박스 */}
        <div style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#fff5f2',
          border: '1px solid #ffddcf',
          borderRadius: '12px',
          padding: '14px 16px',
          lineHeight: 1.6
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>
            {selectedGenre || '장르 선택'}
          </div>
          <div style={{ color: '#444' }}>
            {genres.length ? selectedDesc : '장르를 불러오는 중입니다...'}
          </div>
        </div>

        {/* 생성 버튼 (설명 아래) */}
        <button
          onClick={() => onGenerate(genres[selectedIndex])}
          disabled={!genres.length}
          style={{
            backgroundColor: genres.length ? '#ff7e65' : '#ccc',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: genres.length ? 'pointer' : 'not-allowed',
            width: '220px',
            marginTop: '6px'
          }}
        >
          생성하기
        </button>
      </div>
    </div>
  );
}

export default GenreSelectPage;
