import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a production environment, API keys should be handled securely on a backend.
// For this client-side demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateResponse = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your environment configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
