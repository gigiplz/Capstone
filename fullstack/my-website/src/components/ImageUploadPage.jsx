import { useRef, useState, useEffect } from 'react';
import { uploadImage } from '../api/api'; 

function ImageUploadPage({ uploadedImage, setUploadedImage, goToNextPage }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // 📏 박스 크기/간격을 반응형으로 — 화면이 넓을수록 더 크게
  const BOX_W = 'clamp(340px, 32vw, 460px)';      // ← 기존 300px → 최대 460px까지
  const BOX_H = 'clamp(420px, 52vh, 560px)';      // ← 기존 350px → 최대 560px까지
  const COLUMN_GAP = 'clamp(48px, 6vw, 120px)';   // ← 좌우 간격도 함께 확대

  async function processFile(file) {
    if (!file) return;
    if (uploadedImage?.url) { try { URL.revokeObjectURL(uploadedImage.url); } catch(_){} }
    const imageUrl = URL.createObjectURL(file);
    try {
      const response = await uploadImage(file);
      setUploadedImage({ url: imageUrl, file, filename: response.filename });
    } catch (error) { console.error('업로드 실패:', error); }
  }

  async function handleImageChange(e){ await processFile(e.target.files[0]); }
  function handleUploadButtonClick(){ fileInputRef.current?.click(); }
  function handleDragOver(e){ e.preventDefault(); e.stopPropagation(); setIsDragging(true); }
  function handleDragLeave(e){ e.preventDefault(); e.stopPropagation(); setIsDragging(false); }
  async function handleDrop(e){ e.preventDefault(); e.stopPropagation(); setIsDragging(false); await processFile(e.dataTransfer?.files?.[0]); }
  function handleRemoveImage(){
    try { if (uploadedImage?.url) URL.revokeObjectURL(uploadedImage.url); } catch(_){}
    setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value='';
  }

  useEffect(()=>()=>{ try { if (uploadedImage?.url) URL.revokeObjectURL(uploadedImage.url); } catch(_){}} ,[uploadedImage]);

  return (
    <div style={{
      position:'fixed', inset:0, display:'flex', justifyContent:'center', alignItems:'center', width:'100%',
      paddingBottom:'clamp(24px, 6vh, 72px)'  // 이전에 맞춰둔 하단 여백 유지
    }}>
      {/* 2x2 그리드 */}
      <div
        style={{
          display:'grid',
          gridTemplateColumns: `${BOX_W} ${BOX_W}`,
          gridTemplateRows:'auto auto',
          columnGap: COLUMN_GAP,
          rowGap:'0px',
          alignItems:'start'
        }}
      >
        {/* 좌측 제목 */}
        <h2 style={{ fontSize:'16px', textAlign:'center', marginBottom:'10px', gridColumn:'1 / 2', gridRow:'1 / 2', fontWeight:700 }}>
          📽️이미지 업로드 가이드라인
        </h2>

        <div style={{ gridColumn:'2 / 3', gridRow:'1 / 2' }} />

        {/* 좌측 콘텐츠 */}
        <div style={{
          gridColumn:'1 / 2', gridRow:'2 / 3',
          display:'flex', flexDirection:'column', alignItems:'stretch',   // ← stretch로 글 영역 최대화
          width: BOX_W
        }}>
          <img src="/example.png" alt="예시 이미지" style={{
            width:'100%', height: BOX_H, objectFit:'contain', borderRadius:'10px', marginBottom:'20px'
          }}/>

          {/* 목록: outside로 줄바꿈 깔끔 + 좌측 여백 확대 */}
          <ol style={{
            fontSize:'15px', lineHeight:1.75, margin:0, paddingLeft:'24px',
            listStyle:'decimal', listStylePosition:'outside',
            wordBreak:'keep-all', overflowWrap:'anywhere'
          }}>
            <li style={{marginBottom:4}}>머리부터 발 끝까지 전신이 보이는 사진이어야 합니다.</li>
            <li style={{marginBottom:4}}>인물과 배경의 대비가 뚜렷해야 합니다.</li>
            <li style={{marginBottom:4}}>너무 작거나 큰 크기의 사진은 생성이 어려울 수 있습니다.</li>
            <li>인간형태가 뚜렷한 일러스트나 그림도 생성이 가능합니다.</li>
          </ol>
        </div>

        {/* 우측 콘텐츠 */}
        <div style={{
          gridColumn:'2 / 3', gridRow:'2 / 3',
          display:'flex', flexDirection:'column', alignItems:'center',
          width: BOX_W
        }}>
          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={uploadedImage ? undefined : handleUploadButtonClick}
            role="button" aria-label="이미지 업로드 영역"
            style={{
              position:'relative', width: BOX_W, height: BOX_H,
              backgroundColor: uploadedImage ? 'transparent' : '#ffe5e5',
              borderRadius:'10px', overflow:'hidden',
              display:'flex', justifyContent:'center', alignItems:'center',
              marginBottom:'20px',
              border: uploadedImage ? 'none' : `2px ${isDragging ? 'solid' : 'dashed'} ${isDragging ? '#ff7e65' : '#ffbfb3'}`,
              cursor: uploadedImage ? 'default' : 'pointer',
              transition:'border-color .15s ease, transform .15s ease',
              transform: isDragging ? 'scale(1.01)' : 'scale(1)'
            }}
          >
            {uploadedImage ? (
              <img src={uploadedImage.url} alt="업로드된 이미지" style={{
                width:'100%', height:'100%', objectFit:'contain', objectPosition:'center', display:'block', background:'#fff'
              }}/>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', userSelect:'none' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 16V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M8 8L12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="16" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                <span style={{ color:'#888', fontSize:'15px' }}>여기로 이미지를 끌어다 놓거나</span>
                <span style={{ color:'#555', fontSize:'15px', fontWeight:700 }}>클릭하여 업로드</span>
              </div>
            )}
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display:'none' }}/>

          <div style={{ display:'flex', gap:'12px' }}>
            <button onClick={handleUploadButtonClick} style={{
              backgroundColor:'#ff7e65', color:'#fff', padding:'12px 18px', border:'none', borderRadius:'10px',
              fontSize:'15px', cursor:'pointer', fontWeight:700
            }}>📸이미지 선택하기</button>

            {uploadedImage && (
              <button onClick={handleRemoveImage} style={{
                backgroundColor:'#555', color:'#fff', padding:'12px 18px', border:'none', borderRadius:'10px',
                fontSize:'15px', cursor:'pointer', fontWeight:700
              }}>🗑️이미지 삭제</button>
            )}
          </div>

          <button onClick={goToNextPage} disabled={!uploadedImage} style={{
            marginTop:'12px',
            backgroundColor: uploadedImage ? '#ff7e65' : '#ccc',
            color:'#fff', padding:'12px 26px', border:'none', borderRadius:'10px',
            fontSize:'15px', cursor: uploadedImage ? 'pointer' : 'not-allowed', fontWeight:700
          }}>🕺장르 선택하러 가기</button>
        </div>
      </div>
    </div>
  );
}

export default ImageUploadPage;
