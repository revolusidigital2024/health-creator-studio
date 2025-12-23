import React, { useState } from 'react';
import { CalendarDays, Shuffle, Loader2, ArrowRight } from 'lucide-react';
// Import DUA service sekaligus
import { generateWeeklyPlan as planGemini } from '../services/geminiService';
import { generateWeeklyPlan as planGroq } from '../services/groqService';
import { Channel, Language } from '../types';

interface WeeklyPlannerProps {
  channel: Channel;
  language: Language;
  onSelectTopic: (topic: string) => void;
  engine: string; // Tambah prop ini biar dia tau pake otak mana
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ channel, language, onSelectTopic, engine }) => {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let result;
      // Logic SWITCH ENGINE
      if (engine === 'gemini') {
        result = await planGemini(channel.niche, channel.targetAge, language);
      } else {
        result = await planGroq(channel.niche, channel.targetAge, language);
      }
      setPlan(result);
    } catch (e) {
      console.error(e);
      alert('Gagal membuat plan. Coba lagi atau ganti engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 border-t border-slate-100 mt-8 w-full animate-in fade-in slide-in-from-bottom-4">
      {/* Header Planner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarDays size={20} className="text-emerald-600" /> 
              Weekly Content Prescription
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Powered by <span className={`font-bold ${engine === 'gemini' ? 'text-blue-500' : 'text-orange-500'}`}>
                {engine === 'gemini' ? 'Gemini AI' : 'Groq LPU'}
              </span> for <span className="text-emerald-600 font-bold">{channel.niche}</span>
            </p>
          </div>
          
          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Shuffle size={14} />}
            {plan.length > 0 ? 'Regenerate Plan' : 'Prescribe Weekly Plan'}
          </button>
      </div>
      
      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {loading ? (
          // Loading Skeleton
          [1,2,3,4,5].map(i => (
            <div key={i} className="h-48 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse flex flex-col p-4 gap-3">
              <div className="w-12 h-4 bg-slate-200 rounded" />
              <div className="w-full h-20 bg-slate-200 rounded-xl" />
            </div>
          ))
        ) : plan.length > 0 ? (
          // Result Cards
          plan.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => onSelectTopic(item.title)}
              className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer transition-all flex flex-col justify-between h-full min-h-[220px]"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  {item.day}
                </span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border truncate max-w-[80px] ${
                   idx === 0 ? 'text-amber-600 border-amber-200 bg-amber-50' : 
                   idx === 1 ? 'text-blue-600 border-blue-200 bg-blue-50' :
                   idx === 4 ? 'text-purple-600 border-purple-200 bg-purple-50' :
                   'text-emerald-600 border-emerald-200 bg-emerald-50'
                }`}>
                  {item.type}
                </span>
              </div>

              <div>
                 <h4 className="font-bold text-slate-800 text-sm leading-snug mb-2 group-hover:text-emerald-700 line-clamp-3">
                   {item.title}
                 </h4>
                 <p className="text-xs text-slate-400 italic line-clamp-3 leading-relaxed group-hover:text-slate-500">
                   "{item.hook}"
                 </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-1 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                 Write Script <ArrowRight size={10} />
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="col-span-full py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-70">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
               <CalendarDays size={24} className="text-slate-300" />
             </div>
             <p className="text-sm font-bold text-slate-500">No content plan active.</p>
             <p className="text-xs text-slate-400 mt-1 max-w-md">
               Click the button above to generate a 5-day content strategy using {engine === 'gemini' ? 'Gemini' : 'Groq'}.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};