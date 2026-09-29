/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Book, Grade, ScienceLesson } from '../types';
import { db } from '../services/db';
import {
  Search,
  BookOpen,
  FlaskConical,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  ChevronRight,
  Zap,
  Dna,
  Atom,
  Layers,
  MapPin,
  Bookmark,
  Link2,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LessonSelectionProps {
  selectedGrade: Grade;
  lessons: ScienceLesson[];
  selectedLessonId?: string;
  onSelectLesson: (lesson: ScienceLesson) => void;
  onContinueToBooks: () => void;
  onChangeGrade: () => void;
  onOpenAddLessonModal?: () => void;
  onSelectBookDirectly?: (book: Book, lesson: ScienceLesson) => void;
  onOpenCurriculumModal?: () => void;
}

export const LessonSelection: React.FC<LessonSelectionProps> = ({
  selectedGrade,
  lessons,
  selectedLessonId,
  onSelectLesson,
  onContinueToBooks,
  onChangeGrade,
  onOpenAddLessonModal,
  onSelectBookDirectly,
  onOpenCurriculumModal,
}) => {
  // Lessons for this grade
  const gradeLessons = useMemo(() => {
    return lessons.filter((l) => l.gradeId === selectedGrade.id);
  }, [lessons, selectedGrade.id]);

  // Available subjects for this grade
  const subjects = useMemo(() => {
    const list = Array.from(new Set(gradeLessons.map((l) => l.subject).filter(Boolean))) as string[];
    if (list.length === 0) {
      return ['العلوم العامة'];
    }
    // Ensure logical order: فيزياء, أحياء, كيمياء
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

  // Active Subject (Step 1: اختيار المادة)
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (subjects.includes('فيزياء')) return 'فيزياء';
    return subjects[0] || 'العلوم العامة';
  });

  // Keep subject in sync if grade changes
  useEffect(() => {
    if (subjects.length > 0 && !subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects.includes('فيزياء') ? 'فيزياء' : subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Lessons filtered by subject
  const subjectLessons = useMemo(() => {
    return gradeLessons.filter((l) => {
      if (!l.subject) return selectedSubject === 'العلوم العامة';
      return l.subject === selectedSubject;
    });
  }, [gradeLessons, selectedSubject]);

  // Units for the active subject (Step 2: اختيار الوحدة)
  const units = useMemo(() => {
    const unitSet = new Set<string>();
    subjectLessons.forEach((l) => {
      if (l.unit) unitSet.add(l.unit);
    });
    return Array.from(unitSet);
  }, [subjectLessons]);

  // Active Unit Filter
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  // Reset unit filter when subject changes
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedUnit('all');
  };

  // Search & Semester Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const semesters = useMemo(() => {
    return Array.from(new Set(subjectLessons.map((l) => l.semester).filter(Boolean)));
  }, [subjectLessons]);

  // Filtered Lessons (Step 3: عنوان الدرس)
  const filteredLessons = useMemo(() => {
    return subjectLessons.filter((lesson) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        (lesson.lessonNumber && lesson.lessonNumber.toLowerCase().includes(q)) ||
        (lesson.brief && lesson.brief.toLowerCase().includes(q)) ||
        (lesson.keywords && lesson.keywords.some((k) => k.toLowerCase().includes(q)));

      const matchesUnit = selectedUnit === 'all' || lesson.unit === selectedUnit;
      const matchesSemester =
        selectedSemester === 'all' || lesson.semester === selectedSemester;

      return matchesSearch && matchesUnit && matchesSemester;
    });
  }, [subjectLessons, searchQuery, selectedUnit, selectedSemester]);

  // Book Linking Modal State
  const [linkingLesson, setLinkingLesson] = useState<ScienceLesson | null>(null);
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [customRelationNote, setCustomRelationNote] = useState('');
  const [allLrcBooks, setAllLrcBooks] = useState<Book[]>(() => db.getBooks());
  const [linkingSuccessMessage, setLinkingSuccessMessage] = useState<string | null>(null);

  const openLinkBookModal = (lesson: ScienceLesson, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLinkingLesson(lesson);
    setBookSearchQuery('');
    setCustomRelationNote('');
    setLinkingSuccessMessage(null);
    setAllLrcBooks(db.getBooks());
  };

  const handleConfirmLinkBook = (bookId: string) => {
    if (!linkingLesson) return;
    const note = customRelationNote.trim() || `مرتبط بدرس ${linkingLesson.title}`;
    db.linkLessonAndBook(linkingLesson.id, bookId, note);
    setLinkingSuccessMessage('تم ربط الكتاب بالدرس بنجاح في مركز مصادر التعلم!');
    setTimeout(() => {
      setLinkingSuccessMessage(null);
      setLinkingLesson(null);
    }, 1200);
  };

  const filteredLrcBooks = useMemo(() => {
    if (!bookSearchQuery.trim()) return allLrcBooks;
    const q = bookSearchQuery.toLowerCase();
    return allLrcBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.classificationNumber.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.serialNumber.toLowerCase().includes(q)
    );
  }, [allLrcBooks, bookSearchQuery]);

  const selectedLesson = gradeLessons.find((l) => l.id === selectedLessonId);
  const selectedLessonBooks = selectedLessonId ? db.getBooksForLesson(selectedLessonId) : [];

  // Subject icon helper
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-36">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onChangeGrade}
            className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
            <span>تغيير الصف ({selectedGrade.name})</span>
          </button>

          {onOpenCurriculumModal && (
            <button
              onClick={onOpenCurriculumModal}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>فهرس عناوين الدروس</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>مدرسة المنارة للبنات</span>
          <span>•</span>
          <span>مركز مصادر التعلم</span>
        </div>
      </div>

      {/* Main Header & Academic Sequence Guide */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linear-to-r from-sky-50 to-indigo-50 border border-sky-200/80 text-xs font-bold text-sky-800 mb-3 shadow-2xs">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>منهج كامبريدج العماني • {selectedGrade.name}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
          اختاري المادة، ومن الوحدة، ثم عنوان الدرس لربطه بكتب المصادر
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          رحلة تعليمية مستكشفة تبدأ من موضوع الدرس المدرسي، وتربطكِ مباشرة بالكتب العلمية والمصادر المتوفرة في مركز مصادر التعلم.
        </p>

        {/* Visual 3-Step Sequence Pills */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto text-xs">
          <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200/60 text-sky-800 flex items-center justify-center gap-2 font-bold shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[11px]">١</span>
            <span>اختاري المادة الدراسية</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/60 text-indigo-800 flex items-center justify-center gap-2 font-bold shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">٢</span>
            <span>حددي الوحدة التعليمية</span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/60 text-teal-800 flex items-center justify-center gap-2 font-bold shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]">٣</span>
            <span>اختاري الدرس وكتب المصادر</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. مرحلة اختيار المادة (Step 1: Subject Selection) */}
      {/* ========================================================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ١
            </div>
            <h3 className="font-black text-slate-800 text-base">
              اختاري المادة الدراسية ({selectedGrade.name})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            متوفر {subjects.length} مواد
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {subjects.map((subj) => {
            const isSelected = selectedSubject === subj;
            const count = gradeLessons.filter((l) => l.subject === subj || (!l.subject && subj === 'العلوم العامة')).length;

            let colorClasses = {
              border: isSelected ? 'border-sky-500 ring-2 ring-sky-300' : 'border-slate-200 hover:border-sky-300',
              bg: isSelected ? 'bg-sky-50/70 shadow-sm' : 'bg-white hover:bg-slate-50/50',
              badge: 'bg-sky-100 text-sky-800',
              accent: 'text-sky-600',
            };

            if (subj === 'أحياء') {
              colorClasses = {
                border: isSelected ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-200 hover:border-emerald-300',
                bg: isSelected ? 'bg-emerald-50/70 shadow-sm' : 'bg-white hover:bg-slate-50/50',
                badge: 'bg-emerald-100 text-emerald-800',
                accent: 'text-emerald-600',
              };
            } else if (subj === 'كيمياء') {
              colorClasses = {
                border: isSelected ? 'border-purple-500 ring-2 ring-purple-300' : 'border-slate-200 hover:border-purple-300',
                bg: isSelected ? 'bg-purple-50/70 shadow-sm' : 'bg-white hover:bg-slate-50/50',
                badge: 'bg-purple-100 text-purple-800',
                accent: 'text-purple-600',
              };
            }

            return (
              <button
                key={subj}
                onClick={() => handleSubjectChange(subj)}
                className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${colorClasses.border} ${colorClasses.bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-2xs">
                    {getSubjectIcon(subj)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                      <span>{subj}</span>
                      {isSelected && <Check className={`w-4 h-4 stroke-[3] ${colorClasses.accent}`} />}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {subj === 'فيزياء' && 'الطول، الحركة، الطاقة، الضوء، والكهرباء'}
                      {subj === 'أحياء' && 'الخلايا، الجزيئات الحيوية، والوظائف الحيوية'}
                      {subj === 'كيمياء' && 'المادة، الذرات، الروابط، والمعادلات'}
                      {subj === 'العلوم العامة' && 'استكشاف مفاهيم المادة والأحياء والطاقة'}
                    </p>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${colorClasses.badge}`}>
                  {count} درس
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. مرحلة اختيار الوحدة (Step 2: Unit Selection) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs mb-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ٢
            </div>
            <h3 className="font-black text-slate-800 text-base">
              اختاري الوحدة من مادة ({selectedSubject})
            </h3>
          </div>

          <div className="text-xs text-slate-500">
            {units.length} وحدات متوفرة
          </div>
        </div>

        {/* Units Scrollable Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedUnit('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedUnit === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>كل الوحدات ({subjectLessons.length} درس)</span>
          </button>

          {units.map((unit) => {
            const isUnitSelected = selectedUnit === unit;
            const unitLessonCount = subjectLessons.filter((l) => l.unit === unit).length;

            return (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isUnitSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50/70 text-indigo-900 border border-indigo-100 hover:bg-indigo-100/70'
                }`}
              >
                <span>{unit}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isUnitSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-white text-indigo-700'
                  }`}
                >
                  {unitLessonCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input and Semester filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحثي بعنوان الدرس أو رقمه (مثل: 1-1، السرعة، الانعكاس، الخلية)..."
              className="w-full pl-4 pr-11 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {semesters.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <span className="text-slate-400 font-medium">الفصل:</span>
              <button
                onClick={() => setSelectedSemester('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedSemester === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedSemester === sem
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sem.replace('الفصل الدراسي ', 'ف')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. مرحلة اختيار عنوان الدرس وربطه بكتب المصادر */}
      {/* ========================================================= */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            ٣
          </div>
          <h3 className="font-black text-slate-800 text-base">
            عناوين الدروس المقررة والكتب المرتبطة بمركز مصادر التعلم
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          يعرض {filteredLessons.length} درس
        </span>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-base text-slate-700 mb-1">
            لم نجد دروسًا مطابقة لخيارات البحث المحددة
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            جربي مسح عبارة البحث أو اختيار وحدة دراسية أخرى
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedUnit('all');
              setSelectedSemester('all');
            }}
            className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
          >
            إعادة تعيين خيارات البحث
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLessons.map((lesson) => {
            const isSelected = selectedLessonId === lesson.id;
            const linkedData = db.getBooksForLesson(lesson.id);

            return (
              <motion.div
                key={lesson.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                <div
                  id={`lesson-card-${lesson.id}`}
                  onClick={() => onSelectLesson(lesson)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer h-full flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-linear-to-b from-sky-50/90 to-white border-sky-500 ring-2 ring-sky-300 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-sky-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header Badges: Unit + Lesson Number + Subject */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {lesson.lessonNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs">
                            {lesson.lessonNumber}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[11px]">
                          {lesson.unit}
                        </span>
                        {lesson.subject && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1">
                            {getSubjectIcon(lesson.subject)}
                            <span>{lesson.subject}</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {lesson.semester}
                      </span>
                    </div>

                    {/* Lesson Title */}
                    <h4 className="text-lg font-black text-slate-800 mb-1.5 leading-snug group-hover:text-sky-700 transition-colors">
                      {lesson.title}
                    </h4>

                    {/* Brief description */}
                    {lesson.brief && (
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {lesson.brief}
                      </p>
                    )}

                    {/* Scientific Keywords */}
                    {lesson.keywords && lesson.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {lesson.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ========================================================= */}
                    {/* الكتب المتوفرة في مصادر التعلم المرتبطة بهذا الدرس */}
                    {/* ========================================================= */}
                    <div className="pt-3 border-t border-slate-100 mb-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                          <span>الكتب المتوفرة في المصادر لهذا الدرس:</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[11px]">
                            {linkedData.length}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => openLinkBookModal(lesson, e)}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>+ ربط كتاب إضافي</span>
                        </button>
                      </div>

                      {linkedData.length === 0 ? (
                        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between gap-2">
                          <p className="text-[11px]">
                            لم يتم ربط كتاب بعد. يمكنكِ ربط كتاب من مركز المصادر مباشرة.
                          </p>
                          <button
                            type="button"
                            onClick={(e) => openLinkBookModal(lesson, e)}
                            className="font-bold underline text-amber-900 text-xs shrink-0 cursor-pointer"
                          >
                            ربط الآن
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {linkedData.map(({ book, note }) => (
                            <div
                              key={book.id}
                              className="bg-slate-50 hover:bg-teal-50/40 border border-slate-200/80 rounded-xl p-2.5 transition-colors flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-10 h-12 rounded-md object-cover shrink-0 shadow-2xs border border-white"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1532012164546-f432f2e3745b?auto=format&fit=crop&w=300&q=80';
                                  }}
                                />
                                <div className="min-w-0">
                                  <h5 className="font-bold text-slate-800 truncate text-xs">
                                    {book.title}
                                  </h5>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                                      <Bookmark className="w-2.5 h-2.5 text-sky-600" />
                                      <span>تصنيف: {book.classificationNumber}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-rose-600 font-medium truncate">
                                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                      <span className="truncate">{book.location}</span>
                                    </span>
                                  </div>
                                  {note && (
                                    <p className="text-[10px] text-teal-700 truncate mt-0.5">
                                      {note}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Quick Select Book Button */}
                              {onSelectBookDirectly && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectLesson(lesson);
                                    onSelectBookDirectly(book, lesson);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shrink-0 shadow-2xs cursor-pointer flex items-center gap-1"
                                >
                                  <span>اختيار الكتاب</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Selector Status */}
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">
                      {isSelected ? 'تم تحديد هذا الدرس' : 'اضغطي للتحديد والانتقال للكتب'}
                    </span>

                    <div
                      className={`flex items-center gap-1 font-bold ${
                        isSelected ? 'text-sky-700' : 'text-slate-500 group-hover:text-sky-600'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-sky-600 fill-sky-100" />
                          <span>تم الاختيار</span>
                        </>
                      ) : (
                        <span>اختيار الدرس</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal: ربط كتاب متوفر في مركز مصادر التعلم بالدرس الحالي */}
      {/* ========================================================= */}
      <AnimatePresence>
        {linkingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">
                      ربط كتاب متوفر في مصادر التعلم بهذا الدرس
                    </h3>
                    <p className="text-xs text-slate-500 truncate max-w-sm sm:max-w-md">
                      الدرس: {linkingLesson.title} ({linkingLesson.unit})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setLinkingLesson(null)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                {linkingSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{linkingSuccessMessage}</span>
                  </div>
                )}

                {/* Relevance Note Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    صلة الكتاب بالدرس أو الفصل ذي العلاقة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={customRelationNote}
                    onChange={(e) => setCustomRelationNote(e.target.value)}
                    placeholder="مثال: الفصل 2 يوضح تجارب قياس الكثافة وحساب الحجوم..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>

                {/* Search Books In LRC */}
                <div className="relative">
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="ابحثي في كتب المركز (بالعنوان، المؤلف، رقم التصنيف، أو الرف)..."
                    className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Books List in Library */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredLrcBooks.map((book) => {
                    const alreadyLinked = db
                      .getBooksForLesson(linkingLesson.id)
                      .some((r) => r.book.id === book.id);

                    return (
                      <div
                        key={book.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                          alreadyLinked
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-10 h-14 rounded-md object-cover shrink-0 border border-slate-100"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1532012164546-f432f2e3745b?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-800 text-xs truncate">
                              {book.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 truncate">
                              المؤلف: {book.author}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 flex-wrap">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                {book.classificationNumber}
                              </span>
                              <span>•</span>
                              <span className="text-rose-600 font-medium truncate">
                                {book.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {alreadyLinked ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 shrink-0">
                              <Check className="w-3.5 h-3.5" />
                              <span>مرتبط حالياً</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmLinkBook(book.id)}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ربط بالدرس</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setLinkingLesson(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* Sticky Bottom Action Bar with "ابحثي عن كتاب" */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/95 backdrop-blur-md border-t border-sky-100 shadow-xl no-print"
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-right w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                    الدرس المختار
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({selectedLessonBooks.length} كتب متوفرة في المركز)
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate max-w-md mt-0.5">
                  {selectedLesson.title}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  id="search-books-button"
                  onClick={onContinueToBooks}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-sky-100" />
                  <span>استعراض كتب المصادر المقررة</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
