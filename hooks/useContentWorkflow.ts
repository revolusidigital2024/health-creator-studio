// h:\FILE MENTAH\healthcreator-ai-assistant\hooks\useContentWorkflow.ts

import { useState, useEffect } from 'react';
import { Channel, ContentIdea, Language, VideoDuration, WorkflowStep, Persona, Project, WeeklyPlanItem } from '../types';
import { generateOutline, generateScriptSegment, generateWeeklyPlan as planGemini } from '../services/geminiService';
import { groqOutlineAdapter, generateWeeklyPlan as planGroq } from '../services/groqService';
import { storageService } from '../services/storageService';
import { VIDEO_FORMATS } from '../components/workflow/StepIdeation';

interface UseContentWorkflowProps {
  channel: Channel;
  onSaveProject: (data: any) => void;
  language: Language;
  onBack: () => void;
  initialData?: Project | null;
  existingTitles?: string[];
}

export const useContentWorkflow = ({
  channel,
  onSaveProject,
  language,
  onBack,
  initialData,
  existingTitles = []
}: UseContentWorkflowProps) => {
  const SESSION_KEY = `workflow_session_${channel.id}`;

  // --- STATE ---
  const [step, setStep] = useState<WorkflowStep>(WorkflowStep.IDEATION);
  const [topic, setTopic] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('list');
  const [duration, setDuration] = useState<VideoDuration>('standard');
  const [engine, setEngine] = useState(storageService.getSelectedEngine() || 'gemini');
  const [useWebSearch, setUseWebSearch] = useState(false);

  const [blueprint, setBlueprint] = useState<Partial<ContentIdea> | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[]>([]);

  const [maxStepReached, setMaxStepReached] = useState<WorkflowStep>(WorkflowStep.IDEATION);
  const [loading, setLoading] = useState(false);
  const [draftingIdx, setDraftingIdx] = useState<number | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // Helper Update Max Step
  const updateMaxStep = (newStep: WorkflowStep) => {
    const steps = Object.values(WorkflowStep);
    const currentMaxIdx = steps.indexOf(maxStepReached);
    const newStepIdx = steps.indexOf(newStep);
    if (newStepIdx > currentMaxIdx) setMaxStepReached(newStep);
    setStep(newStep);
  };

  // --- LOGIC HYDRATION ---
  useEffect(() => {
    if (initialData) {
      const d: any = initialData.data || {};
      setTopic(d.topic || initialData.title || '');
      setSelectedFormat(d.format || 'list');
      setBlueprint(d.blueprint || null);
      setSelectedPersona(d.persona || null);
      if (d.blueprint?.weeklyPlan) setWeeklyPlan(d.blueprint.weeklyPlan);

      if (d.step) {
        setStep(d.step as WorkflowStep);
        setMaxStepReached(d.step as WorkflowStep);
      } else if (d.blueprint && !d.persona) {
        setStep(WorkflowStep.OUTLINING);
        setMaxStepReached(WorkflowStep.OUTLINING);
      } else if (d.persona && !d.blueprint?.script) {
        setStep(WorkflowStep.DRAFTING);
        setMaxStepReached(WorkflowStep.DRAFTING);
      } else {
        setStep(WorkflowStep.IDEATION);
      }
      localStorage.removeItem(SESSION_KEY);
    } else {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setStep(parsed.step); setTopic(parsed.topic); setSelectedFormat(parsed.selectedFormat);
          setBlueprint(parsed.blueprint); setSelectedPersona(parsed.selectedPersona);
          if (parsed.blueprint?.weeklyPlan) setWeeklyPlan(parsed.blueprint.weeklyPlan);
          setMaxStepReached(parsed.step);
          setIsRestored(true);
          setTimeout(() => setIsRestored(false), 3000);
        } catch (e) { localStorage.removeItem(SESSION_KEY); }
      }
    }
  }, [initialData, SESSION_KEY]);

  // --- AUTO-SAVE SESSION ---
  useEffect(() => {
    if (loading || initialData) return;
    const sessionData = {
      step, topic, selectedFormat, blueprint, selectedPersona, weeklyPlan,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }, [step, topic, selectedFormat, blueprint, selectedPersona, weeklyPlan, loading, initialData, SESSION_KEY]);

  // --- HELPER SAVE (Updated with overrideBlueprint fix) ---
  const saveWork = (currentStep: WorkflowStep, extraData?: any, overrideBlueprint?: any) => {
    let updatedBlueprint: Partial<ContentIdea> = overrideBlueprint ? { ...overrideBlueprint } : { ...blueprint };
    if (weeklyPlan.length > 0 && !updatedBlueprint.weeklyPlan) updatedBlueprint.weeklyPlan = weeklyPlan;

    if (extraData && extraData.weeklyPlan) {
        updatedBlueprint.weeklyPlan = extraData.weeklyPlan;
        setWeeklyPlan(extraData.weeklyPlan);
    } else if (extraData && typeof extraData === 'string') {
        updatedBlueprint.ssmlScript = extraData;
    } else if (extraData && Array.isArray(extraData)) {
        updatedBlueprint.visualScenes = extraData;
    } else if (extraData && typeof extraData === 'object' && !Array.isArray(extraData)) {
        updatedBlueprint.packaging = extraData;
    }

    const projectData = { title: updatedBlueprint?.title || topic || 'Proyek Tanpa Judul', topic, format: selectedFormat, blueprint: updatedBlueprint, persona: selectedPersona, step: currentStep };
    onSaveProject(projectData);
    setBlueprint(updatedBlueprint);
    updateMaxStep(currentStep);
  };

  const handleClearSession = () => localStorage.removeItem(SESSION_KEY);
  const currentFormat = VIDEO_FORMATS.find(f => f.id === selectedFormat) || VIDEO_FORMATS[1];

  const handlePlanGenerated = async (strategy: 'mix' | 'focus', formatLabel: string) => {
    const focusFormat = strategy === 'focus' ? formatLabel : undefined;
    let newPlan;
    try {
      if (engine === 'gemini') {
        newPlan = await planGemini(channel.niche, channel.targetAge, 'id', focusFormat, existingTitles);
      } else {
        newPlan = await planGroq(channel.niche, channel.targetAge, 'id', focusFormat);
      }

      if (newPlan && newPlan.length > 0) {
        setWeeklyPlan(newPlan);
        saveWork(step, { weeklyPlan: newPlan });
      }
    } catch (e) {
      console.error(e);
      alert("Gagal membuat jadwal.");
    }
  };

  const startBlueprint = async (topicOverride?: string) => {
    const finalTopic = topicOverride || topic;
    const promptTopic = `[Format: ${currentFormat.label}] ${finalTopic}`;
    if (!finalTopic) return;
    setLoading(true);
    if(topicOverride) setTopic(topicOverride);
    try {
      let data;
      if (engine === 'groq') {
        data = await groqOutlineAdapter(finalTopic, channel.targetAge, channel.niche, language, duration);
      } else {
        data = await generateOutline(finalTopic, channel.targetAge, channel.niche, language, duration);
      }
      setBlueprint(data);
      setStep(WorkflowStep.OUTLINING);
      saveWork(WorkflowStep.OUTLINING, null, data);
    } catch (e: any) { alert(`Gagal Generate (${engine}): ${e.message}`); } finally { setLoading(false); }
  };

  const generateSegment = async (idx: number) => {
    if (!blueprint || !selectedPersona || !blueprint.outline) return;
    setDraftingIdx(idx);
    try {
      const doctorName = channel.doctorProfile?.name || "Dokter";
      const segment = await generateScriptSegment(topic, blueprint.outline[idx], selectedPersona, channel.targetAge, language, doctorName, blueprint.hook || '');
      const newOutline = [...blueprint.outline];
      newOutline[idx].scriptSegment = segment;
      const newBlueprint = { ...blueprint, outline: newOutline };
      setBlueprint(newBlueprint);
      saveWork(WorkflowStep.DRAFTING, null, newBlueprint); // Fix: Pass newBlueprint directly
    } catch (e: any) { alert(`Gagal menulis: ${e.message}.`); } finally { setDraftingIdx(null); }
  };

  const handleSmartBack = () => {
    switch (step) {
      case WorkflowStep.PUBLISH: setStep(WorkflowStep.EXPORT); break;
      case WorkflowStep.EXPORT: setStep(WorkflowStep.SSML); break;
      case WorkflowStep.SSML: setStep(WorkflowStep.VISUALS); break;
      case WorkflowStep.VISUALS: setStep(WorkflowStep.FINAL); break;
      case WorkflowStep.FINAL: setStep(WorkflowStep.DRAFTING); break;
      case WorkflowStep.DRAFTING: setStep(WorkflowStep.PERSONA); break;
      case WorkflowStep.PERSONA: setStep(WorkflowStep.OUTLINING); break;
      case WorkflowStep.OUTLINING: setStep(WorkflowStep.IDEATION); break;
      default: onBack(); break;
    }
  };

  const handleFinalSaveAndExit = () => {
    saveWork(WorkflowStep.PUBLISH);
    if (!initialData) handleClearSession();
    alert('Proyek SELESAI & disimpan! Siap Upload.');
    onBack();
  };

  return {
    // State
    step, setStep,
    topic, setTopic,
    selectedFormat, setSelectedFormat,
    duration, setDuration,
    engine, setEngine,
    useWebSearch, setUseWebSearch,
    blueprint, setBlueprint,
    selectedPersona, setSelectedPersona,
    weeklyPlan, setWeeklyPlan,
    maxStepReached,
    loading,
    draftingIdx,
    isRestored,
    currentFormat,

    // Actions
    handlePlanGenerated,
    startBlueprint,
    generateSegment,
    handleSmartBack,
    handleFinalSaveAndExit,
    saveWork,
    handleClearSession
  };
};
