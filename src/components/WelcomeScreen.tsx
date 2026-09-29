/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FlaskConical,
  Lightbulb,
  Brain,
  ArrowLeft,
  Compass,
  ShieldCheck,
  Search,
  Zap,
  Dna,
  Atom,
  Layers,
  ChevronLeft,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Grade, ScienceLesson } from '../types';
import { db } from '../services/db';

interface WelcomeScreenProps {
  onStartJourney: () => void;
  onOpenSupervisor: () => void;
  totalJourneysCount: number;
  grades: Grade[];
  lessons: ScienceLesson[];
  onSelectLessonDirectly: (grade: Grade, lesson: ScienceLesson) => void;
  onOpenCurriculumModal?: () => void;
  onOpenLrcCatalog?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartJourney,
  onOpenSupervisor,
  totalJourneysCount,
  grades,
  lessons,
  onSelectLessonDirectly,
  onOpenCurriculumModal,
  onOpenLrcCatalog,
}) => {
  // Selected grade for the curriculum index preview on homepage
  const [selectedGradeId, setSelectedGradeId] = useState<string>('grade-9');
  const [selectedSubject, setSelectedSubject] = useState<string>('فيزياء');
  const [searchQuery, setSearchQuery] = useState('');

  const activeGrade = grades.find((g) => g.id === selectedGradeId) || grades[grades.length - 1];

  const gradeLessons = useMemo(() => {
    return lessons.filter((l) => l.gradeId === selectedGradeId);
  }, [lessons, selectedGradeId]);

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

  React.useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [availableSubjects, selectedSubject]);

  const subjectLessons = useMemo(() => {
    return gradeLessons.filter((l) => {
      if (!l.subject) return selectedSubject === 'العلوم العامة';
      return l.subject === selectedSubject;
    });
  }, [gradeLessons, selectedSubject]);

  const filteredLessons = useMemo(() => {
    return subjectLessons.filter((lesson) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        (lesson.lessonNumber && lesson.lessonNumber.toLowerCase().includes(q)) ||
        (lesson.unit && lesson.unit.toLowerCase().includes(q)) ||
        (lesson.brief && lesson.brief.toLowerCase().includes(q)) ||
        (lesson.keywords && lesson.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    });
  }, [subjectLessons, searchQuery]);

  // Group lessons by unit
  const unitsMap = useMemo(() => {
    const map = new Map<string, ScienceLesson[]>();
    filteredLessons.forEach((l) => {
      const u = l.unit || 'وحدة عامة';
      if (!map.has(u)) map.set(u, []);
      map.get(u)!.push(l);
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

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] px-4 py-10 sm:py-14 overflow-hidden">
      {/* Soft Ambient Background Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl w-full mx-auto text-center">
        {/* Core Iconic Quartet: Book, Science/Flask, Lamp, Mind */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-7"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs border border-sky-100 flex items-center justify-center text-sky-600 hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs border border-teal-100 flex items-center justify-center text-teal-600 hover:scale-105 transition-transform">
            <FlaskConical className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs border border-amber-100 flex items-center justify-center text-amber-500 hover:scale-105 transition-transform">
            <Lightbulb className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs border border-indigo-100 flex items-center justify-center text-indigo-600 hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 stroke-[1.8]" />
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tight mb-4"
        >
          رِحْلَةُ عَقْل
        </motion.h1>

        {/* The Evocative Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-lg sm:text-2xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8 text-balance"
        >
          «مِنْ دَرْسٍ نَتَعَلَّمُهُ… إِلَى كِتَابٍ نَكْتَشِفُهُ… تَبْدَأُ رِحْلَةُ الْعَقْلِ»
        </motion.p>

        {/* Explanatory description card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/85 backdrop-blur-sm border border-sky-100 rounded-2xl p-5 mb-8 text-right text-sm text-slate-600 leading-relaxed shadow-xs max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>عزيزتي الطالبة الباحثة:</span>
            </p>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
              مدرسة المنارة للبنات
            </span>
          </div>
          <p>
            هنا نربط ما تتعلمينه في حصة العلوم بكنوز الكتب والمصادر في مركز مصادر التعلم. اختاري المادة، ثم حددي الوحدة، ثم عنوان الدرس وانطلقي في استكشاف الكتب العلمية المتوفرة وتوثيق رحلتك المعرفية.
          </p>
        </motion.div>

        {/* Action Buttons: Start Journey, Lesson Titles Directory, LRC Books Catalog, Supervisor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12 max-w-3xl mx-auto"
        >
          <button
            id="start-journey-button"
            onClick={onStartJourney}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-linear-to-r from-sky-500 via-teal-500 to-indigo-600 text-white font-bold text-sm sm:text-base shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>ابدئي الرحلة المدرسية</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>

          {onOpenLrcCatalog && (
            <button
              onClick={onOpenLrcCatalog}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-900 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>قائمة كتب المصادر</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-black">
                1124 كتاباً
              </span>
            </button>
          )}

          <a
            href="#curriculum-directory-section"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white border border-indigo-200 text-indigo-800 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>فهرس عناوين الدروس</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold">
              {lessons.length}+
            </span>
          </a>

          <button
            id="supervisor-dashboard-button"
            onClick={onOpenSupervisor}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>لوحة المشرفة</span>
          </button>
        </motion.div>

        {/* Project Attribution & Credits Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="pt-6 border-t border-slate-200/70 max-w-2xl mx-auto mb-14"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
            <div className="bg-white/90 backdrop-blur-xs border border-sky-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-sky-700 block">تصميم:</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  أخصائية مركز مصادر التعلم \ هدى الحارثية
                </span>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs border border-indigo-100 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-700 block">فكرة:</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  معلمات العلوم بمدرسة المنارة للبنات
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* فهرس وعناوين الدروس المقررة التفاعلي على الصفحة الرئيسية */}
        {/* ========================================================================= */}
        <motion.section
          id="curriculum-directory-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-right bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-8 max-w-5xl mx-auto"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-sky-50 to-indigo-50 text-sky-800 border border-sky-200/70 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>دليل وعناوين الدروس المقررة في المنهج العماني</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                فهرس عناوين الدروس المقررة والكتب المرتبطة بها
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                تصفحي دروس الفيزياء، والأحياء، والكيمياء بجميع وحداتها، واضغطي على أي درس للانطلاق مباشرة في رحلة استكشافه!
              </p>
            </div>

            {onOpenCurriculumModal && (
              <button
                onClick={onOpenCurriculumModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>فتح الفهرس الشامل المنبثق</span>
              </button>
            )}
          </div>

          {/* Grade selection tabs */}
          <div className="pt-6 pb-4 flex items-center justify-between gap-3 overflow-x-auto">
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
                    onClick={() => setSelectedGradeId(grade.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{grade.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-sky-700 text-sky-100' : 'bg-white text-slate-500'
                      }`}
                    >
                      {count} درس
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Pills & Search Box */}
          <div className="py-4 border-y border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Subject Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {availableSubjects.map((subj) => {
                const isSelected = selectedSubject === subj;
                const count = gradeLessons.filter((l) => l.subject === subj || (!l.subject && subj === 'العلوم العامة')).length;

                return (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
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
                      {count} درس
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي في عناوين دروس المنهج..."
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

          {/* Lessons by Unit Container */}
          <div className="pt-6 space-y-5">
            {filteredLessons.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FlaskConical className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-600">لا توجد عناوين دروس مطابقة للبحث</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  إعادة إظهار كل الدروس
                </button>
              </div>
            ) : (
              Array.from(unitsMap.entries()).map(([unitTitle, unitLessons]) => (
                <div
                  key={unitTitle}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs"
                >
                  {/* Unit Title Bar */}
                  <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                        {unitTitle}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-indigo-700 bg-white border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {unitLessons.length} دروس
                    </span>
                  </div>

                  {/* Unit Lesson Titles Grid */}
                  <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unitLessons.map((lesson) => {
                      const linkedBooks = db.getBooksForLesson(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLessonDirectly(activeGrade, lesson)}
                          className="p-3.5 rounded-xl border border-slate-200/70 hover:border-sky-400 hover:bg-sky-50/40 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {lesson.lessonNumber && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs shrink-0 group-hover:bg-sky-600 transition-colors">
                                {lesson.lessonNumber}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-700 transition-colors line-clamp-1">
                                {lesson.title}
                              </h4>
                              {lesson.brief && (
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                  {lesson.brief}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-[11px] text-teal-700 font-semibold">
                                <BookOpen className="w-3 h-3 text-teal-600" />
                                <span>{linkedBooks.length} كتب متوفرة بالمصادر</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Stats counter */}
        {totalJourneysCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-12 text-xs text-slate-400 font-medium"
          >
            تم إنجاز <span className="text-sky-600 font-bold">{totalJourneysCount}</span> رحلة عقل ملهمة في مركز مصادر التعلم حتى الآن ✨
          </motion.div>
        )}
      </div>
    </div>
  );
};
