import React, { useState, useEffect } from 'react';
import { Channel, ContentIdea, Language, VideoDuration, WorkflowStep, Persona, GeminiModelId, Project } from '../types';
import { generateOutline, generateScriptSegment } from '../services/geminiService';
import { groqOutlineAdapter } from '../services/groqService';
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
import { StepPublish } from './workflow/StepPublish'; // Import Step Publish

interface ContentWorkflowProps {
  channel: Channel;
  onSaveProject: (data: any) => void;
  language: Language;
  onBack: () => void;
  initialData?: Project | null;
}

export const ContentWorkflow: React.FC<ContentWorkflowProps> = ({ 
  channel, onSaveProject, language, onBack, initialData 
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
  
  const [loading, setLoading] = useState(false);
  const [draftingIdx, setDraftingIdx] = useState<number | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // --- LOGIC: HYDRATION & SESSION ---
  useEffect(() => {
    if (initialData) {
      const d = initialData.data || {};
      setTopic(d.topic || initialData.title || '');
      setSelectedFormat(d.format || 'list');
      setBlueprint(d.blueprint || null);
      setSelectedPersona(d.persona || null);
      if (d.step) setStep(d.step as WorkflowStep);
      else setStep(WorkflowStep.IDEATION); // Default fallback
      localStorage.removeItem(SESSION_KEY);
    } else {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setStep(parsed.step); setTopic(parsed.topic); setSelectedFormat(parsed.selectedFormat);
          setBlueprint(parsed.blueprint); setSelectedPersona(parsed.selectedPersona);
          setIsRestored(true);
          setTimeout(() => setIsRestored(false), 3000);
        } catch (e) { localStorage.removeItem(SESSION_KEY); }
      }
    }
  }, [initialData]); 

  useEffect(() => {
    if (loading || initialData) return;
    const sessionData = { step, topic, selectedFormat, blueprint, selectedPersona, lastUpdated: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }, [step, topic, selectedFormat, blueprint, selectedPersona]); 

  // --- HELPER SAVE (UPDATED UNTUK PACKAGING) ---
  const saveWork = (currentStep: WorkflowStep, extraData?: any) => {
    let updatedBlueprint = { ...blueprint };

    // Update SSML
    if (extraData && typeof extraData === 'string') {
        updatedBlueprint.ssmlScript = extraData;
    }
    // Update Visuals
    else if (extraData && Array.isArray(extraData)) {
        updatedBlueprint.visualScenes = extraData;
    }
    // Update Packaging (Objek biasa, bukan array)
    else if (extraData && typeof extraData === 'object' && !Array.isArray(extraData)) {
        updatedBlueprint.packaging = extraData;
    }

    const projectData = {
      title: updatedBlueprint?.title || topic || 'Proyek Tanpa Judul',
      topic,
      format: selectedFormat,
      blueprint: updatedBlueprint,
      persona: selectedPersona,
      step: currentStep
    };
    onSaveProject(projectData);
    setBlueprint(updatedBlueprint);
  };

  const handleClearSession = () => { localStorage.removeItem(SESSION_KEY); };
  const currentFormat = VIDEO_FORMATS.find(f => f.id === selectedFormat) || VIDEO_FORMATS[1];
  const getModelDisplayName = () => { if (engine === 'groq') return 'Groq LPU™'; const savedModel = localStorage.getItem('health_creator_gemini_model') as GeminiModelId; if (savedModel === 'gemini-2.5-pro') return 'Gemini 2.5 Pro'; return 'Gemini 2.5 Flash'; };

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
    saveWork(WorkflowStep.PUBLISH); // Simpan posisi di PUBLISH (Tamat)
    if (!initialData) handleClearSession();
    alert('Proyek SELESAI & disimpan! Siap Upload.');
    onBack();
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700 px-6 relative">
      {isRestored && !initialData && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
          <RotateCcw size={14} className="text-emerald-400" /> Sesi dipulihkan!
        </div>
      )}

      <WorkflowHeader step={step} channel={channel} engine={engine} setEngine={setEngine} onBack={handleSmartBack} isEditing={!!initialData} />
      <WorkflowProgress currentStep={step} />

      {step === WorkflowStep.IDEATION && (
        <StepIdeation 
          channel={channel} language={language} topic={topic} setTopic={setTopic}
          selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat}
          loading={loading} onGenerate={() => startBlueprint()} 
          useWebSearch={useWebSearch} setUseWebSearch={setUseWebSearch} engine={engine}
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
          onFinish={() => { setStep(WorkflowStep.PUBLISH); saveWork(WorkflowStep.PUBLISH); }} // Pindah ke PUBLISH
        />
      )}

      {/* RENDER STEP TERAKHIR */}
      {step === WorkflowStep.PUBLISH && blueprint && (
        <StepPublish 
          blueprint={blueprint}
          targetAge={channel.targetAge}
          onBack={() => setStep(WorkflowStep.EXPORT)}
          onFinish={handleFinalSaveAndExit}
          onSaveData={(data) => saveWork(WorkflowStep.PUBLISH, data)} // Simpan data packaging
        />
      )}
    </div>
  );
};