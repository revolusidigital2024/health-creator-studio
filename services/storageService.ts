import { Channel, Project } from '../types';

const KEYS = {
  CHANNELS: 'health_creator_channels',
  PROJECTS: 'health_creator_projects',
  GEMINI_KEY: 'health_creator_gemini_key',
  GROQ_KEY: 'health_creator_groq_key',
  SELECTED_ENGINE: 'health_creator_selected_engine'
};

export const storageService = {
  // --- Channels ---
  getChannels: (): Channel[] => {
    const data = localStorage.getItem(KEYS.CHANNELS);
    return data ? JSON.parse(data) : [];
  },
  saveChannels: (channels: Channel[]) => {
    localStorage.setItem(KEYS.CHANNELS, JSON.stringify(channels));
  },

  // --- Projects ---
  getProjects: (): Project[] => {
    const data = localStorage.getItem(KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },
  saveProjects: (projects: Project[]) => {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  },

  // --- API Keys ---
  getGeminiKey: (): string | null => {
    return localStorage.getItem(KEYS.GEMINI_KEY);
  },
  saveGeminiKey: (key: string) => {
    localStorage.setItem(KEYS.GEMINI_KEY, key);
  },

  getGroqKey: (): string | null => {
    return localStorage.getItem(KEYS.GROQ_KEY);
  },
  saveGroqKey: (key: string) => {
    localStorage.setItem(KEYS.GROQ_KEY, key);
  },
  
  // --- Preferences ---
  getSelectedEngine: (): string => {
    return localStorage.getItem(KEYS.SELECTED_ENGINE) || 'gemini';
  },
  setSelectedEngine: (engine: string) => {
    localStorage.setItem(KEYS.SELECTED_ENGINE, engine);
  }
};