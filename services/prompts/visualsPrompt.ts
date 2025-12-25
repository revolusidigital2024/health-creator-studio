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