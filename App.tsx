import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChannelSetup } from './components/ChannelSetup';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ContentWorkflow } from './components/ContentWorkflow';
import { ChannelHub } from './components/ChannelHub';
import { Settings } from './components/Settings';
import { Channel, Project, ViewState, WorkflowStep } from './types'; 
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.CHANNEL_HUB);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    setChannels(storageService.getChannels());
    setProjects(storageService.getProjects());
  }, []);

  const activeChannel = useMemo(() => 
    channels.find(c => c.id === activeChannelId) || null, 
    [channels, activeChannelId]
  );

  const filteredProjects = useMemo(() => 
    projects.filter(p => p.channelId === activeChannelId),
    [projects, activeChannelId]
  );

  // --- HANDLERS (Tetap Sama) ---
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
    if (activeChannelId === id) {
      setActiveChannelId(null);
      setCurrentView(ViewState.CHANNEL_HUB);
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSaveProject = (projectData: any) => {
    if (!activeChannelId) return;

    const timestamp = new Date().toLocaleDateString();
    
    let newStatus: 'Idea' | 'Drafting' | 'Published' = 'Drafting';
    if (projectData.step === WorkflowStep.PUBLISH) newStatus = 'Published'; 
    else if (projectData.step === WorkflowStep.IDEATION) newStatus = 'Idea';
    else newStatus = 'Drafting'; 

    let updatedProjects = [...projects];

    if (editingProject) {
      updatedProjects = projects.map(p => 
        p.id === editingProject.id 
          ? { ...p, title: projectData.title, updatedAt: timestamp, status: newStatus, data: projectData } 
          : p
      );
      setEditingProject({ ...editingProject, title: projectData.title, status: newStatus, data: projectData });
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        channelId: activeChannelId,
        title: projectData.title,
        status: 'Idea',
        updatedAt: timestamp,
        data: projectData
      };
      updatedProjects = [newProject, ...projects];
      setEditingProject(newProject);
    }

    setProjects(updatedProjects);
    storageService.saveProjects(updatedProjects);
  };

  const handleManageProject = (project: Project) => {
    setEditingProject(project); 
    setCurrentView(ViewState.CONTENT_WORKFLOW); 
  };

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    setCurrentView(ViewState.PROJECT_LIST);
  };

  const handleSwitchChannel = () => {
    setActiveChannelId(null);
    setCurrentView(ViewState.CHANNEL_HUB);
  };

  // --- RENDER VIEW ---
  const renderView = () => {
    switch (currentView) {
      case ViewState.CHANNEL_HUB:
        return <ChannelHub channels={channels} projects={projects} onSelectChannel={handleSelectChannel} onCreateNew={() => setCurrentView(ViewState.CHANNEL_SETUP)} onDeleteChannel={handleDeleteChannel} />;
      case ViewState.CHANNEL_SETUP:
        return <ChannelSetup channel={activeChannel} onSave={handleSaveChannel} onCancel={() => activeChannelId ? setCurrentView(ViewState.PROJECT_LIST) : setCurrentView(ViewState.CHANNEL_HUB)} />;
      case ViewState.PROJECT_LIST:
        return activeChannel && <ProjectDashboard channel={activeChannel} projects={filteredProjects} onCreateNew={() => { setEditingProject(null); setCurrentView(ViewState.CONTENT_WORKFLOW); }} onBack={() => { setActiveChannelId(null); setCurrentView(ViewState.CHANNEL_HUB); }} onManageProject={handleManageProject} />;
      case ViewState.CONTENT_WORKFLOW:
        // AMBIL SEMUA JUDUL YANG SUDAH ADA
        const existingTitles = filteredProjects.map(p => p.title);
        
        return activeChannel && (
          <ContentWorkflow 
            channel={activeChannel} 
            onSaveProject={handleSaveProject}
            language="id"
            onBack={() => { setEditingProject(null); setCurrentView(ViewState.PROJECT_LIST); }}
            initialData={editingProject} 
            existingTitles={existingTitles} // KIRIM KE WORKFLOW
          />
        );
      case ViewState.SETTINGS:
        return <Settings onResetData={handleResetData} />;
      default:
        return <div>Halaman tidak ditemukan</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentView !== ViewState.CHANNEL_HUB && <Sidebar currentView={currentView} setView={setCurrentView} activeChannel={activeChannel} onSwitchChannel={handleSwitchChannel} />}
      <main className={`flex-1 w-full min-h-screen transition-all duration-300 ease-in-out ${currentView === ViewState.CHANNEL_HUB ? 'ml-0 max-w-full' : 'ml-64'}`}>
        <div className="p-6 md:p-8 lg:p-10 max-w-[1920px] mx-auto">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;