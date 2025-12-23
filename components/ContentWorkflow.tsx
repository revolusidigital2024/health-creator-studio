import React, { useState, useEffect } from 'react';
import { Channel, ContentIdea, Language, VideoDuration, WorkflowStep, Persona } from '../types';
import { generateOutline, generateScriptSegment } from '../services/geminiService'; // Gemini Default Import
import { groqOutlineAdapter } from '../services/groqService';
import { translations } from '../services/translations';
import { storageService } from '../services/storageService';
import { WeeklyPlanner } from './WeeklyPlanner';
import { 
  Sparkles, Zap, Globe, Search, ArrowRight, FileText, PenTool, Printer, Save, Loader2,
  Stethoscope, AlertTriangle, Microscope, Quote
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ContentWorkflowProps {
  channel: Channel;
  onSaveProject: (title: string) => void;
  language: Language;
}

const VIDEO_FORMATS = [
  { id: 'myth', label: 'Mitos vs Fakta', icon: AlertTriangle },
  { id: 'list', label: 'Listicle (5 Tips)', icon: Stethoscope },
  { id: 'case', label: 'Bedah Kasus', icon: Microscope },
  { id: 'story', label: 'Storytelling', icon: Quote },
];

export const ContentWorkflow: React.FC<ContentWorkflowProps> = ({ channel, onSaveProject, language }) => {
  const t = translations[language];
  
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.IDEATION);
  const [topic, setTopic] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [duration, setDuration] = useState<VideoDuration>('standard');
  
  // UTAMAKAN GEMINI (Jika storage kosong, default ke gemini)
  const [engine, setEngine] = useState(storageService.getSelectedEngine() || 'gemini');
  
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [blueprint, setBlueprint] = useState<Partial<ContentIdea> | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [draftingIdx, setDraftingIdx] = useState<number | null>(null);

  useEffect(() => { storageService.setSelectedEngine(engine); }, [engine]);

  const startBlueprint = async (topicOverride?: string) => {
    const finalTopic = topicOverride || topic;
    const promptTopic = selectedFormat 
      ? `[Format: ${VIDEO_FORMATS.find(f => f.id === selectedFormat)?.label}] ${finalTopic}` 
      : finalTopic;

    if (!finalTopic) return;
    setLoading(true);
    if(topicOverride) setTopic(topicOverride);

    try {
      let data;
      // LOGIC UTAMA: Pilih Service berdasarkan Engine
      if (engine === 'groq') {
        data = await groqOutlineAdapter(promptTopic, channel.targetAge, channel.niche, language, duration);
      } else {
        // Default GEMINI
        data = await generateOutline(promptTopic, channel.targetAge, channel.niche, language, duration);
      }
      setBlueprint(data);
      setStep(WorkflowStep.OUTLINING);
    } catch (e: any) { 
        alert(`Error (${engine}): ${e.message}`); 
    } finally { 
        setLoading(false); 
    }
  };

  const generateSegment = async (idx: number) => {
    if (!blueprint || !selectedPersona || !blueprint.outline) return;
    setDraftingIdx(idx);
    try {
      const segment = await generateScriptSegment(topic, blueprint.outline[idx], selectedPersona, channel.targetAge, language);
      const newOutline = [...blueprint.outline];
      newOutline[idx].scriptSegment = segment;
      setBlueprint({ ...blueprint, outline: newOutline });
    } catch (e: any) { alert(e.message); } finally { setDraftingIdx(null); }
  };

  const renderProgress = () => {
    const steps = Object.values(WorkflowStep);
    const currentIndex = steps.indexOf(step);
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           {steps.map((s, i) => (
             <div key={s} className="flex items-center">
               <div className={cn("w-2 h-2 rounded-full transition-all", i <= currentIndex ? "bg-emerald-500 scale-125" : "bg-slate-200")} />
               {i < steps.length - 1 && <div className={cn("w-4 h-0.5 mx-1.5", i < currentIndex ? "bg-emerald-500" : "bg-slate-100")} />}
             </div>
           ))}
           <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{step}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2 text-slate-400">
           <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">Workspace</span>
           <span className="text-[10px] font-bold text-slate-300">/</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{channel.niche}</span>
        </div>

        {/* ENGINE SWITCHER */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
           <button 
             onClick={() => setEngine('gemini')}
             className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all", engine === 'gemini' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
           >
             <Sparkles size={14} /> Gemini
           </button>
           <button 
             onClick={() => setEngine('groq')}
             className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all", engine === 'groq' ? "bg-white text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
           >
             <Zap size={14} /> Groq (Fast)
           </button>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center justify-center gap-3">
           <span className="text-emerald-600">Health</span>Creator Studio
        </h1>
        <p className="text-slate-500 font-medium text-sm">
           Using <span className={engine === 'gemini' ? 'text-blue-600 font-bold' : 'text-orange-600 font-bold'}>
             {engine === 'gemini' ? 'Gemini 1.5 Pro' : 'Groq LPU'}
           </span>
        </p>
      </div>

      {renderProgress()}

      {/* STEP 1: IDEATION */}
      {step === WorkflowStep.IDEATION && (
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {VIDEO_FORMATS.map((fmt) => (
               <button
                 key={fmt.id}
                 onClick={() => setSelectedFormat(selectedFormat === fmt.id ? null : fmt.id)}
                 className={cn(
                   "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                   selectedFormat === fmt.id ? `bg-slate-900 text-white border-slate-900 shadow-lg scale-105` : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-500"
                 )}
               >
                 <fmt.icon size={20} className={cn("mb-2", selectedFormat === fmt.id ? "text-emerald-400" : "text-slate-400")} />
                 <span className="text-[10px] font-bold uppercase tracking-wide">{fmt.label}</span>
               </button>
             ))}
          </div>

          <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-slate-200 relative">
             <div className="absolute -top-10 right-4 flex gap-2">
                <button onClick={() => setUseWebSearch(!useWebSearch)} className={cn("text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-all", useWebSearch ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400")}>
                  <Globe size={12} /> Web Source {useWebSearch ? 'ON' : 'OFF'}
                </button>
             </div>

             <div className="flex items-center gap-4 pl-6 pr-2 py-3">
                <Search className={cn("shrink-0 transition-colors", topic ? "text-emerald-600" : "text-slate-300")} size={28} />
                <div className="flex-1">
                  {selectedFormat && (
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
                      Drafting: {VIDEO_FORMATS.find(f => f.id === selectedFormat)?.label}
                    </span>
                  )}
                  <input
                    type="text"
                    className="w-full bg-transparent text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                    placeholder="Apa keluhan pasien hari ini?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startBlueprint()}
                  />
                </div>
                <button
                  onClick={() => startBlueprint()}
                  disabled={loading || !topic}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:bg-slate-200 shrink-0 shadow-lg shadow-emerald-200"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                </button>
             </div>
          </div>

          {/* WEEKLY PLANNER (Pass ENGINE prop here!) */}
          <WeeklyPlanner 
            channel={channel} 
            language={language} 
            onSelectTopic={startBlueprint} 
            engine={engine} // <--- INI KUNCINYA
          />
        </div>
      )}

      {/* STEP 2: STRUCTURE */}
      {step === WorkflowStep.OUTLINING && blueprint && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 max-w-4xl mx-auto">
           <div className="bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                 </div>
                 <div>
                   <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Video Concept</p>
                   <h2 className="text-xl font-bold italic">"{blueprint.title}"</h2>
                 </div>
              </div>
              <button onClick={() => setStep(WorkflowStep.PERSONA)} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2">
                 Next Phase <ArrowRight size={16} />
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                 <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle size={12} /> The Hook</h4>
                 <p className="text-lg font-black text-slate-800 italic leading-snug">"{blueprint.hook}"</p>
              </div>
              <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                 <div className="space-y-6">
                    {blueprint.outline?.map((sec, idx) => (
                       <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center gap-1">
                             <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{idx+1}</div>
                          </div>
                          <div>
                             <h5 className="font-bold text-slate-800">{sec.section}</h5>
                             <ul className="mt-2 space-y-1">
                                {sec.points?.map((p, i) => <li key={i} className="text-xs text-slate-500 font-medium pl-2 border-l-2 border-emerald-100">{p}</li>)}
                             </ul>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* STEP 3: PERSONA */}
      {step === WorkflowStep.PERSONA && (
        <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto">
           <div><h2 className="text-3xl font-black text-slate-900">Choose your Voice</h2></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'clinical', name: 'Dr. Expert', desc: 'Academic, Precise, Trusted.', icon: '🧬', style: 'Formal' },
                { id: 'friendly', name: 'Dr. Bestie', desc: 'Warm, Relatable, Easy terms.', icon: '☕', style: 'Casual' },
                { id: 'urgent', name: 'Dr. Alert', desc: 'Direct, Fast-paced, Shocking.', icon: '🚨', style: 'High Energy' }
              ].map(p => (
                 <div key={p.id} onClick={() => setSelectedPersona(p as any)} className={cn("cursor-pointer p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center group", selectedPersona?.id === p.id ? 'border-emerald-500 bg-emerald-50/50 shadow-xl scale-105' : 'border-slate-100 bg-white hover:border-slate-300')}>
                    <div className="text-4xl mb-4 bg-white p-4 rounded-full shadow-sm">{p.icon}</div>
                    <h3 className="font-bold text-slate-900 text-xl mb-2">{p.name}</h3>
                    <p className="text-sm text-slate-500 mb-6">{p.desc}</p>
                 </div>
              ))}
           </div>
           <div className="flex justify-center gap-4">
             <button onClick={() => setStep(WorkflowStep.OUTLINING)} className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100">Back</button>
             <button disabled={!selectedPersona} onClick={() => setStep(WorkflowStep.DRAFTING)} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl disabled:opacity-30 hover:bg-emerald-600 transition-all">Start Writing</button>
           </div>
        </div>
      )}

      {/* STEP 4: DRAFTING */}
      {(step === WorkflowStep.DRAFTING || step === WorkflowStep.FINAL) && blueprint && selectedPersona && (
         <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-40">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">{selectedPersona.icon}</div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Speaking as</p><p className="font-bold text-slate-800 text-sm">{selectedPersona.name}</p></div>
               </div>
               {step === WorkflowStep.DRAFTING ? (
                 <button onClick={() => setStep(WorkflowStep.FINAL)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-emerald-600">Finalize</button>
               ) : (
                 <button onClick={() => onSaveProject(blueprint.title || 'Untitled')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-2"><Save size={16}/> Save Project</button>
               )}
            </div>
            <div className="bg-white border border-slate-200 shadow-xl rounded-sm min-h-[800px] p-12 font-serif text-lg leading-relaxed text-slate-800 relative">
               <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
               <div className="text-center border-b-2 border-slate-100 pb-8 mb-10">
                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{blueprint.title}</h1>
                 <div className="inline-block bg-amber-50 text-amber-700 px-4 py-2 rounded-lg font-sans text-sm font-bold border border-amber-100">HOOK: "{blueprint.hook}"</div>
               </div>
               <div className="space-y-12">
                 {blueprint.outline?.map((sec, idx) => (
                    <div key={idx} className="group">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-widest">Section {idx+1}: {sec.section}</h3>
                          {step === WorkflowStep.DRAFTING && (
                             <button onClick={() => generateSegment(idx)} disabled={draftingIdx === idx} className={cn("text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg flex items-center gap-2 transition-all", sec.scriptSegment ? "bg-emerald-50 text-emerald-600" : "bg-slate-900 text-white")}>
                                {draftingIdx === idx ? <Loader2 className="animate-spin" size={12} /> : <PenTool size={12} />}
                                {draftingIdx === idx ? 'Thinking...' : sec.scriptSegment ? 'Rewrite' : 'Generate'}
                             </button>
                          )}
                       </div>
                       {sec.scriptSegment ? <div className="pl-6 border-l-4 border-emerald-100 whitespace-pre-wrap">{sec.scriptSegment}</div> : <div className="h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 gap-2"><span className="font-sans text-xs font-bold uppercase tracking-widest">Pending Generation</span></div>}
                    </div>
                 ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};