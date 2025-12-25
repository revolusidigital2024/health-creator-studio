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
      "title": "A compelling, viral-ready title",
      "hook": "A 10-second opening script to grab attention",
      "outline": [
        { "section": "Introduction", "points": ["Hook", "Problem Statement", "What we will cover"] },
        { "section": "Deep Dive Section 1", "points": ["Detailed Point 1", "Detailed Point 2", "Detailed Point 3"] },
        { "section": "Deep Dive Section 2", "points": ["Detailed Point 1", "Detailed Point 2", "Detailed Point 3"] },
        { "section": "Deep Dive Section 3", "points": ["Detailed Point 1", "Detailed Point 2", "Detailed Point 3"] },
        { "section": "Actionable Steps", "points": ["Step 1", "Step 2", "Step 3"] },
        { "section": "Summary & CTA", "points": ["Recap", "Call to Action"] }
      ]
    }
  `;
};

// 2. DRAFTING PROMPT (RHYTHM INJECTOR)
export const buildDraftingPrompt = (
  topic: string, 
  section: OutlineSection, 
  persona: Persona, 
  age: string, 
  lang: string, 
  doctorName: string
) => {
  const languageName = lang === 'id' ? 'Indonesian (Spoken/Conversational)' : 'English (Spoken/Conversational)';
  const isIntro = section.section.toLowerCase().includes('introduction') || section.section.toLowerCase().includes('intro');

  return `
    You are ${doctorName}, a medical doctor writing a script for a YouTube video.
    
    CONTEXT:
    - Topic: "${topic}"
    - Section: "${section.section}"
    - Key Points: ${section.points.join(', ')}
    - Audience: ${age}
    - Language: ${languageName}
    - Persona: ${persona.name} (${persona.description})

    STRICT RULES:
    1.  **INTRODUCTION LOGIC:**
        ${isIntro 
          ? `YES, this is the Intro. Start with: "Halo, saya Dokter ${doctorName}..." then hook the audience.` 
          : `NO, this is NOT the intro. DO NOT introduce yourself. DO NOT say "Halo" or "Welcome back". Dive straight into the explanation.`}

    2.  **HUMAN & CONVERSATIONAL TONE:**
        - **Stop sounding like a robot.** Do not use stiff formal Indonesian (Baku).
        - Use "Bahasa Gaul yang Sopan" (Polite Casual).
        - Use particles like "lho", "kok", "sih", "nah", "kan" to sound natural.
        - BAD: "Hal ini mengindikasikan bahwa..." -> GOOD: "Nah, ini artinya..."
        - BAD: "Anda disarankan untuk..." -> GOOD: "Saran saya, coba deh..."
        - BAD: "Berikut adalah penjelasannya." -> GOOD: "Gini penjelasannya..."
        - Use "Saya" for "I" and "Anda" for "You".

    3.  **OUTPUT FORMAT:**
        - Plain text only. No markdown (**bold**), no [Scene], no "Title:". Just the spoken words.
  `;
};

// 3. WEEKLY PLAN PROMPT
export const buildWeeklyPlanPrompt = (niche: string, targetAge: string, lang: string, focusFormat?: string) => {
  const languageName = lang === 'id' ? 'Indonesian' : 'English';
  return `
    Create a 5-day health content calendar for niche: "${niche}" targeting "${targetAge}".
    Language: ${languageName}.
    Focus Format: ${focusFormat || 'Mixed formats (Myths, Tips, Cases)'}.
    
    Return a JSON array of 5 objects:
    [{"day": "Day Name", "type": "Topic Category", "title": "Catchy Title", "hook": "Opening hook line"}]
  `;
};

// 4. IMAGE PROMPT
export const buildImagePrompt = (doctor: any, topic: string, hook: string) => {
  return `
    Midjourney prompt: Professional ${doctor.gender} doctor named ${doctor.name}, ${doctor.appearance}, wearing ${doctor.outfit}. 
    Standing in a modern high-end clinic, cinematic lighting, photorealistic, 8k, bokeh background.
  `;
};

// 5. ENHANCE PROMPT
export const buildEnhancePrompt = (description: string) => {
  return `Improve this character description into a professional Midjourney visual prompt: "${description}". Output ONLY the prompt.`;
};

// 6. VOCAL DIRECTOR PROMPT (EMOTIONAL ARC PROFILER)
export const buildSSMLPrompt = (fullScript: string, voiceStyle: string) => {
  return `
    You are an expert YouTube Vocal Director and Script Coach. Your task is to rewrite a script with detailed, narrative vocal cues.

    **YOUR THOUGHT PROCESS (Chain-of-Thought):**
    1.  **Analyze the Narrative Arc:** First, read the ENTIRE script below. Identify the emotional journey. Where does it start (e.g., mysterious, anxious)? Where is the turning point (e.g., factual, confident)? How does it end (e.g., empowering, encouraging)?
    2.  **Plan the Vocal Strategy:** Based on the arc, plan your vocal cues. The intro should build tension. The middle should be clear and authoritative. The conclusion should be warm and inspiring. Don't just add random pauses.
    3.  **Execute the Rewrite:** Now, rewrite the script, inserting your planned cues.

    **RULES for Cues:**
    -   Place cues in parentheses \`()\`.
    -   Be highly descriptive: "(nada sedikit prihatin, tempo melambat)", "(nada berubah jadi optimis, lebih cepat)".
    -   Insert cues **INSIDE sentences** for pauses: "Ini penting (jeda singkat) karena..."
    -   Use **CAPITALIZATION** for words that need strong emphasis.

    Here is the script to process:
    """
    ${fullScript}
    """
  `;
};

