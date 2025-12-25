import React, { useState, useEffect } from 'react';
import { ContentIdea, Persona } from '../../types';
import { Loader2, Copy, ArrowLeft, CheckCircle2, BotMessageSquare, Check, ExternalLink, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  selectedPersona: Persona;
  onBack: () => void;
  onFinish: () => void;
}

interface SSMLChunk {
  id: number;
  ssml: string;
  charCount: number;
}

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={cn("px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md", copied ? "bg-emerald-500 text-white" : "bg-blue-600 text-white hover:bg-blue-500")}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Tersalin!' : 'Salin Kode'}
    </button>
  );
};

export const StepExport: React.FC<Props> = ({ blueprint, onBack, onFinish }) => {
  const [chunks, setChunks] = useState<SSMLChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const MAX_CHUNK_SIZE = 2800; // Turunkan dikit biar aman

  useEffect(() => {
    if (chunks.length === 0) {
      handleTranscode();
    }
  }, [blueprint]); 

  const handleTranscode = () => {
    setLoading(true);
    
    // Ambil naskah dari SSML step sebelumnya
    const directedScript = blueprint.ssmlScript || blueprint.outline?.map(sec => sec.scriptSegment || '').join('\n\n') || '';
    
    if (!directedScript) {
      setLoading(false);
      return;
    }
    
    // --- LOGIC KONVERSI BARU (REGEX SAKTI) ---
    let processedScript = directedScript;

    // 1. JEDA (BREAKS) - Tangkap berbagai variasi bahasa
    processedScript = processedScript.replace(/\((?:jeda|pause|hening).*?(\d+).*?(?:detik|s|sec).*?\)/gi, '<break time="$1s"/>'); // (jeda 2 detik) -> <break time="2s"/>
    processedScript = processedScript.replace(/\((?:jeda|pause).*?panjang.*?\)/gi, '<break time="1.5s"/>'); 
    processedScript = processedScript.replace(/\((?:jeda|pause).*?(?:singkat|sebentar|pendek).*?\)/gi, '<break time="500ms"/>');
    processedScript = processedScript.replace(/\((?:jeda|pause).*?\)/gi, '<break time="700ms"/>'); // Default jeda
    
    // 2. EMPHASIS (KAPITAL -> TAG)
    // Tangkap kata KAPITAL (minimal 3 huruf) yang bukan singkatan umum (seperti SPA, BJU)
    // Kita list dulu singkatan umum yang GAK BOLEH dikasih emphasis
    const exceptions = ["SPA", "BJU", "WHO", "BPOM", "DNA", "PDD"];
    const exceptionPattern = exceptions.join("|");
    const emphasisRegex = new RegExp(`\\b(?!(?:${exceptionPattern})\\b)([A-Z]{3,})\\b`, "g");
    
    processedScript = processedScript.replace(emphasisRegex, '<emphasis level="strong">$1</emphasis>');

    // 3. PROSODY (SPEED/TEMPO)
    // Tangkap instruksi tempo dan bungkus kalimat setelahnya (ini agak tricky, kita pake pendekatan sederhana dulu)
    // Kita ganti instruksinya jadi tag pembuka, tapi karena tag penutupnya susah ditebak, kita pake tag self-closing dummy atau biarkan manual user di AI Studio.
    // TAPI, Google TTS AI Studio kadang lebih pinter baca konteks.
    // Jadi strategi kita: Hapus instruksi naratif sisa biar bersih, TAPI sisakan break.

    // 4. BERSIH-BERSIH SISA INSTRUKSI (EMOSI, NADA)
    // Kita hapus instruksi dalam kurung yang BELUM jadi tag SSML.
    // Kenapa? Karena Google TTS Text-to-Speech (bukan Gemini) kadang bingung baca teks dalam kurung.
    // Kecuali kalau Abang pake ElevenLabs, instruksi teks malah bagus.
    // Tapi karena judulnya SSML, kita bersihkan.
    processedScript = processedScript.replace(/\(.*?\)/g, ''); 

    // 5. NORMALISASI SPASI
    processedScript = processedScript.replace(/\s+/g, ' ').trim();

    // --- CHUNKING ---
    const paragraphs = processedScript.split(/(?=<break)/); // Pecah berdasarkan break biar rapi
    // Kalau gak ada break, pecah per kalimat (.)
    const splitPoints = paragraphs.length > 1 ? paragraphs : processedScript.split('. ');

    const finalChunks: SSMLChunk[] = [];
    let currentChunk = "";
    let chunkId = 1;

    for (const p of splitPoints) {
      // Tambahkan titik kalau hilang gara-gara split
      const segment = p.trim().endsWith('>') ? p : p + '. ';
      
      if ((currentChunk.length + segment.length) > MAX_CHUNK_SIZE) {
        if (currentChunk.trim()) {
          finalChunks.push({ id: chunkId, ssml: `<speak>\n${currentChunk}\n</speak>`, charCount: currentChunk.length });
          chunkId++;
        }
        currentChunk = segment;
      } else {
        currentChunk += segment;
      }
    }
    if (currentChunk.trim()) {
      finalChunks.push({ id: chunkId, ssml: `<speak>\n${currentChunk}\n</speak>`, charCount: currentChunk.length });
    }

    setChunks(finalChunks);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
       <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg sticky top-4 z-40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                <BotMessageSquare size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SSML Transcoder</p>
                 <p className="font-bold text-slate-800 text-sm">Naskah Siap Jadi Suara</p>
              </div>
           </div>
           <a href="https://aistudio.google.com/generate-speech" target="_blank" className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-600 shadow-lg">
             Buka Google AI Studio <ExternalLink size={14} />
           </a>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl min-h-[600px] p-8 md:p-12 relative">
          
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
               <Loader2 className="animate-spin text-emerald-600" size={48} />
               <h3 className="text-lg font-bold text-slate-600 mt-4">Mengonversi Naskah...</h3>
               <p className="text-sm text-slate-400 max-w-md">
                 AI sedang memecah naskah dan mengubah instruksi vokal menjadi kode SSML.
               </p>
            </div>
          ) : chunks.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
               <h3 className="text-lg font-bold text-slate-600">Naskah Tidak Ditemukan</h3>
               <button onClick={handleTranscode} disabled={loading} className="mt-4 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl flex items-center gap-3">
                 {loading ? <><Loader2 className="animate-spin" /> Mengonversi...</> : <><SlidersHorizontal size={18} /> Konversi Naskah</>}
               </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-center font-bold text-slate-500 text-sm">Naskah berhasil dipecah menjadi {chunks.length} bagian.</h3>
              {chunks.map((chunk) => (
                <div key={chunk.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm">Bagian {chunk.id}</h4>
                      <p className="text-xs text-slate-400">{chunk.charCount} / {MAX_CHUNK_SIZE} Karakter</p>
                    </div>
                    <CopyButton textToCopy={chunk.ssml} />
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mb-4">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(chunk.charCount / MAX_CHUNK_SIZE) * 100}%` }}/>
                  </div>
                  <pre className="bg-white p-4 rounded-xl text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-100">
                    <code>{chunk.ssml}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
        
       <div className="flex justify-center gap-4 pt-4">
         <button onClick={onBack} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 flex items-center gap-2">
           <ArrowLeft size={18} /> Kembali
         </button>
         <button onClick={onFinish} className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 flex items-center gap-3 transition-all">
           <CheckCircle2 size={18} /> Selesai
         </button>
       </div>
    </div>
  );
};