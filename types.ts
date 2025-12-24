export type AgeGroup = 'Kids' | 'Teens' | 'Adults' | 'Seniors';
export type Language = 'en' | 'id';
export type VideoDuration = 'short' | 'standard' | 'long';
export type GeminiModelId = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface DoctorProfile {
  name: string;
  gender: 'Male' | 'Female';
  age: string;
  appearance: string;
  outfit: string;
  voiceType: string;
}

export interface Channel {
  id: string;
  name: string;
  niche: string;
  targetAge: AgeGroup;
  description: string;
  createdAt: string;
  doctorProfile?: DoctorProfile; 
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
  icon?: string;
  bestFor?: string[];
}

// Tipe data untuk Visual Scene
export interface VisualScene {
  scene_text: string;
  image_prompt: string;
}

export interface ContentIdea {
  title: string;
  hook: string;
  outline: OutlineSection[];
  script: string;
  thumbnailSuggestion: string;
  audioCues: string;
  persona?: Persona;
  ssmlScript?: string;
  visualScenes?: VisualScene[]; // <-- TAMBAHAN: Tempat nyimpen storyboard
}

export interface Project {
  id: string;
  channelId: string;
  title: string;
  status: 'Idea' | 'Drafting' | 'Editing' | 'Published';
  updatedAt: string;
  
  data?: {
    topic: string;
    format: string;
    blueprint?: Partial<ContentIdea> | null;
    persona?: Persona | null;
    step: string;
  };
}

export interface SSMLInstruction {
  type: 'break' | 'emphasis' | 'pitch';
  value: string;
  startIndex: number;
  endIndex: number;
}

export enum WorkflowStep {
  IDEATION = 'IDEATION',
  OUTLINING = 'OUTLINING',
  PERSONA = 'PERSONA',
  DRAFTING = 'DRAFTING',
  FINAL = 'FINAL',
  VISUALS = 'VISUALS',
  SSML = 'SSML',
  EXPORT = 'EXPORT'
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