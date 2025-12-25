
import React from 'react';
import { Channel, WorkflowStep, GeminiModelId } from '../../types';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  step: WorkflowStep;
  channel: Channel;
  engine: string;
  setEngine: (e: string) => void;
  onBack: () => void;
  isEditing: boolean; // Penanda kalau ini mode edit
}

export const WorkflowHeader: React.FC<Props> = ({ 
  step, channel, engine, setEngine, onBack, isEditing 
}) => {
  
  // Logic nama model dipindah ke sini biar rapi
  const getModelDisplayName = () => {
    if (engine === 'groq') return 'Groq LPU™';
    const savedModel = localStorage.getItem('health_creator_gemini_model') as GeminiModelId;
    // Fixed: Updated comparison and display names to Gemini 3 series to match type definition
    if (savedModel === 'gemini-3-flash-preview') return 'Gemini-3-pro-preview';
    return 'Gemini 3 Flash';
  };

  return (
    <div className="flex flex-col items-center mb-10 space-y-4 relative">
      
      {/* Tombol Kembali */}
      <button 
        onClick={onBack}
        className="absolute left-0 top-2 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 group"
        title="Kembali"
      >
        <div className="bg-white border border-slate-200 p-2 rounded-lg group-hover:border-slate-400 transition-colors shadow-sm">
           <ArrowLeft size={20} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
          {step === WorkflowStep.IDEATION ? "Keluar" : "Mundur"}
        </span>
      </button>

      {/* Workspace Badge */}
      <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</span>
         <span className="text-[10px] text-slate-300">/</span>
         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{channel.niche}</span>
      </div>
      
      {/* Judul Besar */}
      <h1 className="text-5xl font-black text-slate-900 tracking-tighter text-center">
         {isEditing ? "Edit Proyek" : (step === WorkflowStep.IDEATION ? "Mau bikin konten apa?" : "Studio Produksi")}
      </h1>
      
      {/* Engine Switcher */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
         <span>Ditenagai oleh</span>
         <button onClick={() => setEngine(engine === 'gemini' ? 'groq' : 'gemini')} className={cn("font-bold flex items-center gap-1 hover:underline", engine === 'gemini' ? "text-blue-600" : "text-orange-600")}>
           {engine === 'gemini' ? <Sparkles size={12}/> : <Zap size={12}/>}
           {getModelDisplayName()}
         </button>
      </div>
    </div>
  );
};
