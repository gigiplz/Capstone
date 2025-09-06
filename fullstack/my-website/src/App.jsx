import { useState } from 'react';
import ImageUploadPage from './components/ImageUploadPage';
import GenreSelectPage from './components/GenreSelectPage';
import VideoResultPage from './components/VideoResultPage';
import { generateVideo } from './api/api'; 

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageId, setImageId] = useState(null); // ✅ 추가
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateVideo(genre) {
    setCurrentPage(3);
    setIsGenerating(true);

    try {
      // 1) 백엔드 요청
      const videoPromise = generateVideo(uploadedImage.filename, genre);

      // 2) 최소 10초 딜레이
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 10000));

      // 3) 두 개 동시에 실행 → 둘 다 끝나야 다음 진행
      const data = await videoPromise;
      await delayPromise;

      // 10초 지난 뒤에 영상 세팅
      if (data?.generated_filename) {
        setVideoUrl(`http://localhost:8000/videos/${data.generated_filename}`);
      } else {
        setVideoUrl(null);
      }
    } catch (error) {
      console.error('영상 생성 실패:', error);
      setVideoUrl(null);
    } finally {
      // 무조건 10초 지난 후에 false로 전환됨
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ width : '100%', minHeight : '100vh'}}>
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
    </div>
  );
}

export default App;
