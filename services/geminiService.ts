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
  buildPackagingPrompt // <-- IMPORT BARU
} from "./promptTemplates";

// --- CONFIG ---
const getGenAIModel = () => {
  const apiKey = storageService.getGeminiKey();
  if (!apiKey) throw new Error("API Key Gemini belum diatur. Silakan ke menu Pengaturan.");
  const savedModel = localStorage.getItem('health_creator_gemini_model') || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: savedModel });
};

// --- SERVICES ---

// 1. IDEATION
export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  try {
    const model = getGenAIModel();
    const prompt = `Generate 5 viral video topic ideas for a health channel about "${niche}" targeting "${targetAge}". Language: ${language}. Return strictly a JSON array without markdown formatting: [{"topic": "...", "angle": "..."}]`;
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return { topics: JSON.parse(cleanJson), sources: [] };
  } catch (error: any) {
    throw new Error(error.message || "Gagal menghubungi Gemini.");
  }
};

// 2. OUTLINING
export const generateOutline = async (topic: string, age: string, niche: string, lang: string, duration: VideoDuration) => {
  try {
    const model = getGenAIModel();
    const prompt = buildOutlinePrompt(topic, niche, age, lang);
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    throw new Error(`Gemini Error: ${error.message}`);
  }
};

// 3. DRAFTING
export const generateScriptSegment = async (
  topic: string, 
  section: OutlineSection, 
  persona: Persona, 
  age: string, 
  lang: string, 
  doctorName: string 
) => {
  try {
    const model = getGenAIModel();
    const prompt = buildDraftingPrompt(topic, section, persona, age, lang, doctorName);
    const result = await model.generateContent(prompt);
    let cleanText = result.response.text();
    cleanText = cleanText.replace(/\*\*/g, '').replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    return cleanText;
  } catch (error) {
    return "Gagal membuat segmen script.";
  }
};

// 4. WEEKLY PLANNER
export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id', focusFormat?: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildWeeklyPlanPrompt(niche, targetAge, language, focusFormat);
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    return [];
  }
};

// 5. IMAGE PROMPT
export const generateImagePrompt = async (doctor: any, topic: string, hook: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildImagePrompt(doctor, topic, hook);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Gagal membuat prompt gambar.";
  }
};

// 6. MAGIC ENHANCE
export const enhanceDoctorProfile = async (simpleDescription: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildEnhancePrompt(simpleDescription);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return simpleDescription;
  }
};

// 7. VOCAL DIRECTOR SCRIPT
export const generateSSMLInstructions = async (fullScript: string, voiceStyle: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildSSMLPrompt(fullScript, voiceStyle);
    const result = await model.generateContent(prompt);
    return result.response.text(); 
  } catch (error) {
    return fullScript; 
  }
};

// 8. VISUAL DIRECTOR (STORYBOARD)
export const generateVisualPrompts = async (fullScript: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildVisualPromptsPrompt(fullScript);
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    throw new Error(error.message || "Gagal menghubungi AI Visual.");
  }
};

// 9. PACKAGING (JUDUL & THUMBNAIL) - FUNGSI BARU
export const generatePackaging = async (topic: string, fullScript: string, targetAge: string) => {
  try {
    const model = getGenAIModel();
    // Panggil prompt packaging
    const prompt = buildPackagingPrompt(topic, fullScript, targetAge);
    
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Packaging Error:", error);
    // Return null biar UI bisa handle error dengan elegan
    return null;
  }
};