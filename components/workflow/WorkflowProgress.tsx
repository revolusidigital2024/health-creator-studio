import React from 'react';
import { WorkflowStep } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  currentStep: WorkflowStep;
}

export const WorkflowProgress: React.FC<Props> = ({ currentStep }) => {
  const steps = Object.values(WorkflowStep);
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex justify-center mb-10">
      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200/60 shadow-sm">
         {steps.map((s, i) => (
           <div key={s} className="flex items-center">
             <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", i <= currentIndex ? "bg-slate-900 scale-125" : "bg-slate-200")} />
             {i < steps.length - 1 && <div className={cn("w-6 h-0.5 mx-3 rounded-full transition-colors duration-500", i < currentIndex ? "bg-slate-900" : "bg-slate-200")} />}
           </div>
         ))}
         <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{currentStep}</span>
      </div>
    </div>
  );
};