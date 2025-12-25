import { Channel, Project } from '../types';

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
    try {
      const data = localStorage.getItem(KEYS.CHANNELS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveChannels: (channels: Channel[]) => {
    localStorage.setItem(KEYS.CHANNELS, JSON.stringify(channels));
  },

  // --- Projects ---
  getProjects: (): Project[] => {
    try {
      const data = localStorage.getItem(KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveProjects: (projects: Project[]) => {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  },

  // --- API Keys ---
  getGeminiKey: (): string | null => {
    const key = localStorage.getItem(KEYS.GEMINI_KEY);
    return key ? key.trim() : null;
  },
  saveGeminiKey: (key: string) => {
    if (!key) {
      localStorage.removeItem(KEYS.GEMINI_KEY);
    } else {
      localStorage.setItem(KEYS.GEMINI_KEY, key.trim());
    }
  },

  getGroqKey: (): string | null => {
    const key = localStorage.getItem(KEYS.GROQ_KEY);
    return key ? key.trim() : null;
  },
  saveGroqKey: (key: string) => {
    if (!key) {
      localStorage.removeItem(KEYS.GROQ_KEY);
    } else {
      localStorage.setItem(KEYS.GROQ_KEY, key.trim());
    }
  },
  
  // --- Preferences ---
  getSelectedEngine: (): string => {
    return localStorage.getItem(KEYS.SELECTED_ENGINE) || 'gemini';
  },
  setSelectedEngine: (engine: string) => {
    localStorage.setItem(KEYS.SELECTED_ENGINE, engine);
  },

  // --- GEMINI MODEL (YANG TADI ERROR) ---
  getGeminiModel: (): string => {
    return localStorage.getItem(KEYS.GEMINI_MODEL) || 'gemini-3-flash-preview';
  },
  // FUNGSI INI YANG KURANG TADI 👇
  saveGeminiModel: (model: string) => {
    localStorage.setItem(KEYS.GEMINI_MODEL, model);
  },

  // --- FITUR BACKUP & RESTORE ---
  exportAllData: () => {
    const data = {
      channels: JSON.parse(localStorage.getItem(KEYS.CHANNELS) || '[]'),
      projects: JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]'),
      settings: {
        geminiKey: localStorage.getItem(KEYS.GEMINI_KEY) || '',
        groqKey: localStorage.getItem(KEYS.GROQ_KEY) || '',
        geminiModel: localStorage.getItem(KEYS.GEMINI_MODEL) || 'gemini-3-flash-preview',
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