import React from 'react';
import { Project, Channel } from '../types';
import { 
  Video, Calendar, Filter, Plus, TrendingUp, Search, 
  ArrowLeft, LayoutGrid, List, MoreHorizontal, Clock, Edit, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProjectDashboard, calculateQualityScore } from '../hooks/useProjectDashboard';

interface ProjectDashboardProps {
  channel: Channel;
  projects: Project[];
  onCreateNew: () => void;
  onBack: () => void;
  onManageProject: (project: Project) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ 
  channel, projects, onCreateNew, onBack, onManageProject 
}) => {
  // --- USE CUSTOM HOOK ---
  const {
    viewMode, setViewMode,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    filteredProjects,
    authorityScore
  } = useProjectDashboard(projects);

  // --- HELPER: KANBAN COLUMNS ---
  const columns = {
    Idea: filteredProjects.filter(p => p.status === 'Idea'),
    Drafting: filteredProjects.filter(p => p.status === 'Drafting'),
    Editing: filteredProjects.filter(p => p.status === 'Editing'),
    Published: filteredProjects.filter(p => p.status === 'Published'),
  };

  return (
    <div className="max-w-[1920px] mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all group"
             title="Kembali ke Daftar Channel"
           >
             <ArrowLeft size={20} className="text-slate-400 group-hover:text-slate-900" />
           </button>

           <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                 <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">Workspace Aktif</span>
                 <span className="text-[10px] text-slate-300">/</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{channel.niche}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Proyek</h2>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <List size={18} />
              </button>
              <button onClick={() => setViewMode('board')} className={cn("p-2 rounded-lg transition-all", viewMode === 'board' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                <LayoutGrid size={18} />
              </button>
           </div>

           <button
             onClick={onCreateNew}
             className="flex-1 md:flex-none bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
           >
             <Plus size={18} />
             Video Baru
           </button>
        </div>
      </div>

      {/* STATS REAL-TIME */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] text-white relative overflow-hidden flex items-center justify-between shadow-lg">
             <div>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Skor Otoritas</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{authorityScore}</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
             </div>
             <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <TrendingUp className="text-emerald-400" size={24} />
             </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center justify-between shadow-sm hover:border-emerald-200 transition-colors">
             <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Koleksi</p>
                <span className="text-4xl font-black text-slate-800">{projects.length}</span>
             </div>
             <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <Video size={24} />
             </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center justify-between shadow-sm hover:border-amber-200 transition-colors">
             <div>
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Dalam Pengerjaan</p>
                <span className="text-4xl font-black text-slate-800">
                  {projects.filter(p => p.status !== 'Published').length}
                </span>
             </div>
             <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <Clock size={24} />
             </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
           <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6 bg-slate-50/30">
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                {['All', 'Idea', 'Published'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={cn("flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-xl transition-all", activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600')}>
                    {tab === 'All' ? 'Semua' : tab === 'Idea' ? 'Draf' : 'Tayang'}
                  </button>
                ))}
              </div>
              <div className="flex-1 w-full" />
              <div className="relative w-full sm:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input type="text" placeholder="Cari judul proyek..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" />
              </div>
           </div>

           <div className="flex-1 relative">
             {filteredProjects.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                    <Video className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1 text-lg">{searchQuery ? 'Tidak ditemukan' : 'Belum ada proyek'}</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">{searchQuery ? 'Coba kata kunci lain.' : 'Workspace ini masih bersih. Mulai dengan membuat skrip video baru.'}</p>
                  {!searchQuery && <button onClick={onCreateNew} className="px-8 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-colors">+ Buat Skrip Pertama</button>}
                </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                       <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/2">Konsep Video</th>
                       <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor Kualitas</th>
                       <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredProjects.map((project) => {
                       const score = calculateQualityScore(project);
                       return (
                         <tr key={project.id} className="hover:bg-slate-50 transition-colors group cursor-default">
                           <td className="px-8 py-6">
                             <div className="font-bold text-base text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">{project.title}</div>
                             <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-bold"><Calendar size={12} /> <span>Diperbarui: {project.updatedAt}</span></div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border", 
                                project.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                project.status === 'Drafting' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                              )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", 
                                  project.status === 'Published' ? 'bg-emerald-500' : 
                                  project.status === 'Drafting' ? 'bg-blue-500' : 'bg-amber-500'
                                )} />
                                {project.status === 'Idea' ? 'Ide' : project.status === 'Drafting' ? 'Draf' : 'Tayang'}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={cn("h-full rounded-full transition-all duration-500", 
                                        score >= 100 ? "bg-emerald-500" : 
                                        score >= 50 ? "bg-amber-500" : "bg-red-500"
                                      )} 
                                      style={{ width: `${score}%` }} 
                                    />
                                 </div>
                                 <span className="text-xs font-black text-slate-700">{score}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                             <button onClick={() => onManageProject(project)} className="text-slate-400 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-emerald-200 hover:shadow-sm font-bold text-[10px] uppercase tracking-wider transition-all px-4 py-2 rounded-xl flex items-center gap-2 ml-auto">
                               <Edit size={14} /> Kelola
                             </button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full items-start">
           {Object.entries(columns).map(([status, items]) => (
             <div key={status} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                     {status === 'Idea' ? 'Ide Mentah' : status === 'Drafting' ? 'Penulisan' : status === 'Editing' ? 'Produksi' : 'Siap Tayang'}
                   </h3>
                   <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="space-y-3">
                   {items.length === 0 && <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Kosong</div>}
                   {items.map(project => (
                     <div key={project.id} onClick={() => onManageProject(project)} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group">
                        <div className="flex justify-between items-start mb-3">
                           <span className={cn("w-2 h-2 rounded-full", project.status === 'Published' ? 'bg-emerald-500' : project.status === 'Drafting' ? 'bg-blue-500' : 'bg-amber-500')} />
                           <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                        </div>
                        <h4 className="font-bold text-slate-800 leading-snug mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors">{project.title}</h4>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                           <span className="flex items-center gap-1"><Calendar size={10}/> {project.updatedAt}</span>
                           <span className={cn(calculateQualityScore(project) >= 100 ? "text-emerald-600" : "text-slate-400")}>{calculateQualityScore(project)}%</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};