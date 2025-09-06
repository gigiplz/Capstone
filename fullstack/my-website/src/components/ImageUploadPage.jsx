import { useRef, useState } from 'react';
import { uploadImage } from '../api/api'; 

function ImageUploadPage({ uploadedImage, setUploadedImage, goToNextPage }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // 가이드 이미지와 업로드 박스의 크기를 동일하게 관리
  const BOX_WIDTH = 300;
  const BOX_HEIGHT = 350;

  async function processFile(file) {
    if (!file) return;

    // 기존 미리보기 URL 정리(메모리 누수 방지)
    if (uploadedImage?.url) {
      try { URL.revokeObjectURL(uploadedImage.url); } catch (_) {}
    }

    const imageUrl = URL.createObjectURL(file);

    try {
      const response = await uploadImage(file); //  백엔드 업로드
      console.log('✅✅✅ 업로드 성공:', response);

      // 🎯 응답 파일명을 uploadedImage에 저장
      setUploadedImage({
        url: imageUrl,
        file: file,
        filename: response.filename, 
      });
    } catch (error) {
      console.error('업로드 실패:', error);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files[0];
    await processFile(file);
  }

  function handleUploadButtonClick() {
    fileInputRef.current?.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    await processFile(file);
  }

  function handleRemoveImage() {
    try {
      if (uploadedImage?.url) URL.revokeObjectURL(uploadedImage.url);
    } catch (_) {}
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* 2x2 그리드: 1행=제목, 2행=콘텐츠(이미지/업로드박스) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${BOX_WIDTH}px ${BOX_WIDTH}px`,
          gridTemplateRows: 'auto auto',
          columnGap: '80px',
          rowGap: '0px',
          alignItems: 'start'
        }}
      >
        {/* 좌측 제목 (1행 1열) */}
        <h2
          style={{ fontSize: '16px', textAlign: 'center', marginBottom: '10px', gridColumn: '1 / 2', gridRow: '1 / 2', fontWeight: 700 }}
        >
          이미지 업로드 가이드라인
        </h2>

        {/* 우측 1행은 비워서 행 높이만 공유 (제목 높이 만큼 자동 정렬) */}
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }} />

        {/* 좌측 콘텐츠 (2행 1열) */}
        <div
          style={{
            gridColumn: '1 / 2',
            gridRow: '2 / 3',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: `${BOX_WIDTH}px`
          }}
        >
          <img
            src="/example.png"
            alt="예시 이미지"
            style={{
              width: '100%',
              height: `${BOX_HEIGHT}px`,
              objectFit: 'contain',
              borderRadius: '10px',
              marginBottom: '20px'
            }}
          />

          <ol style={{
            fontSize: '14px',
            textAlign: 'left',
            lineHeight: 1.7,
            paddingLeft: 0,
            margin: 0,
            listStylePosition: 'inside',
            wordBreak: 'keep-all', // 한국어 단어 중간 줄바꿈 방지
            whiteSpace: 'normal',
            fontWeight: 500,
          }}>
            <li>전신이 보이는 사진이어야 합니다(머리부터 발끝까지).</li>
            <li>인물과 배경의 대비가 뚜렷해야 합니다.</li>
            <li>그림/일러스트가 아닌 실제 사진만 허용됩니다.</li>
          </ol>
        </div>

        {/* 우측 콘텐츠 (2행 2열) */}
        <div
          style={{
            gridColumn: '2 / 3',
            gridRow: '2 / 3',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: `${BOX_WIDTH}px`
          }}
        >
          {/* 업로드 박스 (드래그 앤 드롭 + 클릭 업로드) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadButtonClick}
            role="button"
            aria-label="이미지 업로드 영역"
            style={{
              position: 'relative',
              width: `${BOX_WIDTH}px`,
              height: `${BOX_HEIGHT}px`,
              backgroundColor: '#ffe5e5',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px',
              border: `2px ${isDragging ? 'solid' : 'dashed'} ${isDragging ? '#ff7e65' : '#ffbfb3'}`,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, transform 0.15s ease',
              transform: isDragging ? 'scale(1.01)' : 'scale(1)'
            }}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage.url}
                alt="업로드된 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                {/* 업로드 픽토그램 (SVG) */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 16V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M8 8L12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="16" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                <span style={{ color: '#888', fontSize: '14px' }}>여기로 이미지를 끌어다 놓거나</span>
                <span style={{ color: '#555', fontSize: '14px', fontWeight: 700 }}>클릭하여 업로드</span>
              </div>
            )}
          </div>

          {/* 이미지 업로드 input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleUploadButtonClick}
              style={{
                backgroundColor: '#ff7e65',
                color: 'white',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              이미지 선택하기
            </button>

            {uploadedImage && (
              <button
                onClick={handleRemoveImage}
                style={{
                  backgroundColor: '#555',
                  color: 'white',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                이미지 삭제
              </button>
            )}
          </div>

          {/* 다음 버튼 (업로드 완료 이후 활성화) */}
          <button
            onClick={goToNextPage}
            disabled={!uploadedImage}
            style={{
              marginTop: '10px',
              backgroundColor: uploadedImage ? '#ff7e65' : '#ccc',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: uploadedImage ? 'pointer' : 'not-allowed',
              fontWeight: 700,
            }}
          >
            장르 선택하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageUploadPage;
