import React from 'react';
import { ContentIdea, Persona, WorkflowStep } from '../../types';
import { Save, Printer, Loader2, PenTool, AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  selectedPersona: Persona;
  step: WorkflowStep;
  draftingIdx: number | null;
  onGenerateSegment: (idx: number) => void; // Fungsi generate per blok
  onFinalize: () => void;
  onSave: () => void;
  onPrint: () => void;
}

export const StepDrafting: React.FC<Props> = ({
  blueprint, selectedPersona, step, draftingIdx, onGenerateSegment, onFinalize, onSave, onPrint
}) => {
  return (
     <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
        
        {/* CONTROL BAR (Sticky) */}
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg sticky top-4 z-40">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                {selectedPersona.icon}
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Persona Aktif</p>
                 <p className="font-bold text-slate-800 text-sm">{selectedPersona.name}</p>
              </div>
           </div>
           
           {step === WorkflowStep.DRAFTING ? (
             <button 
               onClick={onFinalize} 
               className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-500 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
             >
               <CheckCircle2 size={16} /> Selesai & Review
             </button>
           ) : (
             <div className="flex gap-2">
                <button onClick={onSave} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800"><Save size={16}/> Simpan</button>
                <button onClick={onPrint} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-xs"><Printer size={16}/></button>
             </div>
           )}
        </div>

        {/* KERTAS KERJA (Modular Blocks) */}
        <div className="bg-white border border-slate-200 shadow-2xl rounded-sm min-h-[800px] p-12 md:p-16 font-serif text-lg leading-relaxed text-slate-800 relative">
           <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
           
           {/* Header Naskah */}
           <div className="text-center border-b-2 border-slate-100 pb-10 mb-12">
             <p className="font-sans text-xs font-black text-slate-300 uppercase tracking-[0.4em] mb-4">NASKAH HEALTHCREATOR</p>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">{blueprint.title}</h1>
             <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-5 py-3 rounded-xl font-sans text-sm font-bold border border-amber-100">
               <AlertTriangle size={16} /> HOOK: "{blueprint.hook}"
             </div>
           </div>
           
           {/* BODY: Per Section */}
           <div className="space-y-12">
             {blueprint.outline?.map((sec, idx) => (
                <div key={idx} className="group scroll-mt-24" id={`section-${idx}`}>
                   {/* Section Toolbar */}
                   <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                      <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px]">{idx+1}</span>
                         {sec.section}
                      </h3>
                      
                      {step === WorkflowStep.DRAFTING && (
                         <button 
                           onClick={() => onGenerateSegment(idx)} 
                           disabled={draftingIdx === idx} 
                           className={cn(
                             "text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-lg flex items-center gap-2 transition-all border",
                             sec.scriptSegment 
                               ? "bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600" // Kalau udah ada, mode edit/regen
                               : "bg-slate-900 text-white border-transparent hover:bg-slate-800 shadow-md" // Kalau belum ada, tombol hitam mencolok
                           )}
                         >
                            {draftingIdx === idx ? (
                              <><Loader2 className="animate-spin" size={12} /> Menulis...</>
                            ) : sec.scriptSegment ? (
                              <><RotateCw size={12} /> Tulis Ulang</>
                            ) : (
                              <><PenTool size={12} /> Tulis Bagian Ini</>
                            )}
                         </button>
                      )}
                   </div>
                   
                   {/* Output Area */}
                   {sec.scriptSegment ? (
                      <div className="pl-8 border-l-4 border-emerald-500/20 whitespace-pre-wrap text-slate-800 leading-loose animate-in fade-in slide-in-from-left-2">
                        {sec.scriptSegment}
                      </div>
                   ) : (
                      // Empty State per Blok
                      <div className="h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-3 transition-colors group-hover:border-emerald-200/50 cursor-pointer"
                           onClick={() => step === WorkflowStep.DRAFTING && onGenerateSegment(idx)}>
                         <PenTool size={24} className="opacity-20" />
                         <span className="font-sans text-xs font-bold uppercase tracking-widest opacity-50">
                           Bagian ini belum ditulis
                         </span>
                      </div>
                   )}
                </div>
             ))}
           </div>

           <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center font-sans text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span>Dibuat oleh AI</span>
              <span>{new Date().toLocaleDateString()}</span>
           </div>
        </div>
     </div>
  );
};