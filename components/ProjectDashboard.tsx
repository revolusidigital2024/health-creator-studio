import React, { useState } from 'react';
import { Project, Channel, Language } from '../types';
import { translations } from '../services/translations';
import { Video, Calendar, Filter, Plus, TrendingUp, Search } from 'lucide-react';

interface ProjectDashboardProps {
  channel: Channel;
  projects: Project[];
  onCreateNew: () => void;
  language: Language;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ channel, projects, onCreateNew, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'All' | 'Idea' | 'Published'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic: Tab + Search
  const filteredProjects = projects.filter(p => {
    const matchesTab = activeTab === 'All' ? true : p.status === activeTab || (activeTab === 'Idea' && p.status !== 'Published');
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. TOP BAR: Breadcrumbs + Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-slate-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">Workspace</span>
              <span className="text-[10px] text-slate-300">/</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{channel.niche}</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.video_projects}</h2>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-200 hover:shadow-emerald-200 text-sm"
        >
          <Plus size={18} />
          {t.new_video}
        </button>
      </div>

      {/* 2. STATS OVERVIEW (Compact & Horizontal) */}
      {/* Kita ganti Radar dengan Quick Stats yang lebih relevan buat manajemen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Authority (Tetap ada buat keren-kerenan/gamification) */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white relative overflow-hidden flex items-center justify-between shadow-md">
             <div>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Authority Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">84</span>
                  <span className="text-slate-400 text-xs">/100</span>
                </div>
             </div>
             <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                <TrendingUp className="text-emerald-400" size={20} />
             </div>
        </div>

        {/* Card 2: Total Projects */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
             <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Library</p>
                <span className="text-3xl font-bold text-slate-800">{projects.length}</span>
             </div>
             <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                <Video className="text-slate-400" size={20} />
             </div>
        </div>

        {/* Card 3: Pending/Idea */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
             <div>
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Drafts & Ideas</p>
                <span className="text-3xl font-bold text-slate-800">
                  {projects.filter(p => p.status !== 'Published').length}
                </span>
             </div>
             <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Filter className="text-amber-500" size={20} />
             </div>
        </div>
      </div>

      {/* 3. MAIN PROJECT TABLE (The Hero) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         
         {/* Toolbar: Tabs & Search */}
         <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/30">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              {['All', 'Idea', 'Published'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 w-full" />

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                 type="text" 
                 placeholder="Search projects..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
               />
            </div>
         </div>

         {/* Table Content */}
         <div className="flex-1 relative">
           {filteredProjects.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Video className="text-slate-300" size={24} />
                </div>
                <h3 className="text-slate-800 font-bold mb-1">
                  {searchQuery ? 'No matching projects' : 'No projects yet'}
                </h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto">
                  {searchQuery ? 'Try a different keyword' : 'Your workspace is fresh. Start by creating a new video script.'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={onCreateNew}
                    className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors"
                  >
                    + Generate First Script
                  </button>
                )}
              </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-slate-50/50 border-b border-slate-100">
                   <tr>
                     <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/2">Video Concept</th>
                     <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Score</th>
                     <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredProjects.map((project) => (
                     <tr key={project.id} className="hover:bg-slate-50 transition-colors group cursor-default">
                       <td className="px-6 py-4">
                         <div className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">{project.title}</div>
                         <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                           <Calendar size={10} /> 
                           <span>Last updated: {project.updatedAt}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            project.status === 'Published' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {project.status}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: '85%' }} />
                             </div>
                             <span className="text-[10px] font-bold text-slate-700">85</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button className="text-slate-400 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm font-bold text-[10px] uppercase tracking-wider transition-all px-3 py-1.5 rounded-lg">
                           Manage
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};