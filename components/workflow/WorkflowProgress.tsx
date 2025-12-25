import React from 'react';
import { WorkflowStep } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  currentStep: WorkflowStep;
  // Prop baru untuk navigasi manual
  onStepClick: (step: WorkflowStep) => void;
  // Step terjauh yang sudah dicapai (biar gak loncat ke masa depan yang belum ada)
  maxStepReached: WorkflowStep;
}

export const WorkflowProgress: React.FC<Props> = ({ currentStep, onStepClick, maxStepReached }) => {
  const steps = Object.values(WorkflowStep);
  const currentIndex = steps.indexOf(currentStep);
  const maxIndex = steps.indexOf(maxStepReached);

  return (
    <div className="flex justify-center mb-10">
      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200/60 shadow-sm">
         {steps.map((s, i) => {
           // Cek apakah step ini boleh diklik (sudah dilewati atau sedang aktif)
           const isClickable = i <= maxIndex;
           
           return (
             <div key={s} className="flex items-center">
               <button 
                 onClick={() => isClickable && onStepClick(s)}
                 disabled={!isClickable}
                 className={cn(
                   "w-3 h-3 rounded-full transition-all duration-300", 
                   i <= currentIndex ? "bg-emerald-600 scale-125" : "bg-slate-300",
                   isClickable ? "cursor-pointer hover:scale-150 hover:bg-emerald-400" : "cursor-not-allowed opacity-50"
                 )}
                 title={s}
               />
               {i < steps.length - 1 && <div className={cn("w-6 h-0.5 mx-2 rounded-full transition-colors duration-500", i < currentIndex ? "bg-emerald-600" : "bg-slate-200")} />}
             </div>
           );
         })}
         <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
           {currentStep}
         </span>
      </div>
    </div>
  );
};