
import { GoogleGenAI } from "@google/genai";

/**
 * Creates a GoogleGenAI client instance.
 * It prioritizes a manually provided API key, falling back to the
 * one injected by the environment (e.g., from AI Studio).
 * @param {string} [apiKey] - An optional, manually provided API key.
 * @returns {GoogleGenAI} An instance of the GoogleGenAI client.
 * @throws {Error} If no API key can be found.
 */
const getClient = (apiKey?: string): GoogleGenAI => {
  const keyToUse = apiKey || process.env.API_KEY;
  if (!keyToUse) {
    throw new Error("API key not found. Please provide a key manually or select one via AI Studio.");
  }
  return new GoogleGenAI({ apiKey: keyToUse });
};

/**
 * Tests the validity of an API key by making a lightweight call.
 * @param {string} [apiKey] - The API key to test. If not provided, it uses the environment key.
 * @returns {Promise<boolean>} A promise that resolves to true if the key is valid.
 */
export const testApiKey = async (apiKey?: string): Promise<boolean> => {
  try {
    const ai = getClient(apiKey);
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

/**
 * Generates four 9:16 aspect ratio wallpapers based on a user prompt.
 * @param {string} prompt - The user's creative prompt.
 * @param {string} [apiKey] - The API key to use for the request. If not provided, it uses the environment key.
 * @returns {Promise<string[]>} A promise that resolves to an array of base64-encoded image URLs.
 */
export const generateWallpapers = async (prompt: string, apiKey?: string): Promise<string[]> => {
  const ai = getClient(apiKey);
  
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
