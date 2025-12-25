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