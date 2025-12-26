
import React, { useState } from 'react';
import { Channel, AgeGroup, DoctorProfile } from '../types';
import { 
  Tv, Users, Hash, FileText, Save, ArrowLeft, UserCircle2, Copy, Sparkles, AlertCircle, Wand2 
} from 'lucide-react';
import { generateImagePrompt, enhanceDoctorProfile } from '../services/geminiService'; // Import fungsi baru
import { cn } from '../lib/utils';

interface ChannelSetupProps {
  channel: Channel | null;
  onSave: (channel: Channel) => void;
  onCancel?: () => void;
}

export const ChannelSetup: React.FC<ChannelSetupProps> = ({ channel, onSave, onCancel }) => {
  
  const [formData, setFormData] = useState<Partial<Channel>>(
    channel || {
      name: '',
      niche: 'Kesehatan Umum',
      targetAge: 'Adults',
      description: '',
      historyTopics: ''
    }
  );
  
  const [doctor, setDoctor] = useState<DoctorProfile>(
    channel?.doctorProfile || {
      name: 'Dr. Sherly',
      gender: 'Female',
      age: '30s',
      appearance: '', // Kosongin dulu biar user isi
      outfit: 'White medical coat',
      voiceType: 'Santai & Empati'
    }
  );

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false); // State loading untuk tombol magic

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: channel?.id || Date.now().toString(),
      name: formData.name || 'Channel Tanpa Nama',
      niche: formData.niche || 'General Health',
      targetAge: formData.targetAge as AgeGroup || 'Adults',
      description: formData.description || '',
      historyTopics: formData.historyTopics || '',
      createdAt: channel?.createdAt || new Date().toISOString(),
      doctorProfile: doctor 
    });
  };

  // LOGIC BARU: MAGIC ENHANCE
  const handleEnhanceAppearance = async () => {
    if (!doctor.appearance) return;
    setIsEnhancing(true);
    const enhancedText = await enhanceDoctorProfile(doctor.appearance);
    setDoctor({ ...doctor, appearance: enhancedText });
    setIsEnhancing(false);
  };

  const handleGenerateAssetPrompt = async () => {
    setIsGenerating(true);
    try {
      // Gunakan deskripsi yang (semoga) sudah di-enhance
      const prompt = await generateImagePrompt(doctor, "Professional Profile Picture for Youtube Avatar", "Neutral, Trustworthy, High Quality 8k");
      setGeneratedPrompt(prompt);
    } catch (e) {
      alert("Gagal membuat prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 pb-32">
      
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
          {channel ? 'Edit Identitas' : 'Setup Studio Baru'}
        </h1>
        <p className="text-slate-500 font-medium">
          Atur nama channel dan karakter dokter AI yang akan menjadi wajah brand Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 h-fit">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Tv className="text-emerald-500" /> Identitas Channel
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Channel</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold outline-none focus:border-emerald-500" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Dokter 24 Jam" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Niche</label>
                <select 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold outline-none focus:border-emerald-500 bg-white"
                  value={formData.niche} 
                  onChange={(e) => setFormData({...formData, niche: e.target.value})}
                >
                  <option value="Kesehatan Umum">Kesehatan Umum</option>
                  <optgroup label="Gaya Hidup & Kebugaran">
                    <option value="Kesehatan Mental">Kesehatan Mental</option>
                    <option value="Nutrisi & Diet">Nutrisi & Diet</option>
                    <option value="Fitnes & Yoga">Fitnes & Yoga</option>
                  </optgroup>
                  <optgroup label="Medis & Spesialis">
                    <option value="Penyakit Kronis">Penyakit Kronis</option>
                    <option value="Kesehatan Lansia">Kesehatan Lansia</option>
                    <option value="Pediatri (Anak)">Pediatri (Anak)</option>
                    <option value="Kesehatan Seksual">Kesehatan Seksual</option>
                  </optgroup>
                  <optgroup label="Tren & Modern">
                    <option value="Skincare">Skincare</option>
                    <option value="Obat Herbal">Obat Herbal</option>
                    <option value="Biohacking">Biohacking</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Audiens</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold outline-none focus:border-emerald-500 bg-white"
                  value={formData.targetAge} onChange={(e) => setFormData({...formData, targetAge: e.target.value as AgeGroup})}>
                  <option value="Kids">Anak-anak</option>
                  <option value="Teens">Remaja</option>
                  <option value="Adults">Dewasa</option>
                  <option value="Seniors">Lansia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Deskripsi</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none h-24 resize-none text-sm font-medium"
                placeholder="Channel ini membahas tentang..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Riwayat Video Lama (Anti-Duplikat)</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none h-32 resize-none text-sm font-medium placeholder:text-slate-400"
                placeholder="Tempel daftar judul video lama Anda di sini (satu judul per baris atau dipisahkan koma)..."
                value={formData.historyTopics || ''}
                onChange={(e) => setFormData({ ...formData, historyTopics: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 italic ml-1">Tips: Gunakan ekstensi browser untuk menyalin semua judul video Anda sekaligus.</p>
            </div>
        </div>

        {/* KOLOM KANAN: PROFIL DOKTER */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <h3 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/10 pb-4 mb-6 relative z-10">
              <UserCircle2 className="text-emerald-400" /> Profil Dokter (Host)
            </h3>

            <div className="space-y-5 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Dokter</label>
                  <input type="text" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold placeholder:text-white/30 focus:border-emerald-500 outline-none"
                    value={doctor.name} onChange={(e) => setDoctor({...doctor, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gaya Bicara</label>
                  <select 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-emerald-500 [&>option]:text-black cursor-pointer"
                    value={doctor.voiceType} 
                    onChange={(e) => setDoctor({...doctor, voiceType: e.target.value})}
                  >
                    <option value="Santai & Empati">Santai & Empati</option>
                    <option value="Formal & Klinis">Formal & Klinis</option>
                    <option value="Tegas & Energik">Tegas & Energik</option>
                    <option value="Storyteller">Pencerita (Storyteller)</option>
                  </select>
                </div>
              </div>

              <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ciri Fisik & Penampilan</label>
                    
                    <button 
                      type="button" 
                      onClick={handleEnhanceAppearance}
                      disabled={isEnhancing || !doctor.appearance}
                      className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                    >
                      <Wand2 size={10} className={isEnhancing ? "animate-spin" : ""} />
                      {isEnhancing ? "Menyempurnakan..." : "Sempurnakan (AI)"}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 h-28 resize-none transition-colors placeholder:text-white/30 leading-relaxed"
                      value={doctor.appearance} 
                      onChange={(e) => setDoctor({...doctor, appearance: e.target.value})} 
                      placeholder="Tulis aja pake Bahasa Indonesia: Dokter cewek muda, pake kacamata, senyum manis, jilbab pink..." 
                    />
                    <div className="absolute bottom-3 right-3">
                       {doctor.appearance && /^[a-zA-Z0-9\s,.]+$/.test(doctor.appearance.slice(0, 20)) && (
                         <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">English Ready</span>
                       )}
                    </div>
                  </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                 <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <Sparkles size={12} /> Generator Aset (Midjourney)
                    </p>
                    <button 
                      type="button" 
                      onClick={handleGenerateAssetPrompt} 
                      disabled={isGenerating} 
                      className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
                    >
                      {isGenerating ? 'Meracik...' : 'Buat Prompt Gambar'}
                    </button>
                 </div>
                 
                 {generatedPrompt && (
                   <div className="bg-black/30 p-4 rounded-xl border border-emerald-500/30 relative group animate-in fade-in slide-in-from-top-2">
                     <p className="font-mono text-[10px] text-emerald-50 leading-relaxed line-clamp-4">{generatedPrompt}</p>
                     <button 
                       type="button" 
                       onClick={() => {
                         navigator.clipboard.writeText(generatedPrompt);
                         alert('Prompt berhasil disalin!');
                       }} 
                       className="absolute top-2 right-2 p-1.5 bg-emerald-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 shadow-lg"
                       title="Salin Prompt"
                     >
                       <Copy size={12} />
                     </button>
                   </div>
                 )}
              </div>
            </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="lg:col-span-2 flex gap-4 pt-6 border-t border-slate-200">
           {onCancel && (
             <button 
               type="button" 
               onClick={onCancel} 
               className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2"
             >
               <ArrowLeft size={18} /> Batal
             </button>
           )}
           <button 
             type="submit" 
             className="flex-1 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
           >
             <Save size={18} /> Simpan Data Channel
           </button>
        </div>

      </form>
    </div>
  );
};
