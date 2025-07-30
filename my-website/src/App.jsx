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
      const data = await generateVideo(uploadedImage.filename, genre); // ⬅️ filename만 넘김
      setVideoUrl(`http://localhost:8000/videos/${data.generated_filename}`);
    } catch (error) {
      console.error('영상 생성 실패:', error);
      setVideoUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
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
