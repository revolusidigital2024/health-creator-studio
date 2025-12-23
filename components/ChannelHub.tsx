import React, { useState, useMemo } from 'react';
import { Channel, Project, Language } from '../types';
import { translations } from '../services/translations';
import { 
  Search, 
  Plus, 
  Layout, 
  Video, 
  Users, 
  Trash2, 
  ArrowRight, 
  Activity,
  Zap,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils'; // Pastikan buat file utils.ts atau hapus import ini dan function cn-nya kalau mau manual

// --- UI COMPONENTS (Inline biar gampang copy) ---
// Kalau mau rapi, pisahkan ini ke folder components/ui nanti

const StatCard = ({ icon: Icon, label, value, trend }: any) => (
  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{trend}</span>}
      </div>
    </div>
  </div>
);

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider", className)}>
    {children}
  </span>
);

// --- MAIN COMPONENT ---

interface ChannelHubProps {
  channels: Channel[];
  projects: Project[];
  onSelectChannel: (channel: Channel) => void;
  onCreateNew: () => void;
  onDeleteChannel: (id: string) => void;
  language: Language;
}

export const ChannelHub: React.FC<ChannelHubProps> = ({ 
  channels, 
  projects,
  onSelectChannel, 
  onCreateNew,
  onDeleteChannel,
  language
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[language];

  // Filtering Logic
  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.niche.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [channels, searchTerm]);

  // Derived Stats
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

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HERO & STATS SECTION (Bento Grid Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Welcome Block */}
        <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Creator Command Center</h1>
            <p className="text-slate-400 max-w-md">
              Kelola semua niche kesehatan Anda dari satu tempat. AI siap membantu generate konten.
            </p>
          </div>
          <div className="relative z-10 mt-8">
             <button
              onClick={onCreateNew}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 w-fit shadow-lg shadow-emerald-900/20"
            >
              <Plus size={20} />
              {t.add_channel}
            </button>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Global Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={Layout} label="Active Channels" value={channels.length} trend="+1 New" />
          <StatCard icon={Video} label="Total Projects" value={projects.length} />
          <StatCard icon={Zap} label="Ideas & Drafts" value={totalDrafts} />
          <StatCard icon={Activity} label="Published" value={totalPublished} trend="Live" />
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search niche or channel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 px-4 text-sm text-slate-500 font-medium">
           <span>Sort by:</span>
           <select className="bg-transparent outline-none text-slate-900 font-bold cursor-pointer">
             <option>Last Updated</option>
             <option>A-Z</option>
             <option>Most Videos</option>
           </select>
        </div>
      </div>

      {/* 3. CHANNELS GRID */}
      {filteredChannels.length === 0 ? (
         <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
           <h3 className="text-xl font-bold text-slate-700">No channels found</h3>
           <p className="text-slate-400 mt-2">Try adjusting your search or create a new one.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => {
            const stats = getChannelStats(channel.id);
            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Badge className={cn(
                          channel.targetAge === 'Seniors' ? 'bg-purple-100 text-purple-700' :
                          channel.targetAge === 'Kids' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                       )}>
                         {channel.targetAge}
                       </Badge>
                       <span className="text-slate-300">•</span>
                       <span className="text-xs font-medium text-slate-500">{channel.niche}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {channel.name}
                    </h3>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('Delete channel?')) onDeleteChannel(channel.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Card Body (Stats) */}
                <div className="px-6 py-2 grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Videos</p>
                    <p className="text-lg font-bold text-slate-700">{stats.total}</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-emerald-600/70 uppercase font-bold">Live</p>
                    <p className="text-lg font-bold text-emerald-600">{stats.published}</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-center">
                     <p className="text-[10px] text-amber-600/70 uppercase font-bold">Drafts</p>
                     <p className="text-lg font-bold text-amber-600">{stats.drafts}</p>
                  </div>
                </div>

                <div className="px-6 py-4 flex-1">
                   <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                     {channel.description || "No description provided."}
                   </p>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Activity size={12} /> Last active: Today
                  </span>
                  <button className="text-sm font-bold text-slate-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Manage <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};