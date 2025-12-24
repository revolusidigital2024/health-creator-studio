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
  buildVisualPromptsPrompt // <-- TAMBAHKAN INI (YANG TADI HILANG)
} from "./promptTemplates";

// ... (kode konfigurasi getGenAIModel SAMA) ...

const getGenAIModel = () => {
  const apiKey = storageService.getGeminiKey();
  if (!apiKey) throw new Error("API Key Gemini belum diatur.");
  const savedModel = localStorage.getItem('health_creator_gemini_model') || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: savedModel });
};

// ... (kode fungsi suggestNicheTopics SAMA) ...
export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  // ... (isi fungsi sama)
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

// ... (kode fungsi generateOutline SAMA) ...
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

// ... (kode fungsi generateScriptSegment SAMA) ...
export const generateScriptSegment = async (topic: string, section: OutlineSection, persona: Persona, age: string, lang: string, doctorName: string) => {
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

// ... (kode fungsi generateWeeklyPlan SAMA) ...
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

// ... (kode fungsi generateImagePrompt SAMA) ...
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

// ... (kode fungsi enhanceDoctorProfile SAMA) ...
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

// ... (kode fungsi generateSSMLInstructions SAMA) ...
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

// --- FUNGSI BARU (YANG TADI ERROR) ---
export const generateVisualPrompts = async (fullScript: string) => {
  console.log("🚀 Mengirim naskah ke AI Visual Director..."); 
  
  try {
    const model = getGenAIModel();
    // SEKARANG FUNGSI INI SUDAH DI-IMPORT
    const prompt = buildVisualPromptsPrompt(fullScript);
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("📦 Respon Mentah AI:", text); 

    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (jsonError) {
      console.error("❌ Gagal Parsing JSON:", jsonError);
      throw new Error("AI membalas dengan format yang salah.");
    }

  } catch (error: any) {
    console.error("❌ Error Service:", error);
    throw new Error(error.message || "Gagal menghubungi AI Visual.");
  }
};