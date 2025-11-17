
import React from 'react';
import type { ImageResult } from '../types';

interface ImageGridProps {
  images: ImageResult[];
  onImageClick: (image: ImageResult) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {images.map((image) => (
        <div 
          key={image.id} 
          className="aspect-[9/16] bg-gray-700 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
          onClick={() => onImageClick(image)}
        >
          <img src={image.url} alt={image.prompt} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
