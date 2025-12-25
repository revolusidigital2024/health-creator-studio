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