
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initializing GoogleGenAI according to the required pattern using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchAIsongs = async (query: string) => {
  // Fix: Removed the redundant API key check as per the guideline that the key's availability is handled externally.
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is looking for music like: "${query}". Based on this, suggest 3 mood-matching keywords for a playlist and a short AI recommendation text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendation: { type: Type.STRING }
          },
          required: ["keywords", "recommendation"]
        }
      }
    });

    // Fix: Using response.text getter directly.
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini search failed:", error);
    return null;
  }
};
