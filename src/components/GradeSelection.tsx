/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Grade, ScienceLesson } from '../types';
import { GraduationCap, BookOpen, ArrowLeft, Sparkles, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface GradeSelectionProps {
  grades: Grade[];
  lessons: ScienceLesson[];
  selectedGradeId?: string;
  onSelectGrade: (grade: Grade) => void;
}

export const GradeSelection: React.FC<GradeSelectionProps> = ({
  grades,
  lessons,
  selectedGradeId,
  onSelectGrade,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60 text-xs font-semibold mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>المرحلة الأولى: تحديد المستوى الدراسي</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
          في أي صف دراسي أنتِ الآن؟
        </h2>
        <p className="text-sm sm:text-base text-slate-500">
          اختاري صفكِ الدراسي لعرض قائمة دروس العلوم المخصصة لمنهجكِ وربطها بكتب المركز
        </p>
      </div>

      {/* 5 Grade Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {grades.map((grade, index) => {
          const gradeLessons = lessons.filter((l) => l.gradeId === grade.id);
          const isSelected = selectedGradeId === grade.id;

          return (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <button
                id={`grade-card-${grade.gradeNumber}`}
                onClick={() => onSelectGrade(grade)}
                className={`w-full text-right p-6 rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full group hover:shadow-md hover:border-sky-300 ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-200 shadow-sm bg-sky-50/30'
                    : 'border-slate-200/80 shadow-xs'
                }`}
              >
                <div>
                  {/* Top bar in card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-center text-sky-600 font-black text-lg group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      {grade.gradeNumber}
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/60">
                      {gradeLessons.length} دروس علوم
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors mb-2">
                    {grade.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3">
                    {grade.description}
                  </p>

                  {/* Subjects Preview for Grade 9 or general */}
                  {grade.gradeNumber === 9 ? (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100">
                        ⚡ فيزياء (38 درساً)
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
                        🧬 أحياء
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100">
                        ⚛️ كيمياء
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        كتاب العلوم المتكامل
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom action indicator */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                  <span>عرض عناوين الدروس المقررة</span>
                  <div className="w-7 h-7 rounded-full bg-sky-50 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
