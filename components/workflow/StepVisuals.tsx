import React, { useState, useEffect } from 'react';
import { ContentIdea, VisualScene } from '../../types';
import { generateVisualPrompts } from '../../services/geminiService';
import { Film, Loader2, Copy, ArrowLeft, Check, Sparkles, RefreshCw, FileJson } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  onBack: () => void;
  onNext: () => void;
  // TAMBAHAN: Fungsi buat nyimpen data ke Project Database
  onSaveData: (scenes: VisualScene[]) => void;
}

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={cn("px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all border", copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400")}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Tersalin' : 'Salin'}
    </button>
  );
};

export const StepVisuals: React.FC<Props> = ({ blueprint, onBack, onNext, onSaveData }) => {
  // Load data awal dari blueprint jika sudah ada (biar gak generate ulang)
  const [scenes, setScenes] = useState<VisualScene[]>(blueprint.visualScenes || []);
  const [loading, setLoading] = useState(false);
  
  const fullScript = blueprint.outline?.map(sec => sec.scriptSegment || '').join('\n\n') || '';

  // Auto-Run HANYA JIKA data belum ada
  useEffect(() => {
    if (fullScript && scenes.length === 0 && !loading) {
      handleGenerate();
    }
  }, []); 

  const handleGenerate = async () => {
    if (!fullScript) {
      alert("Naskah kosong! Tidak ada yang bisa divisualisasikan.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateVisualPrompts(fullScript);
      setScenes(result);
      
      // AUTO-SAVE SETELAH GENERATE
      onSaveData(result); 

    } catch (e) {
      console.error(e);
      alert("Gagal membuat storyboard. Cek API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (scenes.length === 0) return;
    const promptsOnly = scenes.map(s => s.image_prompt);
    const jsonString = JSON.stringify(promptsOnly, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert('📦 JSON Prompts berhasil disalin ke clipboard!');
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
       
       <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg sticky top-4 z-40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md"><Film size={20} /></div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visual Director</p>
                 <p className="font-bold text-slate-800 text-sm">Storyboard & B-Roll Prompts</p>
              </div>
           </div>
           
           <div className="flex gap-2">
             {scenes.length > 0 && (
               <button 
                 onClick={handleExportJSON} 
                 className="text-xs font-bold flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
               >
                 <FileJson size={14} /> Export JSON
               </button>
             )}

             <button onClick={handleGenerate} disabled={loading} className="text-xs font-bold flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">
               <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
               {loading ? 'Meracik Visual...' : 'Buat Ulang'}
             </button>
           </div>
       </div>

       <div className="min-h-[400px]">
         {loading ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-24 bg-white rounded-2xl border border-slate-100">
               <Loader2 className="animate-spin text-emerald-600" size={48} />
               <h3 className="text-lg font-bold text-slate-600 mt-2">AI sedang membayangkan adegan...</h3>
               <p className="text-sm text-slate-400 max-w-md">Menganalisis naskah untuk membuat prompt gambar yang sesuai.</p>
            </div>
         ) : scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <Film size={48} className="text-slate-300" />
               <h3 className="text-lg font-bold text-slate-600">Belum ada Storyboard</h3>
               <button onClick={handleGenerate} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95">Buat Storyboard Sekarang</button>
            </div>
         ) : (
            <div className="space-y-6">
              {scenes.map((scene, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="md:col-span-7 p-6 bg-white border-b md:border-b-0 md:border-r border-slate-100">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 block">Scene {idx + 1} • Audio</span>
                     <p className="font-serif text-slate-700 leading-relaxed text-base">{scene.scene_text}</p>
                  </div>
                  <div className="md:col-span-5 bg-slate-50 p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-1"><Sparkles size={12}/> Visual Prompt (Midjourney)</p>
                      <p className="font-mono text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed select-all">{scene.image_prompt}</p>
                    </div>
                    <div className="flex justify-end mt-3">
                      <CopyButton textToCopy={scene.image_prompt} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
         )}
       </div>
       
       <div className="flex justify-center gap-4 pt-8 border-t border-slate-100">
         <button onClick={onBack} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 flex items-center gap-2"><ArrowLeft size={18} /> Kembali</button>
         <button onClick={onNext} className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl flex items-center gap-3 transition-all hover:scale-105">Lanjut ke Studio Vokal</button>
       </div>
    </div>
  );
};