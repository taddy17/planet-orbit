import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) {
    return ai;
  }
  try {
    // This is a global variable injected by the hosting environment.
    if (process.env.API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      return ai;
    }
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
    return null;
  } catch(e) {
    console.error("Error initializing GoogleGenAI, Gemini features will be disabled.", e);
    return null;
  }
};

export const generatePlayerName = async (): Promise<string> => {
    const aiClient = getAI();
    if (!aiClient) return "Player 1";

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: "Generate a cool, unique, two-word space-themed callsign for a game player. Examples: Star Hopper, Comet Drifter, Nebula Nomad. It should be title-cased." }] }],
        });
        const text = response.text.trim().replace(/"/g, '');
        return text || "Galaxy Rider";
    } catch (error) {
        console.error("Error generating player name:", error);
        return "Cosmic Voyager"; // Fallback name
    }
};

export const generateThemeFromPrompt = async (prompt: string): Promise<{ planetColor: string; moonColor: string } | null> => {
    const aiClient = getAI();
    if (!aiClient) return null;

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [{
                    text: `Based on the following theme, generate a hex color for a planet and its moon: "${prompt}". Provide only a JSON object with "planetColor" and "moonColor" keys.`
                }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        planetColor: { type: Type.STRING, description: "Hex color for the main planet, e.g., '#FF5733'" },
                        moonColor: { type: Type.STRING, description: "Hex color for the orbiting moon, e.g., '#33FFC1'" }
                    },
                    required: ["planetColor", "moonColor"]
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const colors = JSON.parse(jsonStr);
        return colors;

    } catch (error) {
        console.error("Error generating theme:", error);
        return null;
    }
};

export const getGameOverCommentary = async (score: number): Promise<string> => {
    const aiClient = getAI();
    if (!aiClient) return "Good game!";

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: `You are a quirky and encouraging game coach called 'Coach'. A player just finished a game with a score of ${score}. Give them a short, fun, encouraging, one-sentence comment about their performance. Keep it under 15 words.` }] }],
        });
        const text = response.text.trim().replace(/"/g, '');
        return text || `A solid score of ${score}!`;
    } catch (error) {
        console.error("Error generating commentary:", error);
        return `You scored ${score}! Try again!`; // Fallback comment
    }
};
