import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const getCREAI = async (prompt: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[], isTechQuery: boolean) => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are CREAI, an advanced technology assistant for CRE Connect.
    Behavior Rules:
    - If the user query is technology-related (coding, engineering, debugging, etc.), provide deep, technical, and detailed explanations with code examples where relevant.
    - If the user query is non-technical, provide a simplified, polite, and brief response.
    - Focus on educational value.
    - You MUST remember previous conversation context.
    - Specialization context: ${isTechQuery ? 'Tech Mode Active' : 'General Mode Active'}.`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
    // @ts-ignore - SDK types might vary slightly
    history: history
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text;
};

export const generateDailyLesson = async (specialization: string, day: number) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a structured, progressive, and detailed lesson for a student specializing in ${specialization}. 
    This is Lesson Day ${day}. 
    The lesson should include:
    1. A Title
    2. Detailed Content
    3. 3-5 Quiz Questions at the end (JSON format: { questions: [{ q: string, options: string[], correct: number }] })
    
    Structure the response as JSON.`;
    
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });
  
  return JSON.parse(response.text);
};
