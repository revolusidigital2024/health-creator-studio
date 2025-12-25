import React, { useState, useEffect } from 'react';
import { ContentIdea, VisualScene, Shot } from '../../types';
import { generateVisualPrompts } from '../../services/geminiService';
import { Film, Loader2, Copy, ArrowLeft, BotMessageSquare, Sparkles, RefreshCw, Clapperboard } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  blueprint: Partial<ContentIdea>;
  onBack: () => void;
  onNext: () => void;
  onSaveData: (scenes: VisualScene[]) => void;
}

// --- SUB-COMPONENT: SHOT CARD ---
const ShotCard: React.FC<{ shot: Shot; index: number }> = ({ shot, index }) => {
  const getShotTypeColor = (type: string) => {
    switch (type) {
      case '3D Animation': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Cinematic Emotion': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Macro Precision': return 'bg-lime-100 text-lime-800 border-lime-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 group relative transition-all hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border", getShotTypeColor(shot.shot_type))}>
          {shot.shot_type}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(shot.image_prompt)}
          className="p-1.5 bg-slate-100 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-100 hover:text-emerald-600"
          title="Salin Prompt"
        >
          <Copy size={12} />
        </button>
      </div>
      <p className="font-mono text-xs text-slate-600 leading-relaxed">{shot.image_prompt}</p>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const StepVisuals: React.FC<Props> = ({ blueprint, onBack, onNext, onSaveData }) => {
  const [scenes, setScenes] = useState<VisualScene[]>(blueprint.visualScenes || []);
  const [loading, setLoading] = useState(false);

  const handleCopyPrompts = () => {
    const allPrompts = scenes.flatMap(scene => {
      // Ambil prompt dari struktur baru (shots array)
      if (scene.shots && scene.shots.length > 0) {
        return scene.shots.map(s => s.image_prompt);
      }
      // Fallback untuk struktur lama
      if ((scene as any).image_prompt) return [(scene as any).image_prompt];
      return [];
    });
    navigator.clipboard.writeText(JSON.stringify(allPrompts, null, 2));
    alert("✅ Semua prompt berhasil disalin ke clipboard!");
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const fullScript = [
        blueprint.hook || '',
        ...(blueprint.outline?.map(sec => sec.scriptSegment || '') || [])
      ].join('\n\n').trim();

      if (!fullScript) {
        alert("Naskah lengkap kosong, tidak bisa membuat storyboard.");
        setLoading(false);
        return;
      }

      const generatedScenes = await generateVisualPrompts(fullScript);
      setScenes(generatedScenes);
      onSaveData(generatedScenes);
    } catch (e: any) {
      alert(`Gagal membuat storyboard: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const scenesData = blueprint.visualScenes;
    // FIX: Cek juga state lokal 'scenes' untuk memastikan kita tidak generate ulang jika data sudah ada di memori
    const hasLocalData = scenes.length > 0;
    const hasBlueprintData = scenesData && scenesData.length > 0;

    // HANYA generate otomatis jika data BENAR-BENAR kosong di kedua tempat (Blueprint & State Lokal)
    // Kita hapus logika 'isOldFormat' dari auto-trigger untuk mencegah loop regenerasi.
    if (!hasBlueprintData && !hasLocalData && !loading) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FIX: Sync 2 Arah (Blueprint <-> Local State)
  useEffect(() => {
    // 1. Jika blueprint punya data, update state lokal (saat mount/remount)
    if (blueprint.visualScenes && blueprint.visualScenes.length > 0) {
      setScenes(blueprint.visualScenes);
    } else if (scenes.length > 0 && (!blueprint.visualScenes || blueprint.visualScenes.length === 0)) {
      // 2. Jika state lokal punya data tapi blueprint kosong (kasus navigasi cepat), simpan ke blueprint
      onSaveData(scenes);
    }
  }, [blueprint.visualScenes, scenes]); // Tambahkan scenes ke dependency

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg sticky top-4 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md"><Clapperboard size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storyboard & B-Roll</p>
            <p className="font-bold text-slate-800 text-sm">Rencana Visual Video</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyPrompts} disabled={loading || scenes.length === 0} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50">
            <Copy size={14} /> Copy Prompts
          </button>
          <button onClick={handleGenerate} disabled={loading} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Membuat..." : "Buat Ulang"}
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white rounded-2xl border border-slate-200 shadow-xl">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
          <h3 className="text-lg font-bold text-slate-600 animate-pulse">AI sedang menjadi sutradara visual...</h3>
          <p className="text-sm text-slate-400 max-w-sm">Menganalisis naskah dan merancang shot list B-Roll yang sinematik untuk Anda.</p>
        </div>
      )}

      {/* SHOT LIST */}
      {!loading && scenes.length > 0 && (
        <div className="space-y-8">
          {scenes.map((scene, sceneIndex) => (
            <div key={sceneIndex} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Narasi</p>
                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">"{scene.scene_text}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  // LOGIKA ADAPTER: Cek format baru (shots) -> kalau kosong, cek format lama (image_prompt)
                  const shotsToRender = (scene.shots && scene.shots.length > 0) 
                    ? scene.shots 
                    : (scene as any).image_prompt 
                      ? [{ shot_type: 'Visual (Legacy)', image_prompt: (scene as any).image_prompt }] 
                      : [];

                  if (shotsToRender.length === 0) return <div className="text-slate-400 text-xs italic p-4 border border-dashed border-slate-200 rounded-xl">Prompt visual tidak tersedia. Coba 'Buat Ulang'.</div>;

                  return shotsToRender.map((shot: any, shotIndex: number) => <ShotCard key={shotIndex} shot={shot} index={shotIndex} />);
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* EMPTY STATE */}
      {!loading && scenes.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <Film size={40} className="text-slate-300" />
          <h3 className="text-lg font-bold text-slate-600">Storyboard Kosong</h3>
          <p className="text-sm text-slate-400 max-w-sm">Klik tombol di bawah untuk memulai analisis visual naskah Anda.</p>
          <button onClick={handleGenerate} disabled={loading} className="mt-4 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl flex items-center gap-3">
            <Sparkles size={18} /> Buat Storyboard
          </button>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="flex justify-center gap-4 pt-4">
        <button onClick={onBack} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 flex items-center gap-2">
          <ArrowLeft size={18} /> Kembali
        </button>
        <button
          onClick={onNext}
          disabled={scenes.length === 0}
          className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl flex items-center gap-3 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lanjut ke Vocal Director <BotMessageSquare size={18} />
        </button>
      </div>
    </div>
  );
};