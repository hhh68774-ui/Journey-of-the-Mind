/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sparkles, Brain, Lightbulb, ShieldCheck, Home, UserCheck } from 'lucide-react';
import { StepKey } from '../types';

interface HeaderProps {
  currentStep: StepKey;
  onNavigate: (step: StepKey) => void;
  selectedGradeName?: string;
  selectedLessonTitle?: string;
  isSupervisorMode: boolean;
  onToggleSupervisor: () => void;
  onOpenCurriculumDirectory?: () => void;
  onOpenLrcCatalog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onNavigate,
  selectedGradeName,
  selectedLessonTitle,
  isSupervisorMode,
  onToggleSupervisor,
  onOpenCurriculumDirectory,
  onOpenLrcCatalog,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand Title */}
          <button
            id="brand-header-button"
            onClick={() => onNavigate('welcome')}
            className="flex items-center gap-3.5 text-right group cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-sky-500 via-teal-400 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-sky-200">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  رِحْلَةُ عَقْل
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                  مركز مصادر التعلم
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                مِنْ دَرْسٍ نَتَعَلَّمُهُ… إِلَى كِتَابٍ نَكْتَشِفُهُ
              </p>
            </div>
          </button>

          {/* Active Context Breadcrumbs (if student has selected grade/lesson) */}
          {!isSupervisorMode && (selectedGradeName || selectedLessonTitle) && (
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/70">
              {selectedGradeName && (
                <span className="font-semibold text-sky-700">{selectedGradeName}</span>
              )}
              {selectedLessonTitle && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="font-medium text-slate-700 truncate max-w-[220px]">
                    {selectedLessonTitle}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Actions: Supervisor Mode & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenLrcCatalog && (
              <button
                id="header-nav-lrc-catalog"
                onClick={onOpenLrcCatalog}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-teal-800 bg-teal-50/90 hover:bg-teal-100 border border-teal-200/90 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="قائمة كتب مركز مصادر التعلم (1124 كتاباً)"
              >
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">كتب المصادر</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-200/80 text-teal-900 font-mono font-bold">1124</span>
              </button>
            )}

            {onOpenCurriculumDirectory && (
              <button
                id="header-nav-curriculum"
                onClick={onOpenCurriculumDirectory}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="فهرس وعناوين الدروس المقررة"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>فهرس الدروس</span>
              </button>
            )}

            {!isSupervisorMode && currentStep !== 'welcome' && (
              <button
                id="header-nav-home"
                onClick={() => onNavigate('welcome')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                title="الصفحة الرئيسية"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">الرئيسية</span>
              </button>
            )}

            <button
              id="supervisor-toggle-button"
              onClick={onToggleSupervisor}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs ${
                isSupervisorMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200'
                  : 'bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 text-slate-700 border border-sky-200/80'
              }`}
            >
              {isSupervisorMode ? (
                <>
                  <UserCheck className="w-4 h-4 text-purple-200" />
                  <span>العودة لرحلة الطالبة</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>لوحة المعلمة / المشرفة</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
