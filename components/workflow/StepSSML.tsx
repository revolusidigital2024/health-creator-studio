import React, { useState, useEffect } from 'react';
import { ContentIdea, Persona } from '../../types';
import { generateSSMLInstructions } from '../../services/geminiService';
import { SlidersHorizontal, Loader2, Copy, ArrowLeft, CheckCircle2, Mic, RefreshCw, BotMessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  selectedPersona: Persona;
  onBack: () => void;
  onNext: () => void; // Prop diubah dari onSave menjadi onNext
  onAnalysisComplete: (script: string) => void;
}

export const StepSSML: React.FC<Props> = ({ 
  blueprint, selectedPersona, onBack, onNext, onAnalysisComplete 
}) => {
  const initialScript = blueprint.ssmlScript || blueprint.outline?.map(sec => sec.scriptSegment || '').join('\n\n') || '';
  
  const [directedScript, setDirectedScript] = useState(initialScript);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (initialScript && !initialScript.includes('(') && !loading) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const rawScript = blueprint.outline?.map(sec => sec.scriptSegment || '').join('\n\n') || '';
      if (!rawScript) {
        alert("Naskah kosong.");
        setLoading(false);
        return;
      }
      const result = await generateSSMLInstructions(rawScript, selectedPersona.voiceStyle);
      setDirectedScript(result); 
      onAnalysisComplete(result);
    } catch (e) {
      alert("Gagal menganalisis. Cek API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSSML = () => {
    navigator.clipboard.writeText(directedScript);
    alert('✅ Naskah Sutradara berhasil disalin!');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
       
       <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg sticky top-4 z-40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md"><Mic size={20} /></div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vocal Director</p>
                 <p className="font-bold text-slate-800 text-sm">Instruksi Suara & Emosi</p>
              </div>
           </div>
           <div className="flex gap-2">
             <button onClick={handleAnalyze} disabled={loading} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
               <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Analisis Ulang
             </button>
             <button onClick={handleExportSSML} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 shadow-lg">
               <Copy size={16}/> Salin Naskah
             </button>
           </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xl rounded-sm min-h-[600px] p-8 md:p-12 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm rounded-sm">
               <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
               <p className="text-sm font-bold text-slate-500 animate-pulse">AI sedang menjadi sutradara vokal Anda...</p>
               <p className="text-xs text-slate-400 mt-2">Menambahkan jeda, intonasi, dan emosi.</p>
            </div>
          )}

          {!loading && !directedScript ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
               <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center"><SlidersHorizontal size={40} className="text-slate-300" /></div>
               <h3 className="text-lg font-bold text-slate-600">Naskah Kosong</h3>
               <p className="text-sm text-slate-400 max-w-sm">Klik tombol di bawah untuk memulai analisis vokal.</p>
               <button onClick={handleAnalyze} disabled={loading} className="mt-4 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl flex items-center gap-3">
                 <SlidersHorizontal size={18} /> Analisis Ritme Vokal
               </button>
            </div>
          ) : (
            <textarea
              className="w-full h-[600px] resize-none outline-none font-serif text-lg leading-loose text-slate-800 p-4 bg-transparent placeholder:text-slate-300 border-2 border-dashed border-transparent focus:border-emerald-200 rounded-xl"
              value={directedScript}
              onChange={(e) => setDirectedScript(e.target.value)}
              placeholder="Naskah kosong..."
            />
          )}
          
          {!loading && directedScript && (
             <div className="absolute top-4 right-8 text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
               💡 Tips: Teks dalam <strong>(kurung)</strong> adalah instruksi. Edit sesuka hati.
             </div>
          )}
        </div>
        
       <div className="flex justify-center gap-4 pt-4">
         <button onClick={onBack} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 flex items-center gap-2">
           <ArrowLeft size={18} /> Kembali
         </button>
         <button 
           onClick={onNext} // Menggunakan onNext
           className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl flex items-center gap-3 transition-all hover:scale-105"
         >
           Lanjut ke Export SSML <BotMessageSquare size={18} />
         </button>
       </div>
    </div>
  );
};