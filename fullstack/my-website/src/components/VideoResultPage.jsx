import { useState, useEffect } from 'react';

function VideoResultPage({
  videoUrl,
  isGenerating,
  onReuse,
  statusMessage,   // string
  onCancel,        // function
  onRetry,         // function
  error            // string
}) {
  const [downloadReady, setDownloadReady] = useState(false);

  useEffect(() => {
    if (!isGenerating && videoUrl) setDownloadReady(true);
  }, [isGenerating, videoUrl]);

  const showError = !!error && !isGenerating;
  const showVideo = !isGenerating && !showError && !!videoUrl;

  const CARD_W = 360;
  const CARD_H = Math.round((CARD_W / 9) * 16); // → 640
  const contentWidth = showVideo ? CARD_W * 2 + 24 : CARD_W;

  return (
    <div style={styles.page}>
      <div style={styles.mainRow} className="mainRow">
        {/* 비디오 */}
        <div style={{ ...styles.card, width: `${CARD_W}px`, height: `${CARD_H}px` }}>
          {isGenerating ? (
            <div style={styles.loadingWrap} role="status" aria-live="polite">
              <div style={styles.spinner} aria-hidden="true" />
              <div style={styles.loadingText}>
                {statusMessage || 'AI가 결과물을 생성 중입니다…'}
              </div>
              <div style={styles.actionsRow}>
                {onCancel && <button style={styles.btnGhost} onClick={onCancel}>취소</button>}
                {onRetry && <button style={styles.btnGhost} onClick={onRetry}>재시도</button>}
              </div>
              <div style={styles.hint}>이 페이지를 닫지 말고 잠시만 기다려 주세요.</div>
            </div>
          ) : showError ? (
            <div style={styles.errorWrap} role="alert">
              <div style={styles.errorIcon}>⚠️</div>
              <div style={styles.errorMsg}>{error}</div>
              <div style={styles.actionsRow}>
                {onRetry && <button style={styles.btnPrimary} onClick={onRetry}>재시도</button>}
              </div>
            </div>
          ) : (
            videoUrl ? (
              <video src={videoUrl} controls style={styles.video} />
            ) : (
              <span style={{ color: '#aaa' }}>영상이 없습니다</span>
            )
          )}
        </div>

        {/* 다운로드 안내 (글자 안 잘리게) */}
        {showVideo && (
          <aside
            style={{ ...styles.infoBox, width: `${CARD_W}px`, height: `${CARD_H}px` }}
            className="infoBox"
            aria-label="다운로드 방법 안내"
          >
            <div style={styles.infoTitle}>⬇️다운로드 방법</div>
            <ol style={styles.infoList}>
              <li>비디오 플레이어 <b>오른쪽 하단</b>에 위치한 <b>세로 점 3개(⋮)</b> 버튼을 누르세요.</li>
              <li>메뉴에서 <b>다운로드</b>를 선택하세요.</li>
            </ol>
            <div style={styles.infoNote}>
              * 브라우저/플레이어에 따라 메뉴 위치와 문구가 다를 수 있습니다.
            </div>
          </aside>
        )}
      </div>

      {/* 두 박스 아래 중앙 버튼 */}
      <div style={{ ...styles.buttonRow, width: `${contentWidth}px` }} className="buttonRow">
        <button onClick={onReuse} style={styles.reuseBtnLarge}>🔄 재생성하기</button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 980px) {
          .mainRow { flex-direction: column; align-items: center; }
          .buttonRow { width: 100% !important; max-width: 420px; }
          .infoBox { width: 100% !important; max-width: 420px; height: auto !important; min-height: 220px; }
        }
      `}</style>
    </div>
  );
}

export default VideoResultPage;

/* ===== 스타일 ===== */
const styles = {
  page: {
    position:'fixed',
    inset:0,
    zIndex:9,
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center', 
    minHeight: '100vh',
    backgroundColor:'#f8f8f8',
    width:'100%'
  },
  mainRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 24, marginBottom: 12
  },
  card: {
    backgroundColor: '#ffece8', borderRadius: 20, display: 'flex',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  },
  video: { width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover' },
  buttonRow: { display: 'flex', justifyContent: 'center', marginTop: 8 },
  reuseBtnLarge: {
    backgroundColor: '#ff7e65', color: 'white', padding: '16px 24px',
    border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },

  /* 로딩/에러 */
  loadingWrap: { textAlign: 'center', color: '#555', width: '80%' },
  spinner: {
    width: 48, height: 48, border: '5px solid rgba(0,0,0,0.1)',
    borderTopColor: '#ff7e65', borderRadius: '50%',
    margin: '0 auto 14px', animation: 'spin 1s linear infinite'
  },
  loadingText: { fontSize: 18, marginBottom: 12 },
  actionsRow: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 },
  btnGhost: {
    backgroundColor: 'transparent', color: '#ff7e65', padding: '10px 16px',
    border: '1px solid #ffb09f', borderRadius: 10, fontSize: 15, cursor: 'pointer'
  },
  btnPrimary: {
    backgroundColor: '#ff7e65', color: '#fff', padding: '12px 18px',
    border: 'none', borderRadius: 10, fontSize: 15, cursor: 'pointer', fontWeight: 700
  },
  hint: { fontSize: 13, color: '#777', marginTop: 8 },
  errorWrap: { textAlign: 'center', color: '#8a2f1d', width: '80%' },
  errorIcon: { fontSize: 30, marginBottom: 10 },
  errorMsg: { fontSize: 15, marginBottom: 12 },

  /*  글자 안 잘리게: 한국어 줄바꿈 설정 + 왼쪽 정렬 목록 */
  infoBox: {
    backgroundColor: '#fff5f2', border: '1px solid #ffddcf', borderRadius: 20,
    padding: '18px 20px', lineHeight: 1.8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    alignItems: 'stretch',            // 내부 요소 폭을 꽉 채움
    textAlign: 'left',                // 기본 왼쪽 정렬
    wordBreak: 'keep-all'             // 🇰🇷 한국어 단어 단위로만 줄바꿈
  },
  infoTitle: {
    fontWeight: 800, fontSize: 20, marginBottom: 10, textAlign: 'center'
  },
  infoList: {
    fontSize: 16,
    margin: '0 0 10px 0',
    paddingLeft: 22,                 // 숫자 들여쓰기
    listStylePosition: 'outside',    // 번호는 바깥, 본문 폭 넓게
    wordBreak: 'keep-all',           // 목록도 동일 적용
    whiteSpace: 'normal',
  },
  infoNote: { fontSize: 14, color: '#555', wordBreak: 'keep-all' }
};
