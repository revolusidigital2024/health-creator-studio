import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoDuration, Persona, OutlineSection, GeminiModelId } from "../types";
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

// --- CONFIGURATION ---
const getGenAIClient = () => {
  const apiKey = storageService.getGeminiKey();
  if (!apiKey) throw new Error("API Key Gemini belum diatur.");
  return new GoogleGenerativeAI(apiKey);
};

const getModelName = (): string => {
  // Kita paksa pakai model yang stabil dulu kalau yang baru bermasalah
  // Coba pakai 'gemini-1.5-flash' dulu untuk tes kestabilan JSON
  return (localStorage.getItem('health_creator_gemini_model') as string) || 'gemini-3-flashi-preview';
};

// HELPER: PARSER JSON "BODOH TAPI KUAT"
const parseRobustJson = (text: string) => {
  console.log("📦 RAW TEXT DARI AI:", text); // Cek ini di Console!
  
  try {
    // 1. Coba parse langsung
    return JSON.parse(text);
  } catch (e) {
    // 2. Kalau gagal, cari { pertama dan } terakhir
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonString = text.substring(start, end + 1);
        // Bersihkan karakter kontrol aneh (newline, tab, dll yang gak valid di JSON string)
        // const cleanString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); 
        return JSON.parse(jsonString);
      }
    } catch (e2) {
      console.error("❌ Gagal Parsing JSON Manual:", e2);
    }
  }
  
  throw new Error("AI tidak memberikan JSON yang valid. Coba lagi.");
};

// Helper Call API
const callGemini = async (prompt: string, expectJson: boolean = false) => {
  console.log("🚀 Mengirim Request ke AI...", { model: getModelName(), expectJson });
  
  const genAI = getGenAIClient();
  const model = genAI.getGenerativeModel({ 
    model: getModelName(),
    generationConfig: expectJson ? { responseMimeType: "application/json" } : undefined
  });
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("AI memberikan respon kosong.");
    
    return text;
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);
    if (error.message.includes('SAFETY')) throw new Error("Konten diblokir filter keamanan.");
    throw new Error(error.message || "Gagal menghubungi Gemini.");
  }
};

// --- API SERVICES ---

export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  const prompt = `Generate 5 viral video topic ideas for channel "${niche}" audience "${targetAge}". Language: ${language}. Output JSON array: [{"topic": "...", "angle": "..."}]`;
  const text = await callGemini(prompt, true);
  // Khusus Array
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1) {
     return { topics: JSON.parse(text.substring(start, end + 1)), sources: [] };
  }
  return { topics: [], sources: [] };
};

export const generateOutline = async (topic: string, age: string, niche: string, lang: string, duration: VideoDuration) => {
  const prompt = buildOutlinePrompt(topic, niche, age, lang);
  const text = await callGemini(prompt, true); // Paksa JSON Mode
  const data = parseRobustJson(text);
  
  // Validasi Data
  if (!data || !data.title || !data.outline) {
    console.error("Data tidak lengkap:", data);
    throw new Error("Struktur data dari AI tidak lengkap. Coba topik lain.");
  }
  
  return data;
};

export const generateScriptSegment = async (topic: string, section: OutlineSection, persona: Persona, age: string, lang: string, doctorName: string) => {
  const prompt = buildDraftingPrompt(topic, section, persona, age, lang, doctorName);
  const text = await callGemini(prompt, false); // Teks biasa
  return text.replace(/\*\*/g, '').trim();
};

export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id', focusFormat?: string) => {
  const prompt = buildWeeklyPlanPrompt(niche, targetAge, language, focusFormat);
  const text = await callGemini(prompt, true);
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1) return JSON.parse(text.substring(start, end + 1));
  return [];
};

export const generateImagePrompt = async (doctor: any, topic: string, hook: string) => {
  const prompt = buildImagePrompt(doctor, topic, hook);
  return await callGemini(prompt, false);
};

export const enhanceDoctorProfile = async (simpleDescription: string) => {
  const prompt = buildEnhancePrompt(simpleDescription);
  return await callGemini(prompt, false) || simpleDescription;
};

export const generateSSMLInstructions = async (fullScript: string, voiceStyle: string) => {
  const prompt = buildSSMLPrompt(fullScript, voiceStyle);
  let text = await callGemini(prompt, false);
  // Auto Cleaner
  const lines = text.split('\n');
  const startIdx = lines.findIndex(l => l.trim().startsWith('(') || l.trim().startsWith('Halo'));
  if (startIdx !== -1) text = lines.slice(startIdx).join('\n');
  return text.replace(/\*\*/g, '').trim();
};

export const generateVisualPrompts = async (fullScript: string) => {
  const prompt = buildVisualPromptsPrompt(fullScript);
  const text = await callGemini(prompt, true);
  // Array Parsing
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1) return JSON.parse(text.substring(start, end + 1));
  return [];
};

export const generatePackaging = async (topic: string, fullScript: string, targetAge: string) => {
  const prompt = buildPackagingPrompt(topic, fullScript, targetAge);
  const text = await callGemini(prompt, true);
  return parseRobustJson(text);
};