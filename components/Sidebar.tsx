import React from 'react';
import { ViewState, Channel, Language } from '../types';
import { 
  LayoutDashboard, 
  Bot, 
  Settings, 
  Edit3, 
  LogOut, 
  Activity 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  activeChannel: Channel | null;
  onSwitchChannel: () => void;
  // Props language dihapus/diabaikan karena sudah hardcode Indo
  language?: Language; 
  onLanguageChange?: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  activeChannel, 
  onSwitchChannel
}) => {
  
  // NAVIGASI FULL INDO
  const navItems = [
    { id: ViewState.PROJECT_LIST, label: 'Manajemen Proyek', icon: LayoutDashboard },
    { id: ViewState.CONTENT_WORKFLOW, label: 'Asisten AI', icon: Bot },
    { id: ViewState.CHANNEL_SETUP, label: 'Edit Channel', icon: Edit3 },
    { id: ViewState.SETTINGS, label: 'Pengaturan', icon: Settings },
  ];

  return (
    // PERUBAHAN PENTING: w-72 jadi w-64 (biar pas di layar 14 inch)
    <div className="w-64 h-screen bg-slate-950 text-slate-300 flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800">
      
      {/* Brand */}
      <div className="p-8 pb-6">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
            <Activity size={18} />
          </div>
          HealthCreator
        </h1>
        <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-widest uppercase ml-11">
          AI-Powered Studio
        </p>
      </div>

      {/* Active Channel Card */}
      {activeChannel && (
        <div className="px-4 mb-6">
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 backdrop-blur-sm shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Niche Aktif</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="font-bold text-white text-sm truncate mb-1">{activeChannel.name}</h3>
            <p className="text-xs text-slate-500 truncate mb-4 font-medium">{activeChannel.niche}</p>
            
            <button 
              onClick={onSwitchChannel}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-slate-300 group hover:text-white"
            >
              <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
              Ganti Channel
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
             <button
              key={item.id}
              onClick={() => activeChannel && setView(item.id)}
              disabled={!activeChannel}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-emerald-600/10 text-emerald-400" 
                  : !activeChannel
                    ? "opacity-40 cursor-not-allowed grayscale"
                    : "hover:bg-slate-900 hover:text-white text-slate-400"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-emerald-500 rounded-r-full" />
              )}
              <item.icon size={18} className={cn("transition-colors", isActive ? "text-emerald-500" : "group-hover:text-white")} />
              <span className="font-bold text-xs tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer (Versi Clean) */}
      <div className="p-6 border-t border-slate-800/50 bg-slate-950">
        <div className="flex flex-col items-center gap-2 text-slate-600">
           <span className="text-[10px] font-mono font-medium opacity-50">v1.0.0 Stable</span>
           <p className="text-[9px] text-slate-700 uppercase tracking-widest">Made for Creators</p>
        </div>
      </div>
    </div>
  );
};