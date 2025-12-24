import React, { useEffect } from 'react';
import { Persona } from '../../types';
import { PenTool, ArrowLeft, Star } from 'lucide-react'; // Tambah icon Star
import { cn } from '../../lib/utils';

interface Props {
  selectedPersona: Persona | null;
  onSelect: (p: Persona) => void;
  onBack: () => void;
  onNext: () => void;
  t: any;
  currentFormatId: string; // PROP WAJIB: Biar tau format videonya apa
}

export const StepPersona: React.FC<Props> = ({ 
  selectedPersona, onSelect, onBack, onNext, currentFormatId 
}) => {
  
  // DEFINISI TONE + LOGIC REKOMENDASI
  const tones = [
    { 
      id: 'clinical', 
      name: 'Gaya Klinis', 
      desc: 'Penjelasan mendalam, bahasa baku, penuh istilah medis. Cocok untuk edukasi serius.', 
      icon: '🎓', 
      style: 'Formal & Akademis',
      bestFor: ['case', 'deep'] // Cocok buat Bedah Kasus & Deep Dive
    },
    { 
      id: 'friendly', 
      name: 'Gaya Sahabat', 
      desc: 'Bahasa sehari-hari, santai, mudah dimengerti awam. Cocok untuk tips praktis.', 
      icon: '☕', 
      style: 'Santai & Relate',
      bestFor: ['list', 'story'] // Cocok buat Listicle & Story
    },
    { 
      id: 'urgent', 
      name: 'Gaya Warning', 
      desc: 'Tempo cepat, tegas, fokus pada bahaya/mitos. Cocok untuk konten viral.', 
      icon: '🚨', 
      style: 'Tegas & Cepat',
      bestFor: ['myth'] // Cocok buat Mitos
    }
  ];

  // Auto-Select Rekomendasi saat pertama buka
  useEffect(() => {
    if (!selectedPersona) {
      const recommended = tones.find(t => t.bestFor.includes(currentFormatId));
      if (recommended) {
        onSelect(recommended as any);
      }
    }
  }, []);

  return (
    <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 max-w-5xl mx-auto">
       
       <div>
         <h2 className="text-4xl font-black text-slate-900 tracking-tight">Atur Nada Bicara 🎙️</h2>
         <p className="text-slate-500 mt-3 text-lg">
           AI merekomendasikan nada yang pas untuk format <span className="font-bold text-emerald-600 uppercase">{currentFormatId === 'myth' ? 'Mitos' : currentFormatId === 'list' ? 'Tips' : currentFormatId}</span>.
         </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tones.map(p => {
             // Cek apakah tone ini cocok dengan format video
             const isRecommended = p.bestFor.includes(currentFormatId);

             return (
               <div 
                 key={p.id} 
                 onClick={() => onSelect(p as any)} 
                 className={cn(
                   "cursor-pointer p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden flex flex-col items-center group bg-white",
                   selectedPersona?.id === p.id 
                     ? 'border-emerald-500 shadow-2xl scale-105 z-10 ring-4 ring-emerald-500/10' 
                     : 'border-slate-100 hover:border-slate-300 hover:-translate-y-1 opacity-80 hover:opacity-100'
                 )}
               >
                  {/* BADGE REKOMENDASI YANG HILANG KEMARIN */}
                  {isRecommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md z-20">
                      <Star size={10} fill="currentColor" /> Paling Cocok
                    </div>
                  )}

                  <div className={cn(
                    "text-5xl mb-6 p-6 rounded-3xl transition-colors mt-2", 
                    selectedPersona?.id === p.id ? "bg-emerald-100" : "bg-slate-50 group-hover:bg-slate-100"
                  )}>
                    {p.icon}
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-xl mb-2">{p.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed px-4">{p.desc}</p>
                  
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                    selectedPersona?.id === p.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {p.style}
                  </span>
               </div>
             );
          })}
       </div>
       
       <div className="flex justify-center gap-4 pt-4">
         <button onClick={onBack} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-colors flex items-center gap-2">
           <ArrowLeft size={18} /> Kembali
         </button>
         
         <button 
           disabled={!selectedPersona} 
           onClick={onNext} 
           className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl disabled:opacity-30 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 transition-all flex items-center gap-3"
         >
           Tulis Naskah Sekarang <PenTool size={18} />
         </button>
       </div>
    </div>
  );
};