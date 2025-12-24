import React, { useState, useEffect } from 'react'; // Tambah useEffect
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

// Tombol Salin Cerdas
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
  const MAX_CHUNK_SIZE = 3000;

  // --- LOGIC BARU: AUTO-TRANSCODE ---
  // Pas komponen ini pertama kali muncul, langsung jalankan konversi
  useEffect(() => {
    // Hanya jalankan jika belum ada chunks (biar gak ngulang terus)
    if (chunks.length === 0) {
      handleTranscode();
    }
  }, [blueprint]); // Trigger kalau blueprint berubah (misal dari data lama)

  const handleTranscode = () => {
    setLoading(true);
    // Naskah sutradara yang sudah ada instruksi (emosi, jeda, dll)
    const directedScript = blueprint.ssmlScript || blueprint.outline?.map(sec => sec.scriptSegment || '').join('\n\n') || '';
    
    if (!directedScript) {
      setLoading(false);
      return; // Jangan lakukan apa-apa kalau naskah kosong
    }
    
    // Logic Konversi: Naratif -> SSML
    let processedScript = directedScript;
    processedScript = processedScript.replace(/\(jeda ([\d.]+) detik\)/gi, `<break time="$1s"/>`);
    processedScript = processedScript.replace(/\(jeda singkat\)/gi, `<break time="500ms"/>`);
    processedScript = processedScript.replace(/\(jeda sejenak\)/gi, `<break time="800ms"/>`);
    // Regex diupdate biar lebih akurat (hanya huruf kapital, minimal 3)
    processedScript = processedScript.replace(/\b([A-Z]{3,})\b/g, `<emphasis level="strong">$1</emphasis>`); 
    // Hapus sisa instruksi dalam kurung
    processedScript = processedScript.replace(/\(.*?\)/g, '');
    
    // Pecah jadi Chunks
    const paragraphs = processedScript.split('\n').filter(p => p.trim() !== '');
    const finalChunks: SSMLChunk[] = [];
    let currentChunk = "";
    let chunkId = 1;

    for (const p of paragraphs) {
      if ((currentChunk.length + p.length) > MAX_CHUNK_SIZE) {
        if (currentChunk.trim()) {
          finalChunks.push({ id: chunkId, ssml: `<speak>${currentChunk}</speak>`, charCount: currentChunk.length });
          chunkId++;
        }
        currentChunk = p + '\n';
      } else {
        currentChunk += p + '\n';
      }
    }
    if (currentChunk.trim()) {
      finalChunks.push({ id: chunkId, ssml: `<speak>${currentChunk}</speak>`, charCount: currentChunk.length });
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
            // Tampilan Loading
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
               <Loader2 className="animate-spin text-emerald-600" size={48} />
               <h3 className="text-lg font-bold text-slate-600 mt-4">Mengonversi Naskah...</h3>
               <p className="text-sm text-slate-400 max-w-md">
                 AI sedang memecah naskah dan mengubah instruksi vokal menjadi kode SSML.
               </p>
            </div>
          ) : chunks.length === 0 ? (
            // Tampilan Empty State (jika naskah memang kosong)
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
               <h3 className="text-lg font-bold text-slate-600">Naskah Tidak Ditemukan</h3>
               <p className="text-sm text-slate-400 max-w-md">
                 Kembali ke langkah sebelumnya untuk menulis naskah terlebih dahulu.
               </p>
             </div>
          ) : (
            // Tampilan Hasil: List Chunks
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