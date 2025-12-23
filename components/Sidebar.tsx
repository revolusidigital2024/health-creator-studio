import React from 'react';
import { ViewState, Channel, Language } from '../types';
import { translations } from '../services/translations';
import { 
  LayoutDashboard, 
  Bot, 
  Settings, 
  Edit3, 
  LogOut, 
  Languages, 
  Activity 
} from 'lucide-react';
import { cn } from '../lib/utils'; // Pastikan utils.ts ada, atau hapus cn() dan pakai string biasa

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  activeChannel: Channel | null;
  onSwitchChannel: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  activeChannel, 
  onSwitchChannel,
  language,
  onLanguageChange
}) => {
  const t = translations[language];

  const navItems = [
    { id: ViewState.PROJECT_LIST, label: t.projects, icon: LayoutDashboard },
    { id: ViewState.CONTENT_WORKFLOW, label: t.ai_assistant, icon: Bot },
    { id: ViewState.CHANNEL_SETUP, label: t.edit_channel, icon: Edit3 },
    { id: ViewState.SETTINGS, label: t.settings, icon: Settings },
  ];

  return (
    <div className="w-72 h-screen bg-slate-950 text-slate-300 flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800">
      {/* Brand */}
      <div className="p-8 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Activity size={18} />
          </div>
          HealthCreator
        </h1>
        <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">AI-POWERED STUDIO</p>
      </div>

      {/* Active Channel Card */}
      {activeChannel && (
        <div className="px-6 mb-8">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Niche</span>
              <span className={`w-2 h-2 rounded-full ${activeChannel ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            </div>
            <h3 className="font-bold text-white text-md truncate mb-1">{activeChannel.name}</h3>
            <p className="text-xs text-slate-500 truncate mb-4">{activeChannel.niche}</p>
            
            <button 
              onClick={onSwitchChannel}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-slate-300 group"
            >
              <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
              {t.switch_channel}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
             <button
              key={item.id}
              onClick={() => activeChannel && setView(item.id)}
              disabled={!activeChannel}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : !activeChannel
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-slate-900 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
              )}
              <item.icon size={20} className={isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-300"} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Language */}
      <div className="p-6 border-t border-slate-800/50 bg-slate-950">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 mb-4">
          {(['en', 'id'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-black rounded-md transition-all uppercase",
                language === lang 
                  ? "bg-slate-700 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-slate-600">
           <div className="p-1.5 bg-slate-900 rounded-md border border-slate-800">
             <Languages size={14} />
           </div>
           <span className="text-[10px] font-mono">v2.5.0-beta</span>
        </div>
      </div>
    </div>
  );
};