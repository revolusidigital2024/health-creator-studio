export const buildWeeklyPlanPrompt = (niche: string, targetAge: string, lang: string, focusFormat?: string, existingTitles: string[] = []) => {
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

  const forbidden = existingTitles.length > 0 
      ? `\nCONTEXT: The user has ALREADY created content on these topics: [${existingTitles.join(", ")}]. DO NOT suggest these topics again. Find NEW angles or DIFFERENT sub-topics.` 
      : "";

  return `
    Act as a generic professional Doctor / Medical Expert specializing in "${niche}" for audience "${targetAge}".
    Create a 5-day content calendar (Monday to Friday).
    ${forbidden}
    ${instruction}
    Language: ${languageName}.
    Tone: Professional, Empathetic, Scientific but easy to understand.
    Output ONLY valid JSON array without markdown. Structure:
    [ { "day": "Senin", "type": "${focusFormat || 'Mitos'}", "title": "...", "hook": "..." }, ... ]
  `;
};