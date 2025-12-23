import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoDuration, Persona, OutlineSection, GeminiModelId } from "../types";
import { storageService } from "./storageService";

// Helper untuk inisialisasi AI secara dinamis berdasarkan Key di Settings
const getGenAIModel = () => {
  const apiKey = storageService.getGeminiKey();
  
  if (!apiKey) {
    throw new Error("API Key Gemini belum diatur. Silakan ke menu Pengaturan.");
  }

  // Ambil model yang dipilih user di settings, atau default ke flash
  const savedModel = localStorage.getItem('health_creator_gemini_model') || "gemini-1.5-flash";
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: savedModel });
};

export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  try {
    const model = getGenAIModel();
    // Prompt disesuaikan biar outputnya JSON array
    const prompt = `Generate 5 viral video topic ideas for a health channel about "${niche}" targeting "${targetAge}". Language: ${language}.
    Return strictly a JSON array without markdown formatting: [{"topic": "...", "angle": "..."}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return { topics: JSON.parse(cleanJson), sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Lempar error biar bisa ditangkap di UI
    throw new Error(error.message || "Gagal menghubungi Gemini.");
  }
};

export const generateOutline = async (topic: string, age: string, niche: string, lang: string, duration: VideoDuration) => {
  try {
    const model = getGenAIModel();
    const prompt = `Create a youtube video script outline for topic "${topic}" (Niche: ${niche}, Audience: ${age}). Duration: ${duration}. Language: ${lang}.
    Return ONLY JSON structure:
    {
      "title": "Clickbait Title",
      "hook": "First 3 seconds hook",
      "outline": [
        { "section": "Intro", "points": ["point 1", "point 2"] },
        { "section": "Body", "points": ["point 1", "point 2"] },
        { "section": "Conclusion", "points": ["CTA"] }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    throw new Error(`Gemini Error: ${error.message}`);
  }
};

export const generateScriptSegment = async (topic: string, section: OutlineSection, persona: Persona, age: string, lang: string) => {
  try {
    const model = getGenAIModel();
    const prompt = `Write a script segment for the section "${section.section}".
    Topic: ${topic}.
    Persona: ${persona.name} (${persona.description}). Style: ${persona.voiceStyle}.
    Points to cover: ${section.points.join(', ')}.
    Language: ${lang}. Target Audience: ${age}.
    Keep it engaging, conversational, and medically accurate but easy to understand.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Gagal membuat segmen script. Cek API Key.";
  }
};

export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id') => {
  try {
    const model = getGenAIModel();
    const prompt = `
      Act as a senior social media strategist for a health channel focusing on "${niche}" for "${targetAge}".
      Create a 5-day content calendar (Monday to Friday) that creates a cohesive mini-series.
      
      The content mix must be:
      - Day 1: Educational / Myth Busting (High value)
      - Day 2: Patient Story / Case Study (Relatable)
      - Day 3: Quick Tip / Hack (Viral potential)
      - Day 4: Deep Dive / Explanation (Authority)
      - Day 5: Q&A / Interaction (Engagement)

      Language: ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}.
      Output ONLY valid JSON array without markdown formatting. Structure:
      [
        { "day": "Senin", "type": "Mitos", "title": "...", "hook": "..." },
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return [];
  }
};