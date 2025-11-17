
import { GoogleGenAI } from "@google/genai";

export const testApiKey = async (): Promise<boolean> => {
  // A new GoogleGenAI instance should be created to ensure the latest key is used.
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please select a key first.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // A lightweight call to verify the key is working.
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello',
    });
    return true;
  } catch (error) {
    console.error("API key test failed:", error);
    // Re-throw the original error so it can be handled by the UI component.
    throw error;
  }
};

export const generateWallpapers = async (prompt: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    // This provides a clear error if the component logic fails to prevent a call without a key.
    throw new Error("API key not found. Please select a key.");
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
    // Re-throw the original error so it can be handled by the UI component.
    throw error;
  }
};
