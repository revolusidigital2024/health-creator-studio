import { VideoDuration, Persona, OutlineSection } from "../types";

// 1. OUTLINE PROMPT (TARGET 8+ MENIT)
export const buildOutlinePrompt = (topic: string, niche: string, age: string, lang: string) => {
  return `
    Act as a YouTube Content Strategist for a Long-Form Health Channel.
    Create a detailed script outline for an 8-12 minute video.
    
    Topic: "${topic}"
    Niche: ${niche}
    Audience: ${age}
    Language: ${lang}
    
    STRUCTURE REQUIREMENT (Detailed Deep Dive):
    1. **Hook & Problem Agitation:** Start with a strong hook (0-60s). Relate to pain points.
    2. **Deep Dive 1 (The Root Cause/Myth):** First major point. Scientific explanation.
    3. **Deep Dive 2 (The Mechanism):** How it affects the body. Use analogies.
    4. **Deep Dive 3 (The Consequence):** What happens if ignored? (Real life example).
    5. **Actionable Solution A:** First practical step.
    6. **Actionable Solution B:** Second practical step.
    7. **Bonus Insight/Secret:** Underrated tip (Retention booster).
    8. **Conclusion & CTA:** Summary and strong call to action.

    Return ONLY JSON structure:
    {
      "title": "Clickbait Title",
      "hook": "First 10 seconds hook script",
      "outline": [
        { "section": "Intro & Agitation", "points": ["Hook the viewer", "State the problem", "Promise a solution"] },
        { "section": "Understanding the Root Cause", "points": ["Common myth", "Scientific reality", "Data/Study"] },
        { "section": "The Hidden Mechanism", "points": ["Anatomy explanation", "Simple analogy", "Why it happens"] },
        { "section": "The Risks", "points": ["Short term effects", "Long term danger", "Patient story example"] },
        { "section": "Solution Step 1: Diet/Habit", "points": ["What to do", "How to do it", "Why it works"] },
        { "section": "Solution Step 2: Exercise/Action", "points": ["Step by step guide", "Common mistakes", "Expected result"] },
        { "section": "Doctor's Secret Hack", "points": ["Bonus tip", "Prevention advice"] },
        { "section": "Conclusion", "points": ["Recap main points", "Final encouragement", "Subscribe CTA"] }
      ]
    }
  `;
};

// 2. DRAFTING PROMPT (FIXED IDENTITY & HUMANIZER)
export const buildDraftingPrompt = (
  topic: string, 
  section: OutlineSection, 
  persona: Persona, 
  age: string, 
  lang: string, 
  doctorName: string
) => {
  const languageName = lang === 'id' ? 'Indonesian (Spoken/Conversational)' : 'English (Spoken/Conversational)';
  
  // FIX DETEKTOR INTRO: Lebih sensitif
  const secName = section.section.toLowerCase();
  const isIntro = secName.includes('intro') || secName.includes('hook') || secName.includes('opening') || secName.includes('sapaan') || secName.includes('1');
  
  let greetingInstruction = "";
  if (isIntro) {
     // PAKSA KENALAN DI SINI
     greetingInstruction = `
      **MANDATORY INTRO RULE:**
      1. Start with the HOOK immediately (1-2 sentences shocking fact/question).
      2. THEN, introduce yourself: "Saya ${doctorName}..."
      3. State your authority/empathy: "Saya sering dapat pertanyaan ini dari pasien..."
      4. Promise the solution.
     `;
  } else {
     greetingInstruction = "**NO GREETINGS:** Do NOT introduce yourself again. Continue the flow naturally from previous section.";
  }

  return `
    You are ${doctorName}, a charismatic medical doctor hosting a YouTube channel.
    Your goal is to write a script that sounds like a HUMAN talking to a friend, NOT a robot reading a textbook.
    
    CONTEXT:
    - Topic: "${topic}"
    - Section: "${section.section}"
    - Key Points: ${section.points.join(', ')}
    - Audience: ${age}
    - Language: ${languageName}
    
    IDENTITY & TONE:
    - **NAME:** ${doctorName} (Use this name!)
    - **STYLE:** ${persona.name} (${persona.description || persona.voiceStyle})
    
    **HUMANIZER WRITING RULES (WAJIB DIPATUHI):**
    1.  **GAYA BAHASA:** Gunakan Bahasa Indonesia yang luwes, mengalir, dan enak didengar (Spoken Style).
        -   Gunakan partikel percakapan: "Lho", "Kok", "Nah", "Kan", "Gini...".
        -   Hindari kata kaku: "Adalah", "Merupakan", "Oleh karena itu". Ganti dengan: "Itu artinya...", "Makanya...".
    2.  **RITME:** Campur kalimat pendek (3-5 kata) untuk penekanan, dan kalimat sedang untuk penjelasan. Jangan bikin paragraf tembok.
    3.  **SAPAAN:** Gunakan "Anda" atau "Teman-teman" (sesuai gaya ${persona.name}).
    4.  **FORMAT:** Plain text paragraphs only. No markdown (**), no visual cues ([Visual]).
    
    ${greetingInstruction}
    
    Task: Write the full narration for this section. Make it "daging" (valuable) but "renyah" (easy to digest).
  `;
};

