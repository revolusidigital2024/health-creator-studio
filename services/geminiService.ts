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

// Helper sentral untuk memanggil Gemini API
const callGemini = async (prompt: string, expectJson: boolean = false) => {
  const apiKey = storageService.getGeminiKey();
  if (!apiKey) {
    throw new Error("API Key Gemini belum diatur. Silakan ke menu Pengaturan.");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Ambil model yang dipilih user, default ke Gemini 3 Flash
  const modelName = (localStorage.getItem('health_creator_gemini_model') as GeminiModelId) || 'gemini-3-flash-preview';

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: expectJson ? { responseMimeType: "application/json" } : undefined
  });
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error(`Error saat memanggil Gemini (model: ${modelName}):`, error);
    if (error.message.includes('API key not valid')) {
      throw new Error("API Key Gemini tidak valid. Cek kembali di menu Pengaturan.");
    }
    // Coba tangkap error safety filter
    if (error.message.includes('SAFETY')) {
      throw new Error("Konten diblokir oleh filter keamanan AI. Coba topik lain yang lebih aman.");
    }
    throw new Error(error.message || "Gagal menghubungi Gemini.");
  }
};

// Helper untuk parsing JSON dengan lebih aman
const parseSafeJson = (text: string) => {
  if (!text) return null;
  try {
    // Coba parse langsung, karena MimeType JSON harusnya sudah bersih
    return JSON.parse(text);
  } catch (e) {
    // Fallback kalau AI bandel dan tidak return JSON bersih
    try {
      const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (innerE) {
      console.error("Gagal total parsing JSON:", text);
    }
  }
  throw new Error("AI memberikan respon yang tidak bisa dibaca (Bukan format JSON).");
};


// --- API SERVICES ---

export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  const prompt = `Hasilkan 5 ide topik video viral untuk channel kesehatan "${niche}" dengan target audiens "${targetAge}". Bahasa: ${language}. Format: JSON array [{"topic": "...", "angle": "..."}]`;
  const responseText = await callGemini(prompt, true);
  return { topics: parseSafeJson(responseText) || [], sources: [] };
};

export const generateOutline = async (topic: string, age: string, niche: string, lang: string, duration: VideoDuration) => {
  const prompt = buildOutlinePrompt(topic, niche, age, lang);
  const responseText = await callGemini(prompt, true);
  const data = parseSafeJson(responseText);
  if (!data || !data.title) throw new Error("Data naskah tidak lengkap.");
  return data;
};

export const generateScriptSegment = async (topic: string, section: OutlineSection, persona: Persona, age: string, lang: string, doctorName: string) => {
  const prompt = buildDraftingPrompt(topic, section, persona, age, lang, doctorName);
  const responseText = await callGemini(prompt, false);
  return responseText.trim();
};

export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id', focusFormat?: string) => {
  const prompt = buildWeeklyPlanPrompt(niche, targetAge, language, focusFormat);
  const responseText = await callGemini(prompt, true);
  return parseSafeJson(responseText) || [];
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
  const responseText = await callGemini(prompt, false);
  // Auto-cleaner untuk SSML
  const lines = responseText.split('\n');
  const firstRealLineIndex = lines.findIndex(line => line.trim().startsWith('(') || line.trim().startsWith('Halo'));
  let cleanedText = responseText;
  if (firstRealLineIndex !== -1) {
    cleanedText = lines.slice(firstRealLineIndex).join('\n');
  }
  return cleanedText.replace(/\*\*/g, '').trim();
};

export const generateVisualPrompts = async (fullScript: string) => {
  const prompt = buildVisualPromptsPrompt(fullScript);
  const responseText = await callGemini(prompt, true);
  return parseSafeJson(responseText) || [];
};

export const generatePackaging = async (topic: string, fullScript: string, targetAge: string) => {
  const prompt = buildPackagingPrompt(topic, fullScript, targetAge);
  const responseText = await callGemini(prompt, true);
  return parseSafeJson(responseText);
};