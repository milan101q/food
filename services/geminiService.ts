
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe } from '../types.ts';
import { translations, Language } from '../i18n/translations.ts';

function getGoogleAI() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

function base64ToGenerativePart(base64: string, mimeType: string) {
    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
}

export async function analyzeIngredients(imageDataBase64: string, lang: Language): Promise<string[]> {
    const ai = getGoogleAI();
    const imagePart = base64ToGenerativePart(imageDataBase64.split(',')[1], imageDataBase64.split(';')[0].split(':')[1]);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [
            imagePart,
            { text: translations[lang].prompts.analyzeIngredients }
        ]},
    });

    const text = response.text;
    return text.split(',').map(ingredient => ingredient.trim()).filter(Boolean);
}


export async function generateRecipeSuggestions(ingredients: string[], lang: Language): Promise<Recipe[]> {
    const ai = getGoogleAI();
    const prompt = translations[lang].prompts.generateRecipe(ingredients);

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recipes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      ingredients: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                      },
                      steps: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                      },
                      calories: { type: Type.NUMBER, description: 'Optional estimated calories' }
                    },
                    required: ["title", "description", "ingredients", "steps"]
                  }
                }
              },
              required: ["recipes"]
            }
        }
    });

    try {
      const jsonText = response.text;
      const parsed = JSON.parse(jsonText);
      return parsed.recipes as Recipe[];
    } catch (e) {
      console.error("Failed to parse recipe JSON:", e);
      throw new Error("Could not generate valid recipe suggestions.");
    }
}


export async function generateDishImage(prompt: string): Promise<string> {
    const ai = getGoogleAI();

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("Image generation failed to produce an image.");
}