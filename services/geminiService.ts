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
  if (!apiKey) throw new Error("API Key Gemini belum diatur. Silakan ke menu Pengaturan.");
  const savedModel = localStorage.getItem('health_creator_gemini_model') || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: savedModel });
};

// --- HELPER: JSON PARSER BADAK (ANTI-GESER) ---
const parseGeminiJson = (text: string) => {
  console.log("📦 RAW RESPONSE DARI AI:", text); 

  try {
    // 1. Cari posisi kurung kurawal pembuka '{' paling pertama
    const start = text.indexOf('{');
    // 2. Cari posisi kurung kurawal penutup '}' paling terakhir
    const end = text.lastIndexOf('}');

    // Kalau gak nemu, error
    if (start === -1 || end === -1) {
      throw new Error("Tidak ditemukan struktur JSON {} dalam respon.");
    }

    // 3. Potong langsung
    const jsonString = text.substring(start, end + 1);

    // 4. Bersihkan karakter jahat
    const cleanString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    // 5. Parse
    return JSON.parse(cleanString);

  } catch (e: any) {
    console.error("❌ PARSING ERROR:", e);
    throw new Error(`Gagal membaca data AI: ${e.message}`);
  }
};

// --- SERVICES ---

// 1. IDEATION
export const suggestNicheTopics = async (niche: string, targetAge: string, language: string, useWebSearch: boolean) => {
  try {
    const model = getGenAIModel();
    const prompt = `Generate 5 viral video topic ideas for a health channel about "${niche}" targeting "${targetAge}". Language: ${language}. Return strictly a JSON array without markdown formatting: [{"topic": "...", "angle": "..."}]`;
    const result = await model.generateContent(prompt);
    
    // Array Parsing Manual
    let text = result.response.text();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
       const jsonString = text.substring(start, end + 1);
       return { topics: JSON.parse(jsonString), sources: [] };
    }
    return { topics: [], sources: [] };
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
    const parsedData = parseGeminiJson(result.response.text());
    if (!parsedData.title || !parsedData.outline) throw new Error("Data JSON tidak lengkap.");
    return parsedData;
  } catch (error: any) {
    throw new Error(`Gemini Error: ${error.message}`);
  }
};

// 3. DRAFTING
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

// 4. WEEKLY PLANNER (FIXED: ADA 5 PARAMETER)
export const generateWeeklyPlan = async (
  niche: string, 
  targetAge: string, 
  language: string = 'id', 
  focusFormat?: string, 
  existingTitles: string[] = [] // <-- INI DIA YANG TADI HILANG
) => {
  try {
    const model = getGenAIModel();
    const prompt = buildWeeklyPlanPrompt(niche, targetAge, language, focusFormat);
    
    // Inject perintah anti-duplikat (Manual String Injection karena template sudah jadi string)
    const forbidden = existingTitles.length > 0 
      ? `\nIMPORTANT: DO NOT use these topics again: ${existingTitles.join(", ")}.` 
      : "";
    
    const finalPrompt = prompt + forbidden;

    const result = await model.generateContent(finalPrompt);
    
    let text = result.response.text();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
       return JSON.parse(text.substring(start, end + 1));
    }
    return [];
  } catch (error) {
    console.error("Gemini Plan Error:", error);
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

// 7. SSML
export const generateSSMLInstructions = async (fullScript: string, voiceStyle: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildSSMLPrompt(fullScript, voiceStyle);
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/^(Ini adalah|Berikut adalah|Here is|Sure|\*\*\*).*/gim, "");
    return text.trim(); 
  } catch (error) {
    return fullScript; 
  }
};

// 8. VISUAL PROMPTS
export const generateVisualPrompts = async (fullScript: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildVisualPromptsPrompt(fullScript);
    const result = await model.generateContent(prompt);
    
    let text = result.response.text();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
       return JSON.parse(text.substring(start, end + 1));
    }
    throw new Error("Format Visual Prompt Salah");
  } catch (error: any) {
    throw new Error(error.message || "Gagal menghubungi AI Visual.");
  }
};

// 9. PACKAGING
export const generatePackaging = async (topic: string, fullScript: string, targetAge: string) => {
  try {
    const model = getGenAIModel();
    const prompt = buildPackagingPrompt(topic, fullScript, targetAge);
    const result = await model.generateContent(prompt);
    return parseGeminiJson(result.response.text());
  } catch (error) {
    return null;
  }
};