// ... (Sisa file SAMA PERSIS, tidak perlu diubah) ...
export const buildWeeklyPlanPrompt = (niche: string, targetAge: string, lang: string, focusFormat?: string) => {
  const languageName = lang === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English';
  let instruction = "";
  if (focusFormat) {
      instruction = `Create a 5-day content calendar where EVERY DAY focuses on the format: "${focusFormat}". Ensure topics are varied.`;
  } else {
      instruction = `
      The content mix must be STRICTLY EDUCATIONAL & MEDICAL:
      - Day 1: Medical Myth Busting
      - Day 2: Clinical Case Study / Bedah Kasus (DO NOT use "Inspirational Story")
      - Day 3: Medical Hack / Tips
      - Day 4: Deep Dive / Explanation
      - Day 5: Q&A / FAQ`;
  }
  return `
    Act as a generic professional Doctor / Medical Expert specializing in "${niche}" for audience "${targetAge}".
    Create a 5-day content calendar (Monday to Friday).
    ${instruction}
    Language: ${languageName}.
    Tone: Professional, Empathetic, Scientific but easy to understand.
    Output ONLY valid JSON array without markdown. Structure:
    [ { "day": "Senin", "type": "${focusFormat || 'Mitos'}", "title": "...", "hook": "..." }, ... ]
  `;
};

export const buildImagePrompt = (doctor: any, topic: string, hook: string) => {
  return `
    Act as an Expert AI Prompt Engineer for Midjourney v6.
    We need a character asset for a video overlay. The character MUST look authentically INDONESIAN.
    Doctor Profile:
    - Name: ${doctor.name}
    - Gender: ${doctor.gender}
    - Appearance: ${doctor.appearance} (CRITICAL: Must have South East Asian / Indonesian features, Sawo Matang skin tone)
    - Outfit: ${doctor.outfit}
    COMPOSITION RULES (Overlay Optimized):
    1. **Shot:** Medium Shot (Waist-Up). Sitting pose like in a Podcast.
    2. **Background:** SOLID CHROMA KEY GREEN BACKGROUND (Hex #00FF00). Flat lighting on background.
    3. **Lighting:** Cinematic Podcast Lighting with STRONG RIM LIGHT (Backlight) for easy separation.
    4. **Face:** Looking directly at camera. Authentic Indonesian facial structure.
    5. **Equipment:** Professional Podcast Microphone on a boom arm (not covering face).
    Keywords: "South East Asian, Indonesian, Sawo Matang Skin, Chroma Key Green Background, Rim Lighting, Sharp Focus, 8k, Photorealistic, --ar 16:9"
    Output ONLY the prompt text in English.
  `;
};

