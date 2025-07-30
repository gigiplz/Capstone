import { useState, useEffect } from 'react';
import { getGenres } from '../api/api'; // 🔹 장르 호출용 axios 함수

function GenreSelectPage({ uploadedImage, onGenerate }) {
  const [genres, setGenres] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0);


  useEffect(() => {
    console.log('🎵 [GenreSelectPage] 장르 선택 페이지 로드됨');
    async function fetchGenres() {
      try {
        const response = await getGenres();
        console.log('📡 [GenreSelectPage] 장르 API 응답:', response);
        setGenres(response.genres); // 예: ['Jazz', 'HipHop']
      } catch (error) {
        console.error('장르 불러오기 실패:', error);
      }
    }
    fetchGenres();
  }, []);

  function handlePrev() {
    setSelectedIndex((prev) =>
      prev === 0 ? genres.length - 1 : prev - 1
    );
  }

  function handleNext() {
    setSelectedIndex((prev) =>
      prev === genres.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      justifyContent: 'space-between'
    }}>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        padding: '40px'
      }}>
        <div style={{
          width: '400px',
          height: '400px',
          backgroundColor: '#ffe5e5',
          borderRadius: '15px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          {uploadedImage ? (
            <img
              src={uploadedImage.url}
              alt="업로드한 이미지"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span>Image</span>
          )}
        </div>

        <button
          onClick={() => onGenerate(genres[selectedIndex])}  
          style={{
            backgroundColor: '#ff7e65',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '200px'
          }}
        >
          Generate
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#ff9f85',
        padding: '10px 20px'
      }}>
        <button onClick={handlePrev}>◀</button>
        {genres.map((g, i) => (
          <button
            key={g}
            onClick={() => setSelectedIndex(i)}
            style={{
              margin: '0 5px',
              padding: '8px 16px',
              backgroundColor: selectedIndex === i ? '#fff' : '#ff9f85',
              fontWeight: selectedIndex === i ? 'bold' : 'normal'
            }}
          >
            {g}
          </button>
        ))}
        <button onClick={handleNext}>▶</button>
      </div>
    </div>
  );
}

export default GenreSelectPage;
