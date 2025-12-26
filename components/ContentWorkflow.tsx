import React from 'react';
import { Channel, Language, WorkflowStep, Project } from '../types';
import { RotateCcw } from 'lucide-react';
import { useContentWorkflow } from '../hooks/useContentWorkflow';

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
  onUpdateChannel: (channel: Channel) => void;
}

export const ContentWorkflow: React.FC<ContentWorkflowProps> = ({ 
  channel, onSaveProject, language, onBack, initialData, existingTitles = [], onUpdateChannel
}) => {
  
  // --- USE CUSTOM HOOK ---
  const {
    step, setStep,
    topic, setTopic,
    selectedFormat, setSelectedFormat,
    engine, setEngine,
    useWebSearch, setUseWebSearch,
    blueprint,
    selectedPersona, setSelectedPersona,
    weeklyPlan,
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
    saveWork
  } = useContentWorkflow({
    channel,
    onSaveProject,
    language,
    onBack,
    initialData,
    existingTitles,
    onUpdateChannel
  });

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
          existingTitles={existingTitles}
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