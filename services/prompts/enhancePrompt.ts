export const buildEnhancePrompt = (description: string) => {
  return `
    Act as an AI Visual Prompter.
    Translate this simple Indonesian description of a doctor into a detailed, high-quality English visual description suitable for AI Image Generation (Midjourney/Flux).
    Input (Indonesian): "${description}"
    Requirements: Translate to English, add professional details (lighting, texture), keep core features, add "High quality, 8k, photorealistic".
    Output ONLY the text.
  `;
};