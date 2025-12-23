import React, { useState } from 'react';
import { ContentIdea } from '../../types';
import { FileText, ArrowRight, Zap, AlertTriangle, Edit3, Check, Trash2, Plus, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  formatLabel: string;
  onNext: () => void;
}

export const StepOutline: React.FC<Props> = ({ blueprint, formatLabel, onNext }) => {
  // State lokal biar outline bisa diutak-atik
  const [editableOutline, setEditableOutline] = useState(blueprint.outline || []);
  const [editingSecIdx, setEditingSecIdx] = useState<number | null>(null);

  // --- HELPER: RENDER TEXT (PEMBERSIH BINTANG **) ---
  // Fungsi ini mengubah "**Teks**" menjadi <strong>Teks</strong>
  const renderCleanText = (text: string) => {
    if (!text) return "";
    
    // Pecah teks berdasarkan tanda **
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Hapus bintangnya, jadikan bold
        return <strong key={index} className="font-black text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Edit isi poin
  const handlePointChange = (secIdx: number, pointIdx: number, newVal: string) => {
    const newOutline = [...editableOutline];
    newOutline[secIdx].points[pointIdx] = newVal;
    setEditableOutline(newOutline);
  };

  // Hapus poin yang gak perlu
  const handleDeletePoint = (secIdx: number, pointIdx: number) => {
    const newOutline = [...editableOutline];
    newOutline[secIdx].points.splice(pointIdx, 1);
    setEditableOutline(newOutline);
  };

  // Tambah poin manual
  const handleAddPoint = (secIdx: number) => {
    const newOutline = [...editableOutline];
    newOutline[secIdx].points.push("Poin tambahan...");
    setEditableOutline(newOutline);
  };

  // Estimasi durasi VO (rata-rata 130 kata/menit)
  const calculateDuration = () => {
    const totalPoints = editableOutline.reduce((acc, sec) => acc + sec.points.length, 0);
    // Asumsi 1 poin = 2 kalimat = ~20 detik penjelasan
    const minutes = Math.floor((totalPoints * 20) / 60);
    const seconds = (totalPoints * 20) % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 max-w-4xl mx-auto">
       
       {/* HEADER CARD */}
       <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <FileText size={32} className="text-emerald-400" />
             </div>
             <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Struktur Naskah</span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-400 text-xs font-bold uppercase">{formatLabel}</span>
               </div>
               <h2 className="text-2xl font-bold italic leading-tight max-w-2xl text-white">"{blueprint.title}"</h2>
               <p className="text-xs text-slate-400 mt-2 font-medium">Estimasi Durasi VO: <span className="text-emerald-400">{calculateDuration()}</span></p>
             </div>
          </div>
          <button 
            onClick={onNext} 
            className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-lg shadow-emerald-900/50 hover:scale-105 relative z-10"
          >
             Lanjut ke Penulisan <ArrowRight size={18} />
          </button>
       </div>
       
       <div className="grid grid-cols-1 gap-8">
          
          {/* HOOK CARD */}
          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
             <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shrink-0">
               <Zap size={24} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">
                  Hook (3 Detik Pertama)
                </h4>
                <p className="text-lg font-black text-slate-800 italic leading-snug">
                  "{blueprint.hook}"
                </p>
             </div>
          </div>

          {/* OUTLINE EDITOR */}
          <div className="space-y-6">
             {editableOutline.map((sec, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "bg-white p-6 rounded-[2rem] border transition-all",
                    editingSecIdx === idx ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-xl" : "border-slate-200 shadow-sm"
                  )}
                >
                   {/* Section Header */}
                   <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                           {idx+1}
                         </div>
                         <h5 className="font-black text-slate-900 text-lg uppercase tracking-wide">{sec.section}</h5>
                      </div>
                      
                      <button 
                        onClick={() => setEditingSecIdx(editingSecIdx === idx ? null : idx)}
                        className={cn(
                          "text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors",
                          editingSecIdx === idx 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-50 text-slate-400 hover:text-slate-700"
                        )}
                      >
                        {editingSecIdx === idx ? <><Check size={14} /> Selesai</> : <><Edit3 size={14} /> Edit</>}
                      </button>
                   </div>

                   {/* Points List */}
                   <div className="space-y-3">
                      {sec.points.map((p, i) => (
                         <div key={i} className="flex items-start gap-3 group">
                            {/* Bullet */}
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 group-hover:bg-emerald-400 transition-colors" />
                            
                            {/* Editable Text */}
                            {editingSecIdx === idx ? (
                              <div className="flex-1 flex gap-2">
                                <textarea 
                                  className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 resize-none h-auto min-h-[40px]"
                                  value={p}
                                  onChange={(e) => handlePointChange(idx, i, e.target.value)}
                                />
                                <button 
                                  onClick={() => handleDeletePoint(idx, i)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors h-fit"
                                  title="Hapus Poin"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm font-medium text-slate-600 leading-relaxed py-1">
                                {renderCleanText(p)}
                              </p>
                            )}
                         </div>
                      ))}

                      {/* Add Button (Only in Edit Mode) */}
                      {editingSecIdx === idx && (
                        <button 
                          onClick={() => handleAddPoint(idx)}
                          className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline ml-5"
                        >
                          <Plus size={12} /> Tambah Poin
                        </button>
                      )}
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};