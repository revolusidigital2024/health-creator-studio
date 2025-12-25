import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoDuration, Persona, OutlineSection } from "../types";
import { storageService } from "./storageService";
import { 
  buildOutlinePrompt, 
  buildDraftingPrompt, 
  buildWeeklyPlanPrompt, 
  buildImagePrompt, 
  buildEnhancePrompt,
  buildSSMLPrompt,
  buildVisualPromptsPrompt,
  buildPackagingPrompt
} from "./promptTemplates";

// --- CONFIG ---
const getGenAIModel = () => {
  const apiKey = storageService.getGeminiKey();
  if (!apiKey) throw new Error("API Key Gemini belum diatur.");
  const savedModel = localStorage.getItem('health_creator_gemini_model') || "gemini-3-flash-preview";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: savedModel });
};

// --- HELPER PARSER (Tetap Sama) ---
const parseGeminiJson = (text: string) => {
  console.log("📦 RAW RESPONSE DARI AI:", text); 
  try {
    return JSON.parse(text);
  } catch (e1) {
    try {
      let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      return JSON.parse(clean);
    } catch (e2) {
      try {
        const clean = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); 
        const first = clean.indexOf('{');
        const last = clean.lastIndexOf('}');
        if (first !== -1 && last !== -1) return JSON.parse(clean.substring(first, last + 1));
      } catch(e3) { throw new Error("AI gagal memberikan format data yang benar."); }
    }
  }
  throw new Error("Gagal membaca data JSON.");
};

// --- SERVICES ---

export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  try {
    const model = getGenAIModel();
    const prompt = `Generate 5 viral video topic ideas for a health channel about "${niche}" targeting "${targetAge}". Language: ${language}. Return strictly a JSON array without markdown formatting: [{"topic": "...", "angle": "..."}]`;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    const start = text.indexOf('['); const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) return { topics: JSON.parse(text.substring(start, end + 1)), sources: [] };
    return { topics: [], sources: [] };
  } catch (error: any) { throw new Error(error.message || "Gagal menghubungi Gemini."); }
};

export const generateOutline = async (topic: string, age: string, niche: string, lang: string, duration: VideoDuration) => {
  try {
    const model = getGenAIModel();
    const prompt = buildOutlinePrompt(topic, niche, age, lang);
    const result = await model.generateContent(prompt);
    const parsedData = parseGeminiJson(result.response.text());
    if (!parsedData.title || !parsedData.outline) throw new Error("Data JSON tidak lengkap.");
    return parsedData;
  } catch (error: any) { throw new Error(`Gemini Error: ${error.message}`); }
};

export const generateScriptSegment = async (topic: string, section: OutlineSection, persona: Persona, age: string, lang: string, doctorName: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildDraftingPrompt(topic, section, persona, age, lang, doctorName);
    const result = await model.generateContent(prompt);
    let cleanText = result.response.text();
    cleanText = cleanText.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    return cleanText;
  } catch (error) { return "Gagal membuat segmen script."; }
};

// UPDATE: FUNGSI INI SEKARANG TERIMA existingTitles
export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id', focusFormat?: string, existingTitles: string[] = []) => {
  try {
    const model = getGenAIModel();
    
    // Logic Prompt Anti Duplikat
    let instruction = "";
    if (focusFormat) {
        instruction = `Create a 5-day content calendar where EVERY DAY focuses on the format: "${focusFormat}". Ensure topics are varied.`;
    } else {
        instruction = `
        The content mix must be STRICTLY EDUCATIONAL & MEDICAL:
        - Day 1: Medical Myth Busting
        - Day 2: Clinical Case Study
        - Day 3: Medical Hack / Tips
        - Day 4: Deep Dive / Explanation
        - Day 5: Q&A / FAQ`;
    }

    // Tambahkan larangan topik kembar
    const forbidden = existingTitles.length > 0 ? `DO NOT use these topics again: ${existingTitles.join(", ")}.` : "";

    const prompt = `
      Act as a generic professional Doctor / Medical Expert specializing in "${niche}" for audience "${targetAge}".
      Create a 5-day content calendar (Monday to Friday).
      
      ${instruction}
      ${forbidden}

      Language: ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}.
      Tone: Professional, Empathetic, Scientific but easy to understand.
      
      Output ONLY valid JSON array without markdown. Structure:
      [ { "day": "Senin", "type": "...", "title": "...", "hook": "..." }, ... ]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
       return JSON.parse(text.substring(start, end + 1));
    }
    return [];
  } catch (error) { return []; }
};

export const generateImagePrompt = async (doctor: any, topic: string, hook: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildImagePrompt(doctor, topic, hook);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) { return "Gagal membuat prompt gambar."; }
};

export const enhanceDoctorProfile = async (simpleDescription: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildEnhancePrompt(simpleDescription);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) { return simpleDescription; }
};

export const generateSSMLInstructions = async (fullScript: string, voiceStyle: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildSSMLPrompt(fullScript, voiceStyle);
    const result = await model.generateContent(prompt);
    return result.response.text(); 
  } catch (error) { return fullScript; }
};

export const generateVisualPrompts = async (fullScript: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildVisualPromptsPrompt(fullScript);
    const result = await model.generateContent(prompt);
    
    let text = result.response.text();
    const start = text.indexOf('['); const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) return JSON.parse(text.substring(start, end + 1));
    throw new Error("Format Visual Prompt Salah");
  } catch (error: any) { throw new Error(error.message || "Gagal menghubungi AI Visual."); }
};

export const generatePackaging = async (topic: string, fullScript: string, targetAge: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildPackagingPrompt(topic, fullScript, targetAge);
    const result = await model.generateContent(prompt);
    return parseGeminiJson(result.response.text());
  } catch (error) { return null; }
};