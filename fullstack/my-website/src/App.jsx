// src/App.jsx
import { useState, useEffect } from 'react';
import ImageUploadPage from './components/ImageUploadPage';
import GenreSelectPage from './components/GenreSelectPage';
import VideoResultPage from './components/VideoResultPage';
import Sidebar from './components/Sidebar';   // 사이드바 추가
import { generateVideo } from './api/api';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    window.scrollTo(0,0);
  }, [currentPage]);
  async function handleGenerateVideo(genre) {
    setCurrentPage(3);
    setIsGenerating(true);

    try {
      const videoPromise = generateVideo(uploadedImage.filename, genre);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));
      const data = await videoPromise;
      await delayPromise;

      if (data?.generated_filename) {
        setVideoUrl(`http://localhost:8000/videos/${data.generated_filename}`);
      } else {
        setVideoUrl(null);
      }
    } catch (error) {
      console.error('영상 생성 실패:', error);
      setVideoUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="app-shell">
      {/* 좌측 사이드바 */}
      <Sidebar currentStep={currentPage} version="v1.0" />

      {/* 우측 메인 영역 */}
      <main className="app-main">
        {currentPage === 1 && (
          <ImageUploadPage
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            goToNextPage={() => setCurrentPage(2)}
          />
        )}

        {currentPage === 2 && (
          <GenreSelectPage
            uploadedImage={uploadedImage}
            onGenerate={handleGenerateVideo}
          />
        )}

        {currentPage === 3 && (
          <VideoResultPage
            videoUrl={videoUrl}
            isGenerating={isGenerating}
            onReuse={() => {
              setUploadedImage(null);
              setVideoUrl(null);
              setIsGenerating(false);
              setCurrentPage(1);
            }}
          />
        )}


      </main>
    </div>
  );
}

export default App;
