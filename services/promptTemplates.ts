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

// 2. DRAFTING PROMPT (RHYTHM INJECTOR)
export const buildDraftingPrompt = (
  topic: string, 
  section: OutlineSection, 
  persona: Persona, 
  age: string, 
  lang: string, 
  doctorName: string
) => {
  const languageName = lang === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English';
  
  const pName = persona.name.toLowerCase();
  const isUrgent = persona.id === 'urgent' || pName.includes('warning') || pName.includes('tegas');
  const isIntro = section.section.toLowerCase().includes('intro');
  
  let greetingInstruction = "";
  if (isIntro) {
     greetingInstruction = isUrgent
      ? `Start with a shocking statement/question. Then, introduce yourself like "Saya ${doctorName}, dan di sini kita akan..."`
      : `Start with a friendly greeting like "Halo semuanya, saya ${doctorName}."`;
  } else {
     greetingInstruction = "NO GREETINGS. Continue the flow.";
  }

  return `
    Act as a Charismatic Medical Communicator and YouTube Scriptwriter. Your goal is to write a script that has a natural, human-like rhythm for a Voice Over.
    
    CONTEXT:
    - Topic: "${topic}"
    - Section to Write: "${section.section}"
    - Key Points: ${section.points.join(', ')}
    - Audience: ${age}
    - Language: ${languageName}
    
    IDENTITY & TONE:
    - Speaker Name: "${doctorName}"
    - Speaking Style: "${persona.name}" (${persona.description}).
    - CRITICAL: Your name is ${doctorName}. Do NOT introduce yourself as "${persona.name}".
    
    RHYTHM WRITING RULES (MUST FOLLOW):
    1.  **VARY SENTENCE LENGTH:** Mix short, punchy sentences (3-7 words) with longer, more complex sentences (15-20 words).
    2.  **CONVERSATIONAL CONNECTORS:** Use natural Indonesian connectors like "Nah, ternyata...", "Jadi, intinya...".
    3.  **ACTIVE VOICE:** Use active verbs like "Kita akan MEMBONGKAR...".
    4.  **FORMAT:** Plain text paragraphs only. NO MARKDOWN (**), NO VISUAL CUES ([Visual]).
    
    ${greetingInstruction}
    
    Task: Write the full narration for this section. Make it sound like a real, engaging doctor on a podcast, NOT a robot listing facts.
  `;
};

// 3. WEEKLY PLAN PROMPT
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

// 4. IMAGE PROMPT
export const buildImagePrompt = (doctor: any, topic: string, hook: string) => {
  return `
    Act as an Expert AI Prompt Engineer for Midjourney v6.
    We need a character asset for a video overlay. The character MUST look authentically INDONESIAN.
    
    Doctor Profile:
    - Name: ${doctor.name}
    - Gender: ${doctor.gender}
    - Appearance: ${doctor.appearance}
    
    COMPOSITION RULES:
    1. **Shot:** Medium Shot (Waist-Up). Sitting pose.
    2. **Background:** SOLID CHROMA KEY GREEN BACKGROUND.
    3. **Lighting:** Cinematic Podcast Lighting with STRONG RIM LIGHT.
    4. **Face:** Looking directly at camera.
    
    Keywords: "South East Asian, Indonesian, Sawo Matang Skin, Chroma Key, Rim Lighting, 8k, Photorealistic, --ar 16:9"
    
    Output ONLY the prompt text in English.
  `;
};

// 5. ENHANCE PROMPT
export const buildEnhancePrompt = (description: string) => {
  return `
    Act as an AI Visual Prompter.
    Translate this simple Indonesian description of a doctor into a detailed, high-quality English visual description suitable for AI Image Generation.
    Input (Indonesian): "${description}"
    Requirements: Translate to English, add professional details, keep core features, add "High quality, 8k, photorealistic".
    Output ONLY the text.
  `;
};

// 6. VOCAL DIRECTOR PROMPT (VERSI NARATIF)
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

// 7. STORYBOARD DIRECTOR PROMPT (BARU)
export const buildVisualPromptsPrompt = (fullScript: string) => {
  return `
    Act as a professional Video Director and AI Prompt Engineer for a medical education YouTube channel.
    
    Your input is a full Indonesian voice-over script.
    Your task is to create a visual storyboard by breaking down the script into logical scenes and generating a corresponding B-roll image prompt for each scene.
    
    Script:
    """
    ${fullScript}
    """
    
    INSTRUCTIONS:
    1.  **Break Down Script:** Split the script into small, logical scenes (usually 1-3 paragraphs per scene).
    2.  **Generate Prompts:** For each scene, create a highly detailed, cinematic text-to-image prompt (for Midjourney/Flux) that visually represents the spoken text.
        - Use concepts like "Medical animation of...", "Diagram showing...", "Close up shot of...", "Stock photo style of a person feeling...".
        - Prompts MUST be in English.
    3.  **Format:** Output ONLY a valid JSON array. Each object must have "scene_text" and "image_prompt".
    
    Example Output:
    [
      {
        "scene_text": "Apakah Anda pernah dengar? Masturbasi itu bikin buta. Atau bikin mandul? Bahkan bisa merusak otak?",
        "image_prompt": "Cinematic close up, anxious person's face in dark room, illuminated by phone screen showing scary myths, worried expression, hyper-realistic, 8k, --ar 16:9"
      },
      {
        "scene_text": "Seringkali, ini adalah sinyal peringatan serius dari tubuhmu. Itu bisa berarti ada masalah pada pembuluh darah halus...",
        "image_prompt": "3D medical animation of human circulatory system, highlighting constricted blood vessels in the pelvic area, red and blue arteries, scientific diagram, professional, clean background, 8k"
      }
    ]
  `;
};