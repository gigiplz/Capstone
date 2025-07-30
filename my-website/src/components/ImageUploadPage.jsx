import { useRef } from 'react';
import { uploadImage } from '../api/api'; 

function ImageUploadPage({ uploadedImage, setUploadedImage, goToNextPage }) {
  const fileInputRef = useRef(null);

  async function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  try {
    const response = await uploadImage(file);  // 🎯 백엔드로 업로드
    console.log('✅✅✅ 업로드 성공:', response);

    // 🎯 응답받은 파일명을 uploadedImage에 포함시켜 저장
    setUploadedImage({
      url: imageUrl,
      file: file,
      filename: response.filename  // ✨ 이게 핵심!
    });

  } catch (error) {
    console.error('업로드 실패:', error);
  }
}

  function handleUploadButtonClick() {
    fileInputRef.current.click();
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      {/* 두 박스 묶음 */}
      <div style={{
        display: 'flex',
        gap: '80px'
      }}>
        
        {/* 예시 사진 & 가이드라인 (왼쪽에 위치) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '300px'
        }}>
          <h2 style={{ fontSize: '16px', textAlign: 'center', marginBottom: '10px' }}>
            Image Upload Guidelines
          </h2>

          <img
            src="/example.png"
            alt="예시 이미지"
            style={{
              width: '100%',
              height: '350px',
              objectFit: 'contain',
              borderRadius: '10px',
              marginBottom: '20px'
            }}
          />

          <ol style={{
            fontSize: '14px',
            textAlign: 'left',
            lineHeight: '1.5',
            paddingLeft: '20px'
          }}>
            <li>Must show the entire body (head to toe).</li>
            <li>Clear contrast between person and background.</li>
            <li>No drawings – only real photos.</li>
          </ol>
        </div>

        {/* 업로드 공간 (오른쪽) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '300px'
        }}>
          {/* 업로드된 이미지 미리보기 */}
          <div style={{
            width: '300px',
            height: '400px',
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
                alt="업로드된 이미지"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ color: '#aaa' }}>Upload an image</span>
            )}
          </div>

          {/* 이미지 업로드 */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          <button
            onClick={handleUploadButtonClick}
            style={{
              backgroundColor: '#ff7e65',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              marginBottom: '10px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            이미지 업로드
          </button>

          {/* 다음 버튼 (업로드 완료 이후 표시) */}
          <button
            onClick={goToNextPage}
            disabled={!uploadedImage}
            style={{
              backgroundColor: uploadedImage ? '#ff7e65' : '#ccc',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: uploadedImage ? 'pointer' : 'not-allowed'
            }}
          >
            다음
          </button>
        </div>

      </div>
    </div>
  );
}

export default ImageUploadPage;
