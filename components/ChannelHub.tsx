import React, { useState, useMemo } from 'react';
import { Channel, Project } from '../types';
import { Search, Plus, Layout, Video, Trash2, ArrowRight, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

// --- STATS COMPONENTS ---
const StatCard = ({ icon: Icon, label, value, trend }: any) => (
  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Icon size={24} /></div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
    </div>
  </div>
);

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", className)}>
    {children}
  </span>
);

interface ChannelHubProps {
  channels: Channel[];
  projects: Project[];
  onSelectChannel: (channel: Channel) => void;
  onCreateNew: () => void;
  onDeleteChannel: (id: string) => void;
}

export const ChannelHub: React.FC<ChannelHubProps> = ({ 
  channels, projects, onSelectChannel, onCreateNew, onDeleteChannel 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.niche.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [channels, searchTerm]);

  const totalDrafts = projects.filter(p => p.status !== 'Published').length;
  const totalPublished = projects.filter(p => p.status === 'Published').length;

  const getChannelStats = (channelId: string) => {
    const channelProjects = projects.filter(p => p.channelId === channelId);
    return {
      total: channelProjects.length,
      published: channelProjects.filter(p => p.status === 'Published').length,
      drafts: channelProjects.filter(p => p.status !== 'Published').length
    };
  };

  // HELPER BARU: Hitung Skor Otoritas per Channel
  const getChannelAuthority = (channelId: string) => {
    const channelProjects = projects.filter(p => p.channelId === channelId);
    if (channelProjects.length === 0) return 0;

    const totalScore = channelProjects.reduce((acc, p) => {
      let score = 0;
      if (p.data?.topic) score += 20;
      const outline = p.data?.blueprint?.outline || [];
      const segmentsFilled = outline.filter((s: any) => s.scriptSegment).length;
      if (outline.length > 0 && segmentsFilled === outline.length) score += 30;
      if (p.data?.blueprint?.visualScenes?.length) score += 25;
      if (p.data?.blueprint?.ssmlScript) score += 25;
      return acc + score;
    }, 0);

    return Math.round(totalScore / channelProjects.length);
  };

  return (
    <div className="max-w-[1600px] mx-auto py-4 space-y-8 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Pusat Komando Kreator</h1>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Kelola semua niche kesehatan Anda dari satu tempat. AI siap membantu meracik konten viral.
            </p>
          </div>
          <div className="relative z-10 mt-8">
             <button onClick={onCreateNew} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 w-fit shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95">
              <Plus size={20} /> Tambah Channel Baru
            </button>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={Layout} label="Channel Aktif" value={channels.length} trend="+1 Baru" />
          <StatCard icon={Video} label="Total Proyek" value={projects.length} />
          <StatCard icon={Zap} label="Ide & Draf" value={totalDrafts} />
          <StatCard icon={Activity} label="Video Terbit" value={totalPublished} trend="Tayang" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Cari niche atau nama channel..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl outline-none transition-all text-sm font-bold text-slate-800" />
        </div>
        <div className="flex items-center gap-3 px-4 text-xs font-bold text-slate-500">
           <span>Urutkan:</span>
           <select className="bg-transparent outline-none text-slate-900 cursor-pointer uppercase">
             <option>Terbaru</option><option>Abjad A-Z</option><option>Video Terbanyak</option>
           </select>
        </div>
      </div>

      {filteredChannels.length === 0 ? (
         <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">📭</div>
           <h3 className="text-xl font-bold text-slate-700">Belum ada channel ditemukan</h3>
           <p className="text-slate-400 mt-2 text-sm">Coba kata kunci lain atau buat channel baru untuk memulai.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => {
            const stats = getChannelStats(channel.id);
            const authority = getChannelAuthority(channel.id);
            return (
              <div key={channel.id} onClick={() => onSelectChannel(channel)} className="group bg-white rounded-[2rem] border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1">
                <div className="p-6 pb-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                       <Badge className={cn(channel.targetAge === 'Seniors' ? 'bg-purple-100 text-purple-700' : channel.targetAge === 'Kids' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}>
                         {channel.targetAge}
                       </Badge>
                       <span className="text-slate-300">•</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{channel.niche}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">{channel.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* SKOR OTORITAS DI SINI */}
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                      Otoritas: {authority}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Hapus channel ini?')) onDeleteChannel(channel.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                
                <div className="px-6 py-2 grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl text-center"><p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Video</p><p className="text-lg font-black text-slate-700">{stats.total}</p></div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-center"><p className="text-[9px] text-emerald-600/70 uppercase font-black tracking-widest mb-1">Tayang</p><p className="text-lg font-black text-emerald-600">{stats.published}</p></div>
                  <div className="bg-amber-50 p-2.5 rounded-xl text-center"><p className="text-[9px] text-amber-600/70 uppercase font-black tracking-widest mb-1">Draf</p><p className="text-lg font-black text-amber-600">{stats.drafts}</p></div>
                </div>
                <div className="px-6 py-5 flex-1"><p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">{channel.description || "Tidak ada deskripsi."}</p></div>
                <div className="p-5 bg-slate-50 border-t border-slate-100 mt-auto flex justify-between items-center group-hover:bg-emerald-50/30 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide"><Activity size={12} /> Aktif: Hari ini</span>
                  <button className="text-xs font-black text-slate-900 flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">Kelola <ArrowRight size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};