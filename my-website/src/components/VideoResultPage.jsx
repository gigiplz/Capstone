import { useState, useEffect } from 'react';

function VideoResultPage({ videoUrl, isGenerating, onReuse }) {
  const [downloadReady, setDownloadReady] = useState(false);

  // 생성 완료되면 다운로드 버튼 활성화
  useEffect(() => {
    console.log('🎬 [VideoResultPage] 영상 결과 페이지 로드됨');
    console.log('🎞️ [VideoResultPage] 영상 URL:', videoUrl);
    if (!isGenerating && videoUrl) {
      setDownloadReady(true);
    }
  }, [isGenerating, videoUrl]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f8f8'
    }}>
      
      {/* 비디오 미리보기 / 로딩 */}
      <div style={{
        width: '400px',
        height: '400px',
        backgroundColor: '#ffece8',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '20px'
      }}>

        {/* 다운로드 버튼 (오른쪽 상단) */}
        {downloadReady && (
          <a
            href={videoUrl}
            download
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '20px',
              color: '#ff7e65',
              textDecoration: 'none'
            }}
            title="Download Video"
          >
            ⬇️
          </a>
        )}

        {/* 영상 or 로딩 표시 */}
        {isGenerating ? (
          <div style={{ textAlign: 'center', fontSize: '16px', color: '#555' }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '10px'
            }}>
              🔄
            </div>
            Generating...
          </div>
        ) : (
          videoUrl ? (
            <video
              src={videoUrl}
              controls
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <span style={{ color: '#aaa' }}>
              No video available
            </span>
          )
        )}
      </div>

      {/* Reuse 버튼 */}
      <button
        onClick={onReuse}
        style={{
          backgroundColor: '#ff7e65',
          color: 'white',
          padding: '12px 30px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        🔄 Reuse
      </button>
    </div>
  );
}

export default VideoResultPage;
