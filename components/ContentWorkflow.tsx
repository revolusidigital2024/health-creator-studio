import React, { useState, useEffect } from 'react';
import { Channel, ContentIdea, Language, VideoDuration, WorkflowStep, Persona, GeminiModelId, Project, WeeklyPlanItem } from '../types';
import { generateOutline, generateScriptSegment, generateWeeklyPlan as planGemini } from '../services/geminiService';
import { groqOutlineAdapter, generateWeeklyPlan as planGroq } from '../services/groqService';
import { storageService } from '../services/storageService';
import { RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

// --- IMPORT SEMUA MODUL ---
import { WorkflowHeader } from './workflow/WorkflowHeader';
import { WorkflowProgress } from './workflow/WorkflowProgress';
import { StepIdeation, VIDEO_FORMATS } from './workflow/StepIdeation';
import { StepOutline } from './workflow/StepOutline';
import { StepPersona } from './workflow/StepPersona';
import { StepDrafting } from './workflow/StepDrafting';
import { StepVisuals } from './workflow/StepVisuals'; 
import { StepSSML } from './workflow/StepSSML'; 
import { StepExport } from './workflow/StepExport';
import { StepPublish } from './workflow/StepPublish';

interface ContentWorkflowProps {
  channel: Channel;
  onSaveProject: (data: any) => void;
  language: Language;
  onBack: () => void;
  initialData?: Project | null;
  existingTitles?: string[];
}

export const ContentWorkflow: React.FC<ContentWorkflowProps> = ({ 
  channel, onSaveProject, language, onBack, initialData, existingTitles = [] 
}) => {
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
      const d = initialData.data || {};
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
  }, [initialData]); 

  // --- AUTO-SAVE SESSION ---
  useEffect(() => {
    if (loading || initialData) return;
    const sessionData = { 
      step, topic, selectedFormat, blueprint, selectedPersona, weeklyPlan, 
      lastUpdated: new Date().toISOString() 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }, [step, topic, selectedFormat, blueprint, selectedPersona, weeklyPlan]); 

  // --- HELPER SAVE ---
  const saveWork = (currentStep: WorkflowStep, extraData?: any) => {
    let updatedBlueprint: Partial<ContentIdea> = { ...blueprint };
    if (weeklyPlan.length > 0) updatedBlueprint.weeklyPlan = weeklyPlan;

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
  
  // 🔥 FIX: MENAMPILKAN NAMA MODEL YANG BENAR (GEMINI 3 FLASH)
  const getModelDisplayName = () => {
    if (engine === 'groq') return 'Groq LPU™';
    const savedModel = localStorage.getItem('health_creator_gemini_model') as GeminiModelId;
    // Cek model terbaru dulu
    if (savedModel === 'gemini-3-flash-preview') return 'Gemini 3 Flash';
    if (savedModel === 'gemini-3-pro-preview') return 'Gemini 3 Pro';
    return 'Gemini 3 Flash'; // Default Fallback
  };

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
        data = await groqOutlineAdapter(promptTopic, channel.targetAge, channel.niche, language, duration);
      } else {
        data = await generateOutline(promptTopic, channel.targetAge, channel.niche, language, duration);
      }
      setBlueprint(data);
      setStep(WorkflowStep.OUTLINING);
      saveWork(WorkflowStep.OUTLINING); 
    } catch (e: any) { alert(`Gagal Generate (${engine}): ${e.message}`); } finally { setLoading(false); }
  };

  const generateSegment = async (idx: number) => {
    if (!blueprint || !selectedPersona || !blueprint.outline) return;
    setDraftingIdx(idx);
    try {
      const doctorName = channel.doctorProfile?.name || "Dokter";
      const segment = await generateScriptSegment(topic, blueprint.outline[idx], selectedPersona, channel.targetAge, language, doctorName);
      const newOutline = [...blueprint.outline];
      newOutline[idx].scriptSegment = segment;
      const newBlueprint = { ...blueprint, outline: newOutline };
      setBlueprint(newBlueprint);
      saveWork(WorkflowStep.DRAFTING);
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

  // --- RENDER UTAMA ---
  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700 px-6 relative">
      {isRestored && !initialData && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
          <RotateCcw size={14} className="text-emerald-400" /> Sesi dipulihkan!
        </div>
      )}

      <WorkflowHeader step={step} channel={channel} engine={engine} setEngine={setEngine} onBack={handleSmartBack} isEditing={!!initialData} />
      
      <WorkflowProgress 
        currentStep={step} 
        maxStepReached={maxStepReached}
        onStepClick={(s) => setStep(s)} 
      />

      {step === WorkflowStep.IDEATION && (
        <StepIdeation 
          channel={channel} language={language} topic={topic} setTopic={setTopic}
          selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat}
          loading={loading} onGenerate={() => startBlueprint()} 
          useWebSearch={useWebSearch} setUseWebSearch={setUseWebSearch} engine={engine}
          weeklyPlan={weeklyPlan}
          onPlanGenerated={handlePlanGenerated}
          hasExistingData={!!blueprint}
          onResume={() => setStep(WorkflowStep.OUTLINING)}
        />
      )}

      {step === WorkflowStep.OUTLINING && blueprint && (
        <StepOutline 
          blueprint={blueprint} formatLabel={currentFormat.label} 
          onNext={() => { setStep(WorkflowStep.PERSONA); saveWork(WorkflowStep.PERSONA); }} 
          onRegenerate={() => startBlueprint()} isRegenerating={loading}
        />
      )}

      {step === WorkflowStep.PERSONA && (
        <StepPersona 
          selectedPersona={selectedPersona} onSelect={setSelectedPersona}
          onBack={() => setStep(WorkflowStep.OUTLINING)}
          onNext={() => { setStep(WorkflowStep.DRAFTING); saveWork(WorkflowStep.DRAFTING); }}
          t={null} currentFormatId={selectedFormat}
        />
      )}

      {(step === WorkflowStep.DRAFTING || step === WorkflowStep.FINAL) && blueprint && selectedPersona && (
        <StepDrafting 
          blueprint={blueprint} selectedPersona={selectedPersona}
          step={step} draftingIdx={draftingIdx}
          onGenerateSegment={generateSegment}
          onFinalize={() => { setStep(WorkflowStep.FINAL); saveWork(WorkflowStep.FINAL); }}
          onSave={step === WorkflowStep.FINAL ? () => { setStep(WorkflowStep.VISUALS); saveWork(WorkflowStep.VISUALS); } : () => {}}
          onPrint={() => window.print()}
        />
      )}

      {step === WorkflowStep.VISUALS && blueprint && (
        <StepVisuals
          blueprint={blueprint}
          onBack={() => setStep(WorkflowStep.FINAL)}
          onNext={() => { setStep(WorkflowStep.SSML); saveWork(WorkflowStep.SSML); }}
          onSaveData={(scenes) => saveWork(WorkflowStep.VISUALS, scenes)}
        />
      )}

      {step === WorkflowStep.SSML && blueprint && selectedPersona && (
        <StepSSML
          blueprint={blueprint}
          selectedPersona={selectedPersona}
          onBack={() => setStep(WorkflowStep.VISUALS)} 
          onNext={() => { setStep(WorkflowStep.EXPORT); saveWork(WorkflowStep.EXPORT); }}
          onAnalysisComplete={(script) => { saveWork(WorkflowStep.SSML, script); }}
        />
      )}
      
      {step === WorkflowStep.EXPORT && blueprint && selectedPersona && (
        <StepExport 
          blueprint={blueprint}
          selectedPersona={selectedPersona}
          onBack={() => setStep(WorkflowStep.SSML)}
          onFinish={() => { setStep(WorkflowStep.PUBLISH); saveWork(WorkflowStep.PUBLISH); }}
        />
      )}

      {step === WorkflowStep.PUBLISH && blueprint && (
        <StepPublish 
          blueprint={blueprint}
          targetAge={channel.targetAge}
          onBack={() => setStep(WorkflowStep.EXPORT)}
          onFinish={handleFinalSaveAndExit}
          onSaveData={(data) => saveWork(WorkflowStep.PUBLISH, data)}
        />
      )}
    </div>
  );
};