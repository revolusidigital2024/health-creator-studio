import React from 'react';
import { WeeklyPlanner } from '../WeeklyPlanner';
import { Channel, Language, WeeklyPlanItem } from '../../types';
import { AlertTriangle, Stethoscope, Microscope, Quote, Command, Globe, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// Definisi Format
export const VIDEO_FORMATS = [
  { id: 'myth', label: 'Mitos vs Fakta', icon: AlertTriangle, color: 'amber', placeholder: 'Mitos apa yang mau dibongkar?' },
  { id: 'list', label: 'Listicle (5 Tips)', icon: Stethoscope, color: 'emerald', placeholder: 'Topik tips apa hari ini?' },
  { id: 'case', label: 'Bedah Kasus', icon: Microscope, color: 'blue', placeholder: 'Kasus penyakit apa yang mau dibedah?' },
  { id: 'story', label: 'Cerita Pasien', icon: Quote, color: 'purple', placeholder: 'Cerita pasien apa yang mau diangkat?' },
];

interface Props {
  channel: Channel;
  language: Language;
  topic: string;
  setTopic: (t: string) => void;
  selectedFormat: string;
  setSelectedFormat: (f: string) => void;
  loading: boolean;
  onGenerate: () => void;
  useWebSearch: boolean;
  setUseWebSearch: (b: boolean) => void;
  engine: string;
  // Props baru untuk Weekly Planner
  weeklyPlan: WeeklyPlanItem[] | undefined;
  onPlanGenerated: (strategy: 'mix' | 'focus', formatLabel: string) => Promise<void>;
}

export const StepIdeation: React.FC<Props> = ({
  channel, language, topic, setTopic, selectedFormat, setSelectedFormat,
  loading, onGenerate, useWebSearch, setUseWebSearch, engine,
  weeklyPlan, onPlanGenerated
}) => {
  const currentFormat = VIDEO_FORMATS.find(f => f.id === selectedFormat) || VIDEO_FORMATS[1];

  const handlePlanSelection = (title: string, type: string) => {
    const lowerType = type.toLowerCase();
    let targetFormat = 'list';
    if (lowerType.includes('mitos') || lowerType.includes('myth')) targetFormat = 'myth';
    else if (lowerType.includes('kasus') || lowerType.includes('case')) targetFormat = 'case';
    else if (lowerType.includes('cerita') || lowerType.includes('story')) targetFormat = 'story';
    
    setSelectedFormat(targetFormat);
    setTopic(title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="relative group">
         {/* Format Tabs */}
         <div className="flex items-end px-6 gap-2">
            {VIDEO_FORMATS.map((fmt) => {
              const isActive = selectedFormat === fmt.id;
              const activeClass = 
                fmt.color === 'amber' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                fmt.color === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                fmt.color === 'purple' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                'bg-emerald-100 text-emerald-700 border-emerald-200';

              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-t-2xl text-xs font-bold transition-all border-t border-x relative top-[1px] flex items-center gap-2",
                    isActive ? `${activeClass} z-10 pb-3` : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
                  )}
                >
                  <fmt.icon size={14} /> {fmt.label}
                </button>
              );
            })}
         </div>

         {/* Main Input */}
         <div className={cn("bg-white p-2 rounded-b-[2.5rem] rounded-tr-[2.5rem] shadow-2xl shadow-slate-200/60 border-2 transition-colors relative z-20",
           selectedFormat === 'myth' ? 'border-amber-200' :
           selectedFormat === 'case' ? 'border-blue-200' :
           selectedFormat === 'story' ? 'border-purple-200' : 'border-emerald-200'
         )}>
            <div className="flex items-center gap-4 pl-6 pr-2 py-4">
               <div className={cn("p-3 rounded-xl transition-colors",
                 selectedFormat === 'myth' ? 'bg-amber-50 text-amber-600' :
                 selectedFormat === 'case' ? 'bg-blue-50 text-blue-600' :
                 selectedFormat === 'story' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
               )}><Command size={24} /></div>
               
               <input
                 type="text"
                 className="flex-1 bg-transparent text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                 placeholder={currentFormat.placeholder}
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
                 autoFocus
               />

               <div className="flex items-center gap-2 pr-2">
                  <button onClick={() => setUseWebSearch(!useWebSearch)} className={cn("p-3 rounded-xl transition-all border flex items-center gap-2", useWebSearch ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400")} title="Cari referensi dari web">
                    <Globe size={18} /> {useWebSearch && <span className="text-[10px] font-bold">ON</span>}
                  </button>
                  <button onClick={onGenerate} disabled={loading || !topic} className={cn("px-8 py-4 rounded-2xl font-black text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg hover:scale-105", selectedFormat === 'myth' ? 'bg-amber-500' : selectedFormat === 'case' ? 'bg-blue-600' : selectedFormat === 'story' ? 'bg-purple-600' : 'bg-emerald-600')}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    {loading ? 'Sedang Mikir...' : 'Buat Naskah'} 
                  </button>
               </div>
            </div>
         </div>
      </div>

      <WeeklyPlanner 
        channel={channel} 
        language={language} 
        onSelectTopic={handlePlanSelection} 
        engine={engine}
        currentFormatLabel={currentFormat.label}
        // Kirim data & fungsi baru
        plan={weeklyPlan}
        onGeneratePlan={onPlanGenerated}
      />
    </div>
  );
};