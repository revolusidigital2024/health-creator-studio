import React, { useState, useEffect } from 'react';
import { Channel, ContentIdea, Language, VideoDuration, WorkflowStep, Persona, Project } from '../types';
import { generateOutline, generateScriptSegment } from '../services/geminiService';
import { groqOutlineAdapter } from '../services/groqService';
import { storageService } from '../services/storageService';
import { RotateCcw } from 'lucide-react';

// --- IMPORT SEMUA MODUL (Clean Code) ---
import { WorkflowHeader } from './workflow/WorkflowHeader'; // <-- INI YANG BARU
import { WorkflowProgress } from './workflow/WorkflowProgress';
import { StepIdeation, VIDEO_FORMATS } from './workflow/StepIdeation';
import { StepOutline } from './workflow/StepOutline';
import { StepPersona } from './workflow/StepPersona';
import { StepDrafting } from './workflow/StepDrafting';

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
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [draftingIdx, setDraftingIdx] = useState<number | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // --- LOGIC: ENGINE & FORMAT ---
  useEffect(() => { storageService.setSelectedEngine(engine); }, [engine]);
  const currentFormat = VIDEO_FORMATS.find(f => f.id === selectedFormat) || VIDEO_FORMATS[1];

  // --- LOGIC: HYDRATION & SESSION ---
  useEffect(() => {
    if (initialData && initialData.data) {
      const d = initialData.data;
      setTopic(d.topic || initialData.title || '');
      setSelectedFormat(d.format || 'list');
      setBlueprint(d.blueprint || null);
      setSelectedPersona(d.persona || null);
      
      if (d.step) setStep(d.step as WorkflowStep);
      else if (d.blueprint && !d.persona) setStep(WorkflowStep.OUTLINING);
      else if (d.persona && !d.blueprint?.script) setStep(WorkflowStep.DRAFTING);
      else setStep(WorkflowStep.IDEATION);
      
      localStorage.removeItem(SESSION_KEY);
    } else {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setStep(parsed.step);
          setTopic(parsed.topic);
          setSelectedFormat(parsed.selectedFormat);
          setBlueprint(parsed.blueprint);
          setSelectedPersona(parsed.selectedPersona);
          setIsRestored(true);
          setTimeout(() => setIsRestored(false), 3000);
        } catch (e) {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    }
  }, [initialData]); 

  // Auto-Save Session
  useEffect(() => {
    if (loading || initialData) return;
    const sessionData = { step, topic, selectedFormat, blueprint, selectedPersona, lastUpdated: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }, [step, topic, selectedFormat, blueprint, selectedPersona]); 

  // --- LOGIC: API CALLS ---
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
      onSaveProject({ title: data.title, topic: finalTopic, format: selectedFormat, blueprint: data, step: 'OUTLINING' });
    } catch (e: any) { 
        alert(`Gagal Generate (${engine}): ${e.message}`); 
    } finally { 
        setLoading(false); 
    }
  };

  const generateSegment = async (idx: number) => {
    if (!blueprint || !selectedPersona || !blueprint.outline) return;
    setDraftingIdx(idx);
    try {
      const segment = await generateScriptSegment(topic, blueprint.outline[idx], selectedPersona, channel.targetAge, language);
      const newOutline = [...blueprint.outline];
      newOutline[idx].scriptSegment = segment;
      setBlueprint({ ...blueprint, outline: newOutline });
    } catch (e: any) { alert(e.message); } finally { setDraftingIdx(null); }
  };

  // --- LOGIC: NAVIGATION ---
  const handleSmartBack = () => {
    switch (step) {
      case WorkflowStep.FINAL: setStep(WorkflowStep.DRAFTING); break;
      case WorkflowStep.DRAFTING: setStep(WorkflowStep.PERSONA); break;
      case WorkflowStep.PERSONA: setStep(WorkflowStep.OUTLINING); break;
      case WorkflowStep.OUTLINING: setStep(WorkflowStep.IDEATION); break;
      default: onBack(); break;
    }
  };

  const handleFinalSave = () => {
    onSaveProject({
      title: blueprint?.title || topic,
      topic,
      format: selectedFormat,
      blueprint,
      persona: selectedPersona,
      step: WorkflowStep.FINAL
    });
    if (!initialData) localStorage.removeItem(SESSION_KEY);
    alert('Proyek berhasil disimpan ke Dashboard!');
    onBack();
  };

  const saveWork = (currentStep: WorkflowStep) => {
    onSaveProject({
      title: blueprint?.title || topic,
      topic,
      format: selectedFormat,
      blueprint,
      persona: selectedPersona,
      step: currentStep
    });
  };

  // --- RENDER UTAMA (LEBIH BERSIH!) ---
  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700 px-6 relative">
      
      {/* Notifikasi Restore */}
      {isRestored && !initialData && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
          <RotateCcw size={14} className="text-emerald-400" />
          Sesi sebelumnya dipulihkan!
        </div>
      )}

      {/* HEADER MODULAR */}
      <WorkflowHeader 
        step={step}
        channel={channel}
        engine={engine}
        setEngine={setEngine}
        onBack={handleSmartBack}
        isEditing={!!initialData}
      />

      {/* PROGRESS MODULAR */}
      <WorkflowProgress currentStep={step} />

      {/* --- KONTEN BERDASARKAN STEP --- */}
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
        />
      )}

      {step === WorkflowStep.PERSONA && (
  <StepPersona 
    selectedPersona={selectedPersona}
    onSelect={setSelectedPersona}
    onBack={() => setStep(WorkflowStep.OUTLINING)}
    onNext={() => {
      setStep(WorkflowStep.DRAFTING);
      saveWork(WorkflowStep.DRAFTING); 
    }}
    t={null}
    // TAMBAHAN INI 👇
    currentFormatId={selectedFormat} 
  />
)}

      {(step === WorkflowStep.DRAFTING || step === WorkflowStep.FINAL) && blueprint && selectedPersona && (
        <StepDrafting 
          blueprint={blueprint} selectedPersona={selectedPersona}
          step={step} draftingIdx={draftingIdx}
          onGenerateSegment={generateSegment}
          onFinalize={() => setStep(WorkflowStep.FINAL)}
          onSave={handleFinalSave}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
};