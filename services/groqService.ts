import Groq from "groq-sdk";
import { VideoDuration } from "../types";
import { storageService } from "./storageService";

// Helper untuk inisialisasi Groq secara dinamis
const getGroqClient = () => {
  const apiKey = storageService.getGroqKey();
  
  if (!apiKey) {
    throw new Error("API Key Groq belum diatur. Silakan ke menu Pengaturan.");
  }

  return new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Wajib true karena kita jalan di browser (React/Vite)
  });
};

export const suggestGroqTopics = async (niche: string, targetAge: string, language: string) => {
  const prompt = `Generate 5 viral video topic ideas for a health channel about "${niche}" targeting "${targetAge}". Language: ${language}. Output strictly JSON array: [{"topic": "...", "angle": "..."}]`;
  
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
    });
    const content = completion.choices[0]?.message?.content || "[]";
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Groq Error:", error);
    return [];
  }
};

export const groqOutlineAdapter = async (topic: string, age: string, niche: string, lang: string, duration: VideoDuration) => {
   const prompt = `Create a youtube video script outline for topic "${topic}" (Niche: ${niche}, Audience: ${age}). Duration: ${duration}. Language: ${lang}.
   Return ONLY JSON structure:
   {
     "title": "Clickbait Title",
     "hook": "First 3 seconds hook",
     "outline": [
       { "section": "Intro", "points": ["point 1", "point 2"] },
       { "section": "Body 1", "points": ["point 1", "point 2"] },
       { "section": "Body 2", "points": ["point 1", "point 2"] },
       { "section": "Conclusion", "points": ["CTA"] }
     ]
   }`;

   try {
     const groq = getGroqClient();
     const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-70b-8192",
     });
     const content = completion.choices[0]?.message?.content || "{}";
     return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
   } catch (error: any) {
     throw new Error(`Groq Error: ${error.message}`);
   }
};

// UPDATE BAGIAN INI (Parameter ke-4 ditambahkan: focusFormat)
export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id', focusFormat?: string) => {
  
  // Logic Prompt: Sama persis kayak Gemini, biar Groq juga pinter milih tema
  let instruction = "";
  if (focusFormat) {
      instruction = `
      Create a 5-day content calendar where EVERY DAY focuses on the format: "${focusFormat}".
      Example: If format is 'Listicle', Day 1 could be "5 Foods...", Day 2 "5 Habits...", etc.
      Make sure the topics are varied even if the format is the same.`;
  } else {
      instruction = `
      The content mix must be STRICTLY EDUCATIONAL & MEDICAL with VARIED FORMATS:
      - Day 1: Medical Myth Busting
      - Day 2: Clinical Case Study / Bedah Kasus
      - Day 3: Medical Hack / Tips
      - Day 4: Deep Dive / Explanation
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

  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "[]";
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating plan:", error);
    return [];
  }
};