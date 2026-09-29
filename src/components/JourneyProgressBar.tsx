/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Compass, Sparkles } from 'lucide-react';
import { StepKey } from '../types';

interface JourneyProgressBarProps {
  currentStep: StepKey;
  onNavigateStep: (step: StepKey) => void;
  hasGrade: boolean;
  hasLesson: boolean;
  hasBook: boolean;
  hasCompleted: boolean;
}

interface StepItem {
  id: StepKey;
  title: string;
  stepNumber: number;
}

const steps: StepItem[] = [
  { id: 'grade', title: 'اختيار الصف', stepNumber: 1 },
  { id: 'lesson', title: 'اختيار الدرس', stepNumber: 2 },
  { id: 'book', title: 'اختيار الكتاب', stepNumber: 3 },
  { id: 'mission', title: 'التوثيق', stepNumber: 4 },
  { id: 'achievement', title: 'الإنجاز', stepNumber: 5 },
];

export const JourneyProgressBar: React.FC<JourneyProgressBarProps> = ({
  currentStep,
  onNavigateStep,
  hasGrade,
  hasLesson,
  hasBook,
  hasCompleted,
}) => {
  if (currentStep === 'welcome' || currentStep === 'supervisor') {
    return null;
  }

  const getStepIndex = (key: StepKey) => {
    switch (key) {
      case 'grade': return 0;
      case 'lesson': return 1;
      case 'book': return 2;
      case 'mission': return 3;
      case 'achievement': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  const canNavigateTo = (index: number) => {
    if (index === 0) return true;
    if (index === 1) return hasGrade;
    if (index === 2) return hasGrade && hasLesson;
    if (index === 3) return hasGrade && hasLesson && hasBook;
    if (index === 4) return hasCompleted;
    return false;
  };

  return (
    <div className="w-full bg-white/95 border-b border-sky-100/80 py-4 shadow-xs no-print">
      <div className="max-w-5xl mx-auto px-4">
        {/* Title */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              رحلتي
            </h2>
            <span className="text-xs text-slate-400">
              (المرحلة {currentIndex + 1} من 5)
            </span>
          </div>

          <div className="text-xs font-medium text-sky-600">
            {steps[currentIndex]?.title}
          </div>
        </div>

        {/* Steps Bar */}
        <div className="relative flex items-center justify-between">
          {/* Connecting Track */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 z-0">
            <div
              className="h-full bg-linear-to-r from-sky-400 via-teal-400 to-indigo-500 transition-all duration-300 rounded-full"
              style={{
                width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Step Indicators */}
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex || (idx === 4 && hasCompleted);
            const isCurrent = idx === currentIndex;
            const isClickable = canNavigateTo(idx);

            return (
              <button
                key={step.id}
                id={`progress-step-${step.id}`}
                disabled={!isClickable}
                onClick={() => isClickable && onNavigateStep(step.id)}
                className={`relative z-10 flex flex-col items-center group transition-all duration-200 ${
                  isClickable ? 'cursor-pointer' : 'cursor-default opacity-75'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-xs ${
                    isCompleted
                      ? 'bg-teal-500 text-white shadow-teal-200 ring-4 ring-teal-50'
                      : isCurrent
                      ? 'bg-sky-500 text-white ring-4 ring-sky-100 scale-110 shadow-sky-200'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                <span
                  className={`text-[11px] sm:text-xs mt-1.5 font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-sky-700 font-bold'
                      : isCompleted
                      ? 'text-slate-700 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
