
import { Channel, Project, GeminiModelId } from '../types';

const KEYS = {
  CHANNELS: 'health_creator_channels',
  PROJECTS: 'health_creator_projects',
  GEMINI_KEY: 'health_creator_gemini_key',
  GROQ_KEY: 'health_creator_groq_key',
  SELECTED_ENGINE: 'health_creator_selected_engine',
  GEMINI_MODEL: 'health_creator_gemini_model'
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

  // --- API Keys & Config ---
  getGeminiKey: (): string | null => {
    return localStorage.getItem(KEYS.GEMINI_KEY);
  },
  saveGeminiKey: (key: string) => {
    localStorage.setItem(KEYS.GEMINI_KEY, key);
  },

  getGeminiModel: (): GeminiModelId => {
    // Fixed: Changed default value to 'gemini-3-flash' to match GeminiModelId type
    return (localStorage.getItem(KEYS.GEMINI_MODEL) as GeminiModelId) || 'gemini-3-flash-preview';
  },
  saveGeminiModel: (model: GeminiModelId) => {
    localStorage.setItem(KEYS.GEMINI_MODEL, model);
  },

  getGroqKey: (): string | null => {
    return localStorage.getItem(KEYS.GROQ_KEY);
  },
  saveGroqKey: (key: string) => {
    localStorage.setItem(KEYS.GROQ_KEY, key);
  },
  
  getSelectedEngine: (): string => {
    return localStorage.getItem(KEYS.SELECTED_ENGINE) || 'gemini';
  },
  setSelectedEngine: (engine: string) => {
    localStorage.setItem(KEYS.SELECTED_ENGINE, engine);
  },

  // --- BACKUP & RESTORE ---
  exportAllData: () => {
    const data = {
      channels: JSON.parse(localStorage.getItem(KEYS.CHANNELS) || '[]'),
      projects: JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]'),
      settings: {
        geminiKey: localStorage.getItem(KEYS.GEMINI_KEY) || '',
        groqKey: localStorage.getItem(KEYS.GROQ_KEY) || '',
        // Fixed: Changed default value to 'gemini-3-flash' to match GeminiModelId type
        geminiModel: localStorage.getItem(KEYS.GEMINI_MODEL) || 'gemini-3-flash',
        engine: localStorage.getItem(KEYS.SELECTED_ENGINE) || 'gemini'
      },
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        appName: 'HealthCreator'
      }
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.channels) || !Array.isArray(data.projects)) {
        throw new Error("Format file backup tidak valid.");
      }
      localStorage.setItem(KEYS.CHANNELS, JSON.stringify(data.channels));
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(data.projects));
      if (data.settings) {
        if (data.settings.geminiKey) localStorage.setItem(KEYS.GEMINI_KEY, data.settings.geminiKey);
        if (data.settings.groqKey) localStorage.setItem(KEYS.GROQ_KEY, data.settings.groqKey);
        if (data.settings.geminiModel) localStorage.setItem(KEYS.GEMINI_MODEL, data.settings.geminiModel);
        if (data.settings.engine) localStorage.setItem(KEYS.SELECTED_ENGINE, data.settings.engine);
      }
      return true;
    } catch (e) {
      console.error("Import Failed:", e);
      return false;
    }
  }
};
