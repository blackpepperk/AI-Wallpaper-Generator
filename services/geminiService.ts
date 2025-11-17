
import { GoogleGenAI } from "@google/genai";

export const generateWallpapers = async (prompt: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment variables.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `${prompt}, phone wallpaper, vertical, high detail, cinematic lighting`,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: '9:16',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("이미지 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
};
