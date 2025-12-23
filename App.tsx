import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChannelSetup } from './components/ChannelSetup';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ContentWorkflow } from './components/ContentWorkflow';
import { ChannelHub } from './components/ChannelHub';
import { Settings } from './components/Settings';
import { Channel, Project, ViewState, Language } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHANNEL_HUB);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  // --- INITIAL LOAD ---
  useEffect(() => {
    setChannels(storageService.getChannels());
    setProjects(storageService.getProjects());
    const savedLang = localStorage.getItem('health_creator_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  // --- DERIVED STATE ---
  const activeChannel = useMemo(() => 
    channels.find(c => c.id === activeChannelId) || null, 
    [channels, activeChannelId]
  );

  const filteredProjects = useMemo(() => 
    projects.filter(p => p.channelId === activeChannelId),
    [projects, activeChannelId]
  );

  // --- HANDLERS ---
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('health_creator_lang', lang);
  };

  const handleSaveChannel = (channelData: Channel) => {
    const existingIndex = channels.findIndex(c => c.id === channelData.id);
    let updatedChannels;
    if (existingIndex >= 0) {
      updatedChannels = [...channels];
      updatedChannels[existingIndex] = { ...channelData, createdAt: channels[existingIndex].createdAt };
    } else {
      updatedChannels = [{ ...channelData, createdAt: new Date().toISOString() }, ...channels];
    }
    setChannels(updatedChannels);
    storageService.saveChannels(updatedChannels);
    setActiveChannelId(channelData.id);
    setCurrentView(ViewState.PROJECT_LIST);
  };

  const handleDeleteChannel = (id: string) => {
    const updatedChannels = channels.filter(c => c.id !== id);
    const updatedProjects = projects.filter(p => p.channelId !== id);
    setChannels(updatedChannels);
    setProjects(updatedProjects);
    storageService.saveChannels(updatedChannels);
    storageService.saveProjects(updatedProjects);
    
    // Kalau channel yang lagi dibuka dihapus, balik ke Hub
    if (activeChannelId === id) {
      setActiveChannelId(null);
      setCurrentView(ViewState.CHANNEL_HUB);
    }
  };

  const handleResetData = () => {
    if(confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveProject = (title: string) => {
    if (!activeChannelId) return;
    const newProject: Project = {
      id: Date.now().toString(),
      channelId: activeChannelId,
      title,
      status: 'Idea',
      updatedAt: new Date().toLocaleDateString()
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    storageService.saveProjects(updated);
    // Balik ke dashboard project setelah save
    setCurrentView(ViewState.PROJECT_LIST);
  };

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    setCurrentView(ViewState.PROJECT_LIST);
  };

  const handleSwitchChannel = () => {
    setActiveChannelId(null);
    setCurrentView(ViewState.CHANNEL_HUB);
  };

  // --- VIEW ROUTING ---
  const renderView = () => {
    switch (currentView) {
      case ViewState.CHANNEL_HUB:
        return (
          <ChannelHub 
            channels={channels} 
            projects={projects}
            onSelectChannel={handleSelectChannel} 
            onCreateNew={() => setCurrentView(ViewState.CHANNEL_SETUP)}
            onDeleteChannel={handleDeleteChannel}
            language={language}
          />
        );
      case ViewState.CHANNEL_SETUP:
        return <ChannelSetup channel={activeChannel} onSave={handleSaveChannel} language={language} />;
      case ViewState.PROJECT_LIST:
        return activeChannel && (
          <ProjectDashboard 
            channel={activeChannel} 
            projects={filteredProjects} 
            onCreateNew={() => setCurrentView(ViewState.CONTENT_WORKFLOW)}
            language={language}
          />
        );
      case ViewState.CONTENT_WORKFLOW:
        return activeChannel && (
          <ContentWorkflow 
            channel={activeChannel} 
            onSaveProject={handleSaveProject}
            language={language}
          />
        );
      case ViewState.SETTINGS:
        return <Settings language={language} onResetData={handleResetData} />;
      default:
        return <div>View not found</div>;
    }
  };

  // --- RENDER UTAMA ---
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar (Hanya muncul kalau bukan di Channel Hub) */}
      {currentView !== ViewState.CHANNEL_HUB && (
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          activeChannel={activeChannel}
          onSwitchChannel={handleSwitchChannel}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      )}
      
      {/* Main Content Area */}
      <main 
        className={`flex-1 w-full min-h-screen transition-all duration-300 ease-in-out ${
          currentView === ViewState.CHANNEL_HUB ? 'ml-0 max-w-full' : 'ml-64'
        }`}
      >
        {/* Container Utama dengan Padding yang Lega */}
        <div className="p-6 md:p-8 lg:p-10 max-w-[1920px] mx-auto">
          {renderView()}
        </div>
      </main>
      
      {/* Floating Language Switcher (Khusus di Channel Hub) */}
      {currentView === ViewState.CHANNEL_HUB && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-2 bg-white/80 backdrop-blur p-1.5 rounded-xl border border-slate-200 shadow-xl">
           <button 
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${language === 'en' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-400'}`}
          >
            EN
          </button>
          <button 
            onClick={() => handleLanguageChange('id')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${language === 'id' ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-400'}`}
          >
            ID
          </button>
        </div>
      )}
    </div>
  );
};

export default App;