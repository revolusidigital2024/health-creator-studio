import React, { useState, useEffect } from 'react';
import { ContentIdea, AgeGroup, PackagingData } from '../../types';
import { generatePackaging } from '../../services/geminiService';
import { Loader2, Copy, ArrowLeft, CheckCircle2, Rocket, Youtube, Image as ImageIcon, Tag, Hash, Type, Check, Sparkles, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  targetAge: AgeGroup;
  onBack: () => void;
  onFinish: () => void;
  onSaveData: (data: any) => void; // Dibuat 'any' biar lebih fleksibel
}

// UPDATE INTERFACE THUMBNAIL sesuai prompt baru
interface ThumbnailConcept {
  assembly_instructions: string;
  text: string;
  background_prompt: string;
}

// Update PackagingData
interface UpdatedPackagingData extends Omit<PackagingData, 'thumbnails'> {
  thumbnails: ThumbnailConcept[];
}


const CopyBlock = ({ label, text, icon: Icon, isCode = false }: any) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group hover:border-emerald-200 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Icon size={12} /> {label}</p>
        <button onClick={handleCopy} className={cn("text-xs font-bold transition-opacity", copied ? "text-emerald-600" : "text-slate-400 opacity-0 group-hover:opacity-100")}>{copied ? 'Disalin!' : 'Salin'}</button>
      </div>
      <p className={cn("text-slate-800 text-sm leading-relaxed whitespace-pre-wrap", isCode && "font-mono text-xs bg-white p-2 rounded border")}>{text}</p>
    </div>
  );
};

export const StepPublish: React.FC<Props> = ({ blueprint, targetAge, onBack, onFinish, onSaveData }) => {
  const [data, setData] = useState<UpdatedPackagingData | null>(blueprint.packaging as any || null);
  const [loading, setLoading] = useState(false);
  const fullScript = blueprint.outline?.map(sec => sec.scriptSegment || '').join('\n\n') || '';

  useEffect(() => { if (!data && !loading && fullScript) handleGenerate(); }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generatePackaging(blueprint.title || '', fullScript, targetAge);
      if (result) { setData(result); onSaveData(result); }
    } catch (e) { alert("Gagal meracik packaging."); } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <h3 className="text-lg font-bold text-slate-600">Sedang Meracik Strategi Viral...</h3>
        <p className="text-sm text-slate-400">AI sedang memikirkan judul clickbait dan thumbnail yang menarik.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto pb-20">
       <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4"><div className="bg-white/20 p-3 rounded-2xl"><Youtube size={32} /></div><div><h2 className="text-2xl font-black">YouTube Packaging</h2><p className="text-red-100 text-sm">Optimasi Metadata & Visual</p></div></div>
          <button onClick={handleGenerate} className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-50 flex items-center gap-2 shadow-lg"><Rocket size={16} /> Racik Ulang</button>
       </div>

       {data && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-2"><Type size={20} className="text-red-500" /> Judul & Deskripsi</h3>
               <div className="space-y-4">{data.titles.map((title, i) => <CopyBlock key={i} label={`Opsi Judul ${i+1}`} text={title} icon={Type} />)}</div>
               <CopyBlock label="Deskripsi SEO" text={data.description} icon={Type} />
               <CopyBlock label="Hashtags" text={data.hashtags.join(' ')} icon={Hash} isCode />
               <CopyBlock label="Tags" text={data.tags} icon={Tag} isCode />
            </div>

            <div className="space-y-6">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b pb-2"><ImageIcon size={20} className="text-purple-500" /> Strategi Thumbnail</h3>
               {data.thumbnails.map((thumb, i) => (
                 <div key={i} className="bg-white border-2 border-purple-100 rounded-[2rem] p-6 shadow-sm">
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Konsep {i+1}</span>
                    <div className="space-y-4 mt-4">
                      
                      {/* INSTRUKSI PERAKITAN */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Layers size={12} /> Instruksi Desain</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border">{thumb.assembly_instructions}</p>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-yellow-700 uppercase mb-1">Teks di Gambar</p>
                        <p className="text-3xl font-black text-slate-900 leading-tight">"{thumb.text}"</p>
                      </div>

                      {/* PROMPT BACKGROUND */}
                      <CopyBlock label="Prompt Background (Midjourney)" text={thumb.background_prompt} icon={Sparkles} isCode />
                    </div>
                 </div>
               ))}
            </div>
         </div>
       )}
       
       <div className="flex justify-center gap-4 pt-8 border-t border-slate-100">
         <button onClick={onBack} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 flex items-center gap-2"><ArrowLeft size={18} /> Kembali</button>
         <button onClick={onFinish} className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 shadow-xl flex items-center gap-2"><CheckCircle2 size={18} /> Selesai Total</button>
       </div>
    </div>
  );
};