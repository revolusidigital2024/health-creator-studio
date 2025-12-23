import React, { useState } from 'react';
import { CalendarDays, Shuffle, Loader2, ArrowRight, Layers, Target } from 'lucide-react';
import { generateWeeklyPlan as planGemini } from '../services/geminiService';
import { generateWeeklyPlan as planGroq } from '../services/groqService';
import { Channel, Language } from '../types';
import { cn } from '../lib/utils';

interface WeeklyPlannerProps {
  channel: Channel;
  language: Language;
  onSelectTopic: (title: string, type: string) => void;
  engine: string;
  currentFormatLabel: string;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ 
  channel, language, onSelectTopic, engine, currentFormatLabel 
}) => {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'mix' | 'focus'>('mix');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const focusFormat = strategy === 'focus' ? currentFormatLabel : undefined;
      // Paksa bahasa 'id' (Indonesia) ke AI
      let result;
      if (engine === 'gemini') {
        result = await planGemini(channel.niche, channel.targetAge, 'id', focusFormat);
      } else {
        result = await planGroq(channel.niche, channel.targetAge, 'id', focusFormat);
      }
      setPlan(result);
    } catch (e) {
      console.error(e);
      alert('Gagal membuat jadwal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 border-t border-slate-100 mt-10 w-full animate-in fade-in slide-in-from-bottom-4">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CalendarDays size={24} className="text-emerald-600" /> 
              Resep Konten Mingguan
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Ditenagai oleh <span className={`font-bold ${engine === 'gemini' ? 'text-blue-500' : 'text-orange-500'}`}>
                {engine === 'gemini' ? 'Gemini AI' : 'Groq LPU'}
              </span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="bg-slate-100 p-1 rounded-xl flex">
               <button 
                 onClick={() => setStrategy('mix')}
                 className={cn(
                   "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all",
                   strategy === 'mix' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 <Layers size={14} /> Campur Viral
               </button>
               <button 
                 onClick={() => setStrategy('focus')}
                 className={cn(
                   "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all",
                   strategy === 'focus' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 <Target size={14} /> Serial: {currentFormatLabel}
               </button>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50 hover:shadow-emerald-200 min-w-[160px]"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Shuffle size={16} />}
              {plan.length > 0 ? 'Acak Ulang' : 'Buat Jadwal'}
            </button>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {loading ? (
          [1,2,3,4,5].map(i => (
            <div key={i} className="h-56 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse flex flex-col p-5 gap-4">
              <div className="w-16 h-5 bg-slate-200 rounded-lg" />
              <div className="w-full h-24 bg-slate-200 rounded-2xl" />
            </div>
          ))
        ) : plan.length > 0 ? (
          plan.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => onSelectTopic(item.title, item.type)}
              className="group relative bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer transition-all flex flex-col justify-between h-full min-h-[240px] hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {item.day}
                </span>
                <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-lg border text-emerald-600 border-emerald-200 bg-emerald-50">
                  {item.type}
                </span>
              </div>

              <div>
                 <h4 className="font-bold text-slate-800 text-sm leading-snug mb-3 group-hover:text-emerald-700 line-clamp-3">
                   {item.title}
                 </h4>
                 <p className="text-xs text-slate-400 italic line-clamp-3 leading-relaxed group-hover:text-slate-500">
                   "{item.hook}"
                 </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-300 group-hover:text-emerald-600 transition-colors">
                 <span>Klik untuk Tulis</span>
                 <div className="bg-slate-100 group-hover:bg-emerald-100 p-1.5 rounded-full transition-colors">
                    <ArrowRight size={12} />
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
               <CalendarDays size={32} className="text-slate-300" />
             </div>
             <p className="text-base font-bold text-slate-500">Belum ada jadwal aktif.</p>
             <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
               Pilih <strong>Campur Viral</strong> untuk variasi atau <strong>Serial</strong> untuk fokus membahas {currentFormatLabel} selama seminggu penuh.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};