// 7. STORYBOARD DIRECTOR PROMPT
export const buildVisualPromptsPrompt = (fullScript: string) => {
  return `
    You are a Visual Director for a premium medical documentary channel.
    Your goal is to create a B-Roll storyboard that is visually stunning, scientific, and emotionally resonant.
    
    **VISUAL STYLE GUIDE:**

    1.  **The "Inner Universe" (3D Medical Animation):**
        - Visualize the body's interior like a sci-fi landscape.
        - Examples: Red blood cells rushing through a vein (Cinematic), Neurons firing (Electric blue), DNA strands rotating (Gold/Silver).
        - Style: Octane Render, Unreal Engine 5, 8k, Hyper-detailed.

    2.  **Cinematic Human Emotion (High-End):**
        - Use human subjects to depict symptoms or feelings, but make it CINEMATIC and ARTISTIC.
        - **AVOID:** Cheesy, generic stock photos with white backgrounds or fake smiles.
        - **PREFER:** Dramatic lighting, moody atmosphere, genuine expressions, shallow depth of field (bokeh).
        - Example (Pain): Silhouette of a person holding their head in a dark room, dramatic rim lighting.
        - Example (Peace): Close-up of a face relaxing, soft warm sunlight, peaceful expression.

    3.  **Macro & Clinical Precision:**
        - Extreme close-ups of medical instruments (Scalpel, Stethoscope) with bokeh.
        - Macro shots of natural elements (Water, Fruits, Herbs) for nutrition topics.
        - Clean, sterile, futuristic lab backgrounds (Blurred).

    **TASK:**
    Analyze the script and return a JSON array of visual scenes.
    Format: [{"scene_text": "Segment of script", "image_prompt": "Midjourney prompt..."}]

    Script: ${fullScript}
  `;
};

// 8. PACKAGING PROMPT (THUMBNAIL ASSEMBLY LINE EDITION)
export const buildPackagingPrompt = (topic: string, fullScript: string, targetAge: string) => {
  return `
    You are a world-class YouTube Strategist & Graphic Designer for a medical channel. Your goal is to design a high-CTR thumbnail concept.
    
    Context:
    - Topic: "${topic}"
    - Audience: "${targetAge}"
    - Script Summary: "${fullScript.slice(0, 500)}..."
    
    **TASK 1: VIRAL TITLES (Indonesian)**
    Generate 5 titles under 100 characters using psychological hooks.

    **TASK 2: SEO DESCRIPTION & TAGS (Indonesian)**
    Write a 3-paragraph SEO description, 15 hashtags, and 20 comma-separated tags (under 500 chars total).

    **TASK 3: THUMBNAIL ASSEMBLY INSTRUCTIONS (2 Options)**
    For each option, provide a plan for a human designer. Assume they already have PNG assets of the doctor (e.g., Doctor_Smiling.png, Doctor_Serious.png).
    -   **Assembly Instructions (Indonesian):** Tell the designer how to compose the thumbnail. e.g., "Gunakan aset 'Dokter Pose Serius' di kanan. Beri efek glow kuning. Di sebelah kiri, letakkan gambar B-Roll dari prompt di bawah ini."
    -   **Overlay Text (Indonesian):** Max 3-4 provocative words. e.g., "AWAS MANDUL?", "STOP SEKARANG!".
    -   **Background Prompt (English):** Midjourney prompt for the BACKGROUND/B-ROLL image ONLY. DO NOT include the doctor in this prompt. e.g., "dramatic red background, abstract medical symbols, cinematic lighting, --ar 16:9".
    
    **OUTPUT JSON FORMAT ONLY:**
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