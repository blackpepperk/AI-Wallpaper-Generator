
import React, { useState, useCallback, useRef } from 'react';
import type { ImageResult } from './types';
import { generateWallpapers } from './services/geminiService';
import ImageGrid from './components/ImageGrid';
import FullScreenModal from './components/FullScreenModal';
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('비오는 서정적인 도시 풍경');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  
  const mainRef = useRef<HTMLDivElement>(null);


  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      const imageUrls = await generateWallpapers(prompt);
      const newImages = imageUrls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt: prompt,
      }));
      setImages(newImages);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleImageClick = (image: ImageResult) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleRemix = (remixPrompt: string) => {
    setPrompt(remixPrompt);
    setSelectedImage(null);
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          AI 배경화면 생성기
        </h1>
        <p className="text-gray-400 mt-1 text-sm">당신만의 특별한 휴대폰 배경화면을 만들어보세요</p>
      </header>
      
      <main className="flex-grow flex flex-col">
        <div className="p-4 sticky top-0 bg-gray-900 z-10 shadow-lg shadow-black/20">
            <div className="relative">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="예: '별이 빛나는 밤하늘 아래 숲'"
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 pr-28 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                    rows={2}
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                    <SparklesIcon className="w-5 h-5 mr-2"/>
                    <span>생성</span>
                </button>
            </div>
        </div>

        <div className="flex-grow">
          {isLoading && <Loader />}
          {error && <p className="text-center text-red-400 p-4">{error}</p>}
          <ImageGrid images={images} onImageClick={handleImageClick} />
          {!isLoading && images.length === 0 && (
             <div className="text-center p-8 text-gray-500">
                <p>어떤 분위기의 배경화면을 원하시나요?</p>
                <p className="text-sm mt-2">위 입력창에 원하는 내용을 자유롭게 적어보세요.</p>
            </div>
          )}
        </div>
      </main>

      <FullScreenModal 
        image={selectedImage}
        onClose={handleCloseModal}
        onRemix={handleRemix}
      />
    </div>
  );
};

export default App;
