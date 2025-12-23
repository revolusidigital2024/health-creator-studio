import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoDuration, Persona, OutlineSection } from "../types";
import { storageService } from "./storageService";

// Helper untuk inisialisasi AI secara dinamis
const getGenAIModel = () => {
  const apiKey = storageService.getGeminiKey();
  
  if (!apiKey) {
    throw new Error("API Key Gemini belum diatur. Silakan ke menu Pengaturan.");
  }

  // Default ke 2.5 Flash
  const savedModel = localStorage.getItem('health_creator_gemini_model') || "gemini-2.5-flash";
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: savedModel });
};

// 1. IDEATION
export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  try {
    const model = getGenAIModel();
    const prompt = `Generate 5 viral video topic ideas for a health channel about "${niche}" targeting "${targetAge}". Language: ${language}.
    Return strictly a JSON array without markdown formatting: [{"topic": "...", "angle": "..."}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return { topics: JSON.parse(cleanJson), sources: [] };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Gagal menghubungi Gemini.");
  }
};

// 2. OUTLINING
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

// 3. DRAFTING
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

// 4. WEEKLY PLANNER
export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id', focusFormat?: string) => {
  try {
    const model = getGenAIModel();
    
    let instruction = "";
    if (focusFormat) {
        instruction = `
        Create a 5-day content calendar where EVERY DAY focuses on the format: "${focusFormat}".
        Example: If format is 'Listicle', Day 1 could be "5 Foods...", Day 2 "5 Habits...", etc.
        Make sure the topics are varied even if the format is the same.`;
    } else {
        instruction = `
        The content mix must be STRICTLY EDUCATIONAL & MEDICAL:
        - Day 1: Medical Myth Busting (Correcting misconceptions)
        - Day 2: Clinical Case Study / Bedah Kasus (Analyzing patient condition. DO NOT use "Inspirational Story")
        - Day 3: Medical Hack / Tips (Practical advice)
        - Day 4: Deep Dive (Explaining the 'Why')
        - Day 5: Q&A / FAQ`;
    }

    const prompt = `
      Act as a generic professional Doctor / Medical Expert specializing in "${niche}" for audience "${targetAge}".
      Create a 5-day content calendar (Monday to Friday).
      
      ${instruction}

      Language: ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}.
      Tone: Professional, Empathetic, Scientific but easy to understand.
      
      Output ONLY valid JSON array without markdown formatting. Structure:
      [
        { "day": "Senin", "type": "${focusFormat || 'Mitos'}", "title": "...", "hook": "..." },
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

// 5. IMAGE PROMPT GENERATOR
export const generateImagePrompt = async (doctor: any, topic: string, hook: string) => {
  try {
    const model = getGenAIModel();
    const prompt = `
      Act as an Expert AI Prompt Engineer for Midjourney v6.
      Create a highly detailed image prompt based on this Doctor Profile:
      - Name: ${doctor.name}
      - Gender: ${doctor.gender}
      - Appearance: ${doctor.appearance}
      - Outfit: ${doctor.outfit}
      
      Context:
      - Topic: "${topic}"
      - Mood/Vibe: "${hook}"
      
      Task:
      Create a prompt for a cinematic, hyper-realistic 8k portrait of the doctor suitable for a YouTube Video Thumbnail or Overlay.
      The doctor's facial expression must match the mood.
      Background: Professional Medical Studio, depth of field, soft lighting.
      Aspect Ratio: --ar 16:9
      
      Output ONLY the prompt text in English. No explanations.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Gagal membuat prompt gambar.";
  }
};

// 6. MAGIC ENHANCE (Visual Translator)
export const enhanceDoctorProfile = async (simpleDescription: string) => {
  try {
    const model = getGenAIModel();
    const prompt = `
      Act as an AI Visual Prompter.
      Translate this simple Indonesian description of a doctor into a detailed, high-quality English visual description suitable for AI Image Generation (Midjourney/Flux).
      
      Input (Indonesian): "${simpleDescription}"
      
      Requirements:
      1. Translate to English.
      2. Add professional details (lighting, texture, vibe).
      3. Keep it concise but descriptive (comma separated).
      4. DO NOT change the core features (gender, age, accessories) specified by user.
      5. Add "High quality, 8k, photorealistic" at the end.

      Example Input: "Dokter cewek, cantik, rambut panjang, pake jas dokter"
      Example Output: "Beautiful female doctor, long flowing hair, wearing pristine white medical coat, soft studio lighting, professional look, sharp focus, 8k, photorealistic"
      
      Output ONLY the text.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Enhance Error:", error);
    return simpleDescription;
  }
};