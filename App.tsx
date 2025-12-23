import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChannelSetup } from './components/ChannelSetup';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ContentWorkflow } from './components/ContentWorkflow';
import { ChannelHub } from './components/ChannelHub';
import { Settings } from './components/Settings';
import { Channel, Project, ViewState } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHANNEL_HUB);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  
  // State untuk menyimpan proyek yang sedang diedit (Hydration Data)
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    setChannels(storageService.getChannels());
    setProjects(storageService.getProjects());
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

  // 1. SAVE CHANNEL
  const handleSaveChannel = (channelData: Channel) => {
    const existingIndex = channels.findIndex(c => c.id === channelData.id);
    let updatedChannels;
    
    if (existingIndex >= 0) {
      // Edit Channel Lama
      updatedChannels = [...channels];
      updatedChannels[existingIndex] = { ...channelData, createdAt: channels[existingIndex].createdAt };
    } else {
      // Buat Channel Baru
      updatedChannels = [{ ...channelData, createdAt: new Date().toISOString() }, ...channels];
    }
    
    setChannels(updatedChannels);
    storageService.saveChannels(updatedChannels);
    setActiveChannelId(channelData.id);
    setCurrentView(ViewState.PROJECT_LIST);
  };

  // 2. DELETE CHANNEL
  const handleDeleteChannel = (id: string) => {
    const updatedChannels = channels.filter(c => c.id !== id);
    const updatedProjects = projects.filter(p => p.channelId !== id);
    setChannels(updatedChannels);
    setProjects(updatedProjects);
    storageService.saveChannels(updatedChannels);
    storageService.saveProjects(updatedProjects);
    
    if (activeChannelId === id) {
      setActiveChannelId(null);
      setCurrentView(ViewState.CHANNEL_HUB);
    }
  };

  // 3. RESET DATA (FACTORY RESET)
  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // 4. SAVE PROJECT (Handle New & Edit Logic)
  const handleSaveProject = (projectData: any) => {
    if (!activeChannelId) return;

    const timestamp = new Date().toLocaleDateString();
    let updatedProjects = [...projects];

    if (editingProject) {
      // UPDATE EXISTING PROJECT
      updatedProjects = projects.map(p => 
        p.id === editingProject.id 
          ? { 
              ...p, 
              title: projectData.title, 
              updatedAt: timestamp, 
              status: projectData.step === 'FINAL' ? 'Published' : 'Drafting',
              data: projectData // Simpan isi otak AI
            } 
          : p
      );
      // Update state editingProject agar sinkron
      setEditingProject({
         ...editingProject,
         title: projectData.title,
         data: projectData
      });
    } else {
      // CREATE NEW PROJECT
      const newProject: Project = {
        id: Date.now().toString(),
        channelId: activeChannelId,
        title: projectData.title,
        status: 'Idea',
        updatedAt: timestamp,
        data: projectData
      };
      updatedProjects = [newProject, ...projects];
      
      // Set sebagai editing project supaya save berikutnya tidak membuat duplikat
      setEditingProject(newProject);
    }

    setProjects(updatedProjects);
    storageService.saveProjects(updatedProjects);
  };

  // 5. MANAGE PROJECT (Load Data ke Studio)
  const handleManageProject = (project: Project) => {
    setEditingProject(project); // Load data
    setCurrentView(ViewState.CONTENT_WORKFLOW); // Buka studio
  };

  // 6. NAVIGATION HANDLERS
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    setCurrentView(ViewState.PROJECT_LIST);
  };

  const handleSwitchChannel = () => {
    setActiveChannelId(null);
    setCurrentView(ViewState.CHANNEL_HUB);
  };

  // --- ROUTING / RENDER VIEW ---
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
            // Prop 'language' sudah dihapus
          />
        );

      case ViewState.CHANNEL_SETUP:
        return (
          <ChannelSetup 
            channel={activeChannel} 
            onSave={handleSaveChannel}
            // Logic Cancel: Kalau lagi edit channel (ada activeChannel), balik ke Project List.
            // Kalau lagi bikin baru, balik ke Hub.
            onCancel={() => {
              if (activeChannelId) {
                setCurrentView(ViewState.PROJECT_LIST);
              } else {
                setCurrentView(ViewState.CHANNEL_HUB);
              }
            }}
            // Prop 'language' sudah dihapus
          />
        );

      case ViewState.PROJECT_LIST:
        return activeChannel && (
          <ProjectDashboard 
            channel={activeChannel} 
            projects={filteredProjects} 
            onCreateNew={() => {
              setEditingProject(null); // Reset data untuk proyek baru
              setCurrentView(ViewState.CONTENT_WORKFLOW);
            }}
            onBack={() => {
              setActiveChannelId(null);
              setCurrentView(ViewState.CHANNEL_HUB);
            }}
            onManageProject={handleManageProject} // Sambungkan tombol Kelola
            // Prop 'language' sudah dihapus
          />
        );

      case ViewState.CONTENT_WORKFLOW:
        return activeChannel && (
          <ContentWorkflow 
            channel={activeChannel} 
            onSaveProject={handleSaveProject}
            language="id" // String hardcode biar aman
            onBack={() => {
              setEditingProject(null); // Clear editing state saat keluar
              setCurrentView(ViewState.PROJECT_LIST);
            }}
            initialData={editingProject} // Kirim data proyek lama (jika ada)
          />
        );

      case ViewState.SETTINGS:
        return <Settings onResetData={handleResetData} />; // Prop 'language' sudah dihapus

      default:
        return <div>Halaman tidak ditemukan</div>;
    }
  };

  // --- MAIN RENDER ---
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      {currentView !== ViewState.CHANNEL_HUB && (
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          activeChannel={activeChannel}
          onSwitchChannel={handleSwitchChannel}
        />
      )}
      
      {/* Main Content Area */}
      <main 
        className={`flex-1 w-full min-h-screen transition-all duration-300 ease-in-out ${
          currentView === ViewState.CHANNEL_HUB ? 'ml-0 max-w-full' : 'ml-64'
        }`}
      >
        <div className="p-6 md:p-8 lg:p-10 max-w-[1920px] mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;