export const buildEnhancePrompt = (description: string) => {
  return `
    Act as an AI Visual Prompter.
    Translate this simple Indonesian description of a doctor into a detailed, high-quality English visual description suitable for AI Image Generation (Midjourney/Flux).
    Input (Indonesian): "${description}"
    Requirements: Translate to English, add professional details (lighting, texture), keep core features, add "High quality, 8k, photorealistic".
    Output ONLY the text.
  `;
};

export const buildSSMLPrompt = (fullScript: string, voiceStyle: string) => {
  return `
    Act as a professional Voice Over Director.
    Your job is to take a raw script and add "Directorial Notes" inside the text to guide the voice actor.
    
    Script:
    """
    ${fullScript}
    """
    
    Voice Style: "${voiceStyle}" (e.g., 'Santai & Empati', 'Tegas & Cepat').
    
    INSTRUCTIONS (MUST FOLLOW):
    1.  **Insert notes in parentheses ( )**: Add instructions for tone, speed, emotion, or pauses.
    2.  **Be Descriptive**: Instead of "<break time='1s'>", write "(jeda 1 detik, tarik napas)".
    3.  **Emotion**: Add emotion cues like "(nada sedih)", "(suara bergetar)", "(antusias)".
    4.  **Emphasis**: If a word needs stress, CAPITALIZE it. e.g., "Ini SANGAT penting."
    5.  **Language**: Write the instructions in Indonesian (since the script is Indonesian).
    
    Example Output:
    "(Suara tegas, tempo cepat) JANGAN LAGI SAKITI DIRI SENDIRI! (jeda sejenak, tarik napas dalam) Rasa malu yang membakar..."
    
    Task: Rewrite the full script with these directorial notes embedded naturally.
  `;
};

export const buildVisualPromptsPrompt = (fullScript: string) => {
  return `
    You are a Visual Director for a premium medical documentary channel.
    Your goal is to create a B-Roll storyboard that is visually stunning, scientific, and emotionally resonant.
    
    VISUAL STYLE GUIDE:
    1.  **The "Inner Universe" (3D Medical Animation):** Visualize the body's interior like a sci-fi landscape.
    2.  **Cinematic Human Emotion:** Use subjects to depict symptoms, but make it CINEMATIC and ARTISTIC.
    3.  **Macro & Clinical Precision:** Extreme close-ups of instruments or natural elements.

    TASK:
    Analyze the script and return a JSON array of visual scenes.
    Format: [{"scene_text": "Segment of script", "image_prompt": "Midjourney prompt..."}]

    Script: ${fullScript}
  `;
};

export const buildPackagingPrompt = (topic: string, fullScript: string, targetAge: string) => {
  return `
    You are a world-class YouTube Strategist & SEO Expert.
    Your goal is to maximize CTR.
    
    Context:
    - Topic: "${topic}"
    - Audience: "${targetAge}"
    - Script Summary: "${fullScript.slice(0, 500)}..."
    
    TASK 1: VIRAL TITLES (Indonesian, <100 chars)
    TASK 2: SEO DESCRIPTION (Indonesian)
    TASK 3: SEO TAGS (Max 500 chars)
    TASK 4: THUMBNAIL STRATEGY (2 Options)
    - Overlay Text: Max 3-4 words. PROVOCATIVE (e.g. "AWAS MANDUL!", "STOP SEKARANG!").
    
    OUTPUT JSON FORMAT ONLY:
    {
      "titles": ["..."],
      "description": "...",
      "hashtags": ["..."],
      "tags": "...",
      "thumbnails": [
        { "assembly_instructions": "...", "text": "...", "background_prompt": "..." },
        { "assembly_instructions": "...", "text": "...", "background_prompt": "..." }
      ]
    }
  `;
};