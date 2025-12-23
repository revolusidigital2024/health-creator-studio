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

export const generateWeeklyPlan = async (niche: string, targetAge: string, language: string = 'id') => {
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