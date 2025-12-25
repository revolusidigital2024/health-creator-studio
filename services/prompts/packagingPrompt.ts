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