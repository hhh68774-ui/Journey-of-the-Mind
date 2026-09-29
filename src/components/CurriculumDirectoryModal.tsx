/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Book, Grade, ScienceLesson } from '../types';
import { db } from '../services/db';
import {
  Search,
  BookOpen,
  FlaskConical,
  X,
  Zap,
  Dna,
  Atom,
  Layers,
  ChevronLeft,
  GraduationCap,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CurriculumDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  grades: Grade[];
  lessons: ScienceLesson[];
  onSelectLessonDirectly: (grade: Grade, lesson: ScienceLesson) => void;
}

export const CurriculumDirectoryModal: React.FC<CurriculumDirectoryModalProps> = ({
  isOpen,
  onClose,
  grades,
  lessons,
  onSelectLessonDirectly,
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState<string>('grade-9');
  const [selectedSubject, setSelectedSubject] = useState<string>('فيزياء');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const activeGrade = grades.find((g) => g.id === selectedGradeId) || grades[grades.length - 1];

  // Lessons for the active grade
  const gradeLessons = useMemo(() => {
    return lessons.filter((l) => l.gradeId === selectedGradeId);
  }, [lessons, selectedGradeId]);

  // Available subjects for the active grade
  const availableSubjects = useMemo(() => {
    const list = Array.from(new Set(gradeLessons.map((l) => l.subject).filter(Boolean))) as string[];
    if (list.length === 0) return ['العلوم العامة'];
    const order = ['فيزياء', 'أحياء', 'كيمياء', 'العلوم العامة'];
    return list.sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [gradeLessons]);

  // Keep subject in sync
  React.useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [availableSubjects, selectedSubject]);

  // Lessons in active subject
  const subjectLessons = useMemo(() => {
    return gradeLessons.filter((l) => {
      if (!l.subject) return selectedSubject === 'العلوم العامة';
      return l.subject === selectedSubject;
    });
  }, [gradeLessons, selectedSubject]);

  // Units in active subject
  const units = useMemo(() => {
    const set = new Set<string>();
    subjectLessons.forEach((l) => {
      if (l.unit) set.add(l.unit);
    });
    return Array.from(set);
  }, [subjectLessons]);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return subjectLessons.filter((lesson) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        (lesson.lessonNumber && lesson.lessonNumber.toLowerCase().includes(q)) ||
        (lesson.unit && lesson.unit.toLowerCase().includes(q)) ||
        (lesson.brief && lesson.brief.toLowerCase().includes(q)) ||
        (lesson.keywords && lesson.keywords.some((k) => k.toLowerCase().includes(q)));

      const matchesUnit = selectedUnit === 'all' || lesson.unit === selectedUnit;
      return matchesSearch && matchesUnit;
    });
  }, [subjectLessons, searchQuery, selectedUnit]);

  // Group lessons by unit
  const lessonsByUnit = useMemo(() => {
    const map = new Map<string, ScienceLesson[]>();
    filteredLessons.forEach((lesson) => {
      const u = lesson.unit || 'وحدة عامة';
      if (!map.has(u)) {
        map.set(u, []);
      }
      map.get(u)!.push(lesson);
    });
    return map;
  }, [filteredLessons]);

  const getSubjectIcon = (subj: string) => {
    switch (subj) {
      case 'فيزياء':
        return <Zap className="w-4 h-4 text-sky-500" />;
      case 'أحياء':
        return <Dna className="w-4 h-4 text-emerald-500" />;
      case 'كيمياء':
        return <Atom className="w-4 h-4 text-purple-500" />;
      default:
        return <FlaskConical className="w-4 h-4 text-teal-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-sky-600 via-indigo-600 to-teal-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">فهرس وعناوين الدروس المقررة</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  منهج كامبريدج العماني
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                تصفحي جميع عناوين دروس العلوم والفيزياء والأحياء والكيمياء وربطها بكتب مركز مصادر التعلم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="إغلاق الفهرس"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">الصف الدراسي:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {grades.map((grade) => {
              const isSelected = grade.id === selectedGradeId;
              const count = lessons.filter((l) => l.gradeId === grade.id).length;
              return (
                <button
                  key={grade.id}
                  onClick={() => {
                    setSelectedGradeId(grade.id);
                    setSelectedUnit('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{grade.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-sky-700 text-sky-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count} درس
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject & Search Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {availableSubjects.map((subj) => {
              const isSelected = selectedSubject === subj;
              const count = gradeLessons.filter((l) => l.subject === subj || (!l.subject && subj === 'العلوم العامة')).length;

              return (
                <button
                  key={subj}
                  onClick={() => {
                    setSelectedSubject(subj);
                    setSelectedUnit('all');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {getSubjectIcon(subj)}
                  <span>{subj}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-white text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي في عناوين الدروس (مثال: 1-1، السرعة، الخلايا)..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-full cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Quick Units Filter Bar */}
        {units.length > 1 && (
          <div className="px-6 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-slate-400 font-medium shrink-0">تصفية حسب الوحدة:</span>
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                selectedUnit === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              كل الوحدات ({subjectLessons.length})
            </button>
            {units.map((u) => {
              const count = subjectLessons.filter((l) => l.unit === u).length;
              return (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                    selectedUnit === u
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{u.length > 25 ? u.slice(0, 25) + '...' : u}</span>
                  <span className="mr-1 text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Lesson Titles Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredLessons.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">لم يتم العثور على دروس مطابقة</p>
              <p className="text-xs text-slate-400 mt-1">جربي تغيير كلمة البحث أو اختيار وحدة أخرى</p>
            </div>
          ) : (
            Array.from(lessonsByUnit.entries()).map(([unitName, unitLessons]) => (
              <div
                key={unitName}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                {/* Unit Header */}
                <div className="bg-linear-to-r from-slate-50 to-indigo-50/40 px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-black text-slate-800 text-sm sm:text-base">
                      {unitName}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {unitLessons.length} درس
                  </span>
                </div>

                {/* Unit Lessons List */}
                <div className="divide-y divide-slate-100">
                  {unitLessons.map((lesson) => {
                    const linkedBooks = db.getBooksForLesson(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className="p-4 hover:bg-sky-50/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {lesson.lessonNumber && (
                            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-sky-600 transition-colors">
                              {lesson.lessonNumber}
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h5 className="font-black text-slate-800 text-sm sm:text-base group-hover:text-sky-700 transition-colors">
                                {lesson.title}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                                {lesson.semester}
                              </span>
                            </div>

                            {lesson.brief && (
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                                {lesson.brief}
                              </p>
                            )}

                            {/* Linked books preview */}
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-teal-600" />
                                <span>{linkedBooks.length} كتب متوفرة في المصادر</span>
                              </span>
                              {linkedBooks.length > 0 && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[300px]">
                                  ({linkedBooks.map((item) => item.book.title).join('، ')})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct Selection CTA */}
                        <button
                          onClick={() => {
                            if (activeGrade) {
                              onSelectLessonDirectly(activeGrade, lesson);
                              onClose();
                            }
                          }}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-2xs group-hover:bg-sky-600 group-hover:text-white"
                        >
                          <span>اختيار هذا الدرس وبدء الرحلة</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">«رِحْلَةُ عَقْل»</span>
            <span>•</span>
            <span>تصميم: أخصائية مركز مصادر التعلم \ هدى الحارثية</span>
            <span>•</span>
            <span>فكرة: معلمات العلوم بمدرسة المنارة للبنات</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
