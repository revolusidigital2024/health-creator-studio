export type AgeGroup = 'Kids' | 'Teens' | 'Adults' | 'Seniors';
export type Language = 'en' | 'id';
export type VideoDuration = 'short' | 'standard' | 'long';

// Update Model ID sesuai yang ada di Settings.tsx
export type GeminiModelId = 'gemini-1.5-flash' | 'gemini-1.5-pro';

export interface Channel {
  id: string;
  name: string;
  niche: string;
  targetAge: AgeGroup;
  description: string;
  createdAt: string;
}

export interface Project {
  id: string;
  channelId: string;
  title: string;
  status: 'Idea' | 'Drafting' | 'Editing' | 'Published';
  updatedAt: string;
}

export interface OutlineSection {
  section: string;
  points: string[];
  duration?: string;
  scriptSegment?: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  voiceStyle: string;
  icon?: string; // Tambahan buat icon persona
}

export interface ContentIdea {
  title: string;
  hook: string;
  outline: OutlineSection[];
  script: string;
  thumbnailSuggestion: string;
  audioCues: string;
  persona?: Persona;
}

export enum WorkflowStep {
  IDEATION = 'IDEATION',
  OUTLINING = 'OUTLINING',
  PERSONA = 'PERSONA',
  DRAFTING = 'DRAFTING',
  FINAL = 'FINAL'
}

export enum ViewState {
  CHANNEL_HUB = 'CHANNEL_HUB',
  CHANNEL_SETUP = 'CHANNEL_SETUP',
  PROJECT_LIST = 'PROJECT_LIST',
  CONTENT_WORKFLOW = 'CONTENT_WORKFLOW',
  SETTINGS = 'SETTINGS'
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'Google' | 'Groq' | 'Meta' | 'Mistral' | 'OpenAI' | 'Kimi';
  description: string;
  categories: string[];
  isAvailable: boolean;
}