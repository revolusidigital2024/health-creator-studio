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
    1.  **NO FILLER TEXT:** DO NOT write any introductory text, titles, or meta-commentary like 'Berikut adalah naskah...' or '**Gaya Suara...**'. Start DIRECTLY with the first vocal cue in parentheses.
    2.  **NARRATIVE CUES:** Insert descriptive notes in parentheses \`( )\` before the line it applies to. Explain the TONE, TEMPO, and EMOTION.
    3.  **EMPHASIS:** To emphasize a word, write it in ALL CAPS. Do NOT use asterisks \`**\`.
    4.  **PAUSES:** Integrate pauses naturally into the cues, like \`(jeda sejenak)\`.
    5.  **LANGUAGE:** All directorial notes must be in Indonesian.
    
    Example Output:
    (Suara tegas, tempo cepat) JANGAN LAGI SAKITI DIRI SENDIRI! (jeda sejenak, tarik napas dalam) Rasa malu yang membakar...
    (Nada berubah menjadi lebih cerah, ramah, dan profesional) Halo, saya Dr. Sherly. Masalah seperti ini sebenarnya JAUH lebih sering terjadi...
    
    Task: Rewrite the full script below with these directorial notes embedded naturally. The output must be clean plain text.
  `;
};