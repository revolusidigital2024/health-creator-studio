import React, { useState, useEffect, useRef } from 'react';
import { GeminiModelId } from '../types';
import { storageService } from '../services/storageService';
import { ShieldCheck, Info, Trash2, Save, Key, Cpu, Download, Upload } from 'lucide-react';

interface SettingsProps {
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onResetData }) => {
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [groqKey, setGroqKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<GeminiModelId>('gemini-3-flash-preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGeminiKey(storageService.getGeminiKey() || '');
    setGroqKey(storageService.getGroqKey() || '');
    setGeminiModel((storageService.getGeminiModel() as GeminiModelId) || 'gemini-3-flash-preview');
  }, []);

  const handleSaveGemini = () => {
    storageService.saveGeminiKey(geminiKey);
    // PANGGIL FUNGSI BARU: Simpan model pilihan user
    storageService.saveGeminiModel(geminiModel);
    alert('✅ Konfigurasi Gemini berhasil disimpan!');
  };

  const handleSaveGroq = () => {
    storageService.saveGroqKey(groqKey);
    alert('✅ API Key Groq berhasil disimpan!');
  };

  // --- LOGIC EXPORT ---
  const handleExport = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-creator-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIC IMPORT ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonContent = event.target?.result as string;
      if (storageService.importData(jsonContent)) {
        alert('✅ Data berhasil dipulihkan! Halaman akan dimuat ulang.');
        window.location.reload(); 
      } else {
        alert('❌ Gagal memulihkan data. Pastikan file JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 pb-32">
      
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Pengaturan Sistem</h2>
        <p className="text-slate-500 font-medium mt-2">Kelola kunci API dan data aplikasi Anda.</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4 mb-10 shadow-sm">
         <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0">
           <ShieldCheck size={28} />
         </div>
         <div>
           <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide mb-1">
             Keamanan Data Terjamin (Offline First)
           </h4>
           <p className="text-sm text-emerald-700/80 leading-relaxed">
             Data Anda disimpan <strong>hanya di browser ini</strong>. Untuk memindahkan data ke perangkat lain, gunakan fitur Backup & Restore di bawah.
           </p>
         </div>
      </div>

      <div className="space-y-8">
        
        {/* BACKUP & RESTORE SECTION */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                 <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                   <Download size={20} className="text-blue-400" /> Backup & Restore Data
                 </h3>
                 <p className="text-slate-400 text-sm max-w-lg">
                   Pindahkan semua Channel, Proyek, dan API Key Anda ke perangkat lain dengan mudah. Download file backup dan upload di perangkat tujuan.
                 </p>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={handleExport}
                   className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
                 >
                   <Download size={16} /> Download Backup
                 </button>
                 
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   style={{ display: 'none' }} 
                   accept=".json" 
                   onChange={handleFileChange}
                 />
                 <button 
                   onClick={handleImportClick}
                   className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
                 >
                   <Upload size={16} /> Restore Data
                 </button>
              </div>
           </div>
        </div>

        {/* GEMINI SECTION */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-8 group hover:border-emerald-200 transition-all">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100">✨</div>
                <div>
                  <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase">Google Gemini</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${geminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${geminiKey ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {geminiKey ? 'Sistem Aktif' : 'Belum Dikonfigurasi'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md flex gap-2">
                <Info size={18} className="shrink-0 text-emerald-500" />
                Gunakan model <strong>3 Flash Preview</strong> agar kuota gratisan awet & super cepat.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col gap-4">
              <div className="flex gap-2 w-full lg:w-[400px]">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></div>
                  <input type="password" placeholder="Tempel API Key Gemini" className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-mono text-xs bg-slate-50 font-bold" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
                </div>
                <button onClick={handleSaveGemini} className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all uppercase text-[10px] flex items-center gap-2 shadow-lg"><Save size={16} /> Simpan</button>
              </div>
              
              <div className="relative w-full lg:w-[400px]">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Cpu size={16} /></div>
                <select 
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-xs bg-white text-slate-700 appearance-none cursor-pointer" 
                  value={geminiModel} 
                  onChange={(e) => setGeminiModel(e.target.value as GeminiModelId)}
                >
                  <option value="gemini-3-flash-preview">⚡ Gemini 3 Flash Preview (Terbaru & Tercepat)</option>
                  {/* <option value="gemini-1.5-pro">💎 Gemini 1.5 Pro (Legacy)</option> */}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
              </div>
            </div>
          </div>
        </div>

        {/* GROQ SECTION */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-8 group hover:border-orange-200 transition-all">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl border border-orange-100">⚡</div>
                <div>
                  <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase">Groq Cloud</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${groqKey ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${groqKey ? 'text-orange-600' : 'text-slate-400'}`}>
                      {groqKey ? 'Sistem Aktif' : 'Belum Dikonfigurasi'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md flex gap-2">
                <Info size={18} className="shrink-0 text-orange-500" />
                Alternatif super cepat menggunakan Llama-3.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex gap-2 w-full lg:w-[400px]">
              <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></div>
                  <input type="password" placeholder="Tempel API Key Groq" className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 outline-none transition-all font-mono text-xs bg-slate-50 font-bold" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} />
              </div>
              <button onClick={handleSaveGroq} className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all uppercase text-[10px] flex items-center gap-2 shadow-lg"><Save size={16} /> Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
        <div className="text-center md:text-left">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start"><Trash2 size={12} /> Zona Bahaya</p>
          <p className="text-slate-500 text-sm mt-1 font-medium">Hapus semua data channel dan proyek dari browser ini.</p>
        </div>
        <button onClick={() => confirm('Yakin ingin menghapus SEMUA data?') && onResetData()} className="px-8 py-4 border-2 border-rose-100 text-rose-500 font-black rounded-2xl text-xs hover:bg-rose-50 hover:border-rose-200 transition-all uppercase tracking-widest flex items-center gap-2">
          <Trash2 size={16} /> Reset Pabrik
        </button>
      </div>
    </div>
  );
};