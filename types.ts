
export type AgeGroup = 'Kids' | 'Teens' | 'Adults' | 'Seniors';
export type Language = 'en' | 'id';
export type VideoDuration = 'short' | 'standard' | 'long';
export type GeminiModelId = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

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
  historyTopics?: string;
  savedWeeklyPlan?: WeeklyPlanItem[];
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

export interface Shot {
  shot_type: string;
  image_prompt: string;
}

export interface VisualScene {
  scene_text: string;
  shots: Shot[];
}

export interface PackagingData {
  titles: string[];
  description: string;
  hashtags: string[];
  tags: string;
  thumbnails: { concept: string; text: string; prompt: string }[];
}


// Tipe data untuk Jadwal Mingguan
export interface WeeklyPlanItem {
  day: string;
  type: string;
  title: string;
  hook: string;
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
  visualScenes?: VisualScene[];
  packaging?: PackagingData;
  weeklyPlan?: WeeklyPlanItem[]; // <-- WADAH BARU
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
  EXPORT = 'EXPORT',
  PUBLISH = 'PUBLISH'
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
