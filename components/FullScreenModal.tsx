
import React, { useCallback } from 'react';
import type { ImageResult } from '../types';
import { DownloadIcon, RemixIcon, CloseIcon } from './icons';

interface FullScreenModalProps {
  image: ImageResult | null;
  onClose: () => void;
  onRemix: (prompt: string) => void;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ image, onClose, onRemix }) => {
  if (!image) {
    return null;
  }

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = image.url;
    // Sanitize prompt for filename
    const fileName = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
    link.download = `ai_wallpaper_${fileName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [image]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm aspect-[9/16] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={image.url} alt={image.prompt} className="w-full h-full object-contain" />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-around items-center">
            <button 
                onClick={handleDownload}
                className="flex flex-col items-center text-white bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
            >
                <DownloadIcon className="w-6 h-6" />
                <span className="text-xs mt-1">다운로드</span>
            </button>
            <button 
                onClick={() => onRemix(image.prompt)}
                className="flex flex-col items-center text-white bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
            >
                <RemixIcon className="w-6 h-6" />
                <span className="text-xs mt-1">리믹스</span>
            </button>
        </div>
      </div>
       <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
        >
        <CloseIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FullScreenModal;
