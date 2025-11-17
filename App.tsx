
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageResult } from './types';
import { generateWallpapers, testApiKey } from './services/geminiService';
import ImageGrid from './components/ImageGrid';
import FullScreenModal from './components/FullScreenModal';
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const API_KEY_STORAGE_KEY = 'gemini-api-key';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('비오는 서정적인 도시 풍경');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [manualApiKey, setManualApiKey] = useState<string>('');
  
  const [isTesting, setIsTesting] = useState<boolean>(false);
  
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // On load, check for a manually saved key first.
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
        setSavedApiKey(storedKey);
        setApiKeySelected(true);
        return;
    }

    // If no manual key, check for an AI Studio key.
    const checkAistudioKey = async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setApiKeySelected(true);
        }
    };
    checkAistudioKey();
  }, []);

  const handleSelectApiKey = async () => {
    setError(null);
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            
            setIsTesting(true);
            await testApiKey(); // Test using the key from process.env
            setApiKeySelected(true);
            // Clear any previously saved manual key to avoid conflicts
            setSavedApiKey(null);
            localStorage.removeItem(API_KEY_STORAGE_KEY);

        } catch (e: any) {
            console.error("AI Studio key selection or test failed:", e);
            const errorMessage = e.message || '';
            if (errorMessage.includes('API key not valid') || errorMessage.includes('permission denied') || errorMessage.includes('not found')) {
                setError("연결 테스트 실패: API 키가 유효하지 않거나 권한이 없습니다. 다른 키를 선택해주세요.");
            } else {
                setError("API 키 선택 또는 테스트 중 오류가 발생했습니다.");
            }
            setApiKeySelected(false);
        } finally {
            setIsTesting(false);
        }
    }
  };
  
  const handleSaveAndTestManualApiKey = async () => {
      if (!manualApiKey) {
          setError('API 키를 입력해주세요.');
          return;
      }
      setError(null);
      setIsTesting(true);
      try {
          await testApiKey(manualApiKey);
          localStorage.setItem(API_KEY_STORAGE_KEY, manualApiKey);
          setSavedApiKey(manualApiKey);
          setApiKeySelected(true);
      } catch (e: any) {
          const errorMessage = e.message || '';
            if (errorMessage.includes('API key not valid') || errorMessage.includes('permission denied') || errorMessage.includes('not found')) {
                setError("연결 테스트 실패: 입력한 API 키가 유효하지 않습니다.");
            } else {
                setError("API 키 테스트 중 오류가 발생했습니다.");
            }
          setApiKeySelected(false);
      } finally {
          setIsTesting(false);
      }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      // Use the saved manual key if it exists, otherwise the service will use the AI Studio key
      const imageUrls = await generateWallpapers(prompt, savedApiKey ?? undefined);
      const newImages = imageUrls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt: prompt,
      }));
      setImages(newImages);
    } catch (err: any) {
      const errorMessage = err.message || '';
      if (
        errorMessage.includes('API key not valid') || 
        errorMessage.includes('Requested entity was not found') ||
        errorMessage.includes('API key not found')
      ) {
          setError('API 키가 유효하지 않습니다. 새로운 키를 설정해주세요.');
          // Clear the invalid key and force user to re-authenticate
          setApiKeySelected(false);
          setSavedApiKey(null);
          localStorage.removeItem(API_KEY_STORAGE_KEY);
      } else {
        setError(errorMessage || '이미지 생성 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, savedApiKey]);

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

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans text-center">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              AI 배경화면 생성기
            </h1>
            <p className="text-gray-400 mt-2">당신만의 특별한 휴대폰 배경화면을 만들어보세요</p>
        </header>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">API 키 설정</h2>
            <p className="text-gray-400 mb-6">
                시작하려면 Google AI Studio API 키를 선택하거나 직접 입력해주세요.
            </p>
            
            {/* AI Studio Key Selection */}
            <button
                onClick={handleSelectApiKey}
                disabled={isTesting}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
            >
                {isTesting ? '테스트 중...' : 'AI Studio에서 키 선택'}
            </button>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">또는</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Manual Key Input */}
            <div className='space-y-4'>
                 <input
                    type="password"
                    value={manualApiKey}
                    onChange={(e) => setManualApiKey(e.target.value)}
                    placeholder="여기에 API 키를 붙여넣으세요"
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    disabled={isTesting}
                />
                 <button
                    onClick={handleSaveAndTestManualApiKey}
                    disabled={isTesting || !manualApiKey}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                >
                    {isTesting ? '연결 테스트 중...' : 'API 키 저장 및 테스트'}
                </button>
            </div>

            {isTesting && (
                <div className="flex items-center justify-center mt-4 text-gray-400 text-sm">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>API 키 연결을 확인하고 있습니다...</span>
                </div>
            )}
            {error && <p className="text-red-400 mt-4 text-sm bg-red-900/20 p-3 rounded-md">{error}</p>}
             <p className="text-xs text-gray-500 mt-6">
                API 키 사용은 Google Cloud 프로젝트와 연결되며 요금이 부과될 수 있습니다. 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">
                    자세히 알아보기
                </a>
            </p>
        </div>
      </div>
    );
  }

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
