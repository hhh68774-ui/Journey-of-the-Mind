/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HydratedJourney } from '../types';
import {
  BookOpen,
  Lightbulb,
  Brain,
  Sparkles,
  Printer,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Share2,
  Award,
  BookmarkCheck,
  Users,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

interface AchievementScreenProps {
  hydratedJourney: HydratedJourney;
  onStartNewJourney: () => void;
}

export const AchievementScreen: React.FC<AchievementScreenProps> = ({
  hydratedJourney,
  onStartNewJourney,
}) => {
  const { student, grade, lesson, book, photo, summary, journey } = hydratedJourney;

  // Trigger celebration confetti
  useEffect(() => {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#38bdf8', '#14b8a6', '#a855f7', '#fbbf24', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const formattedDate = new Date(journey.completedAt || journey.startedAt).toLocaleDateString(
    'ar-SA',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-10 no-print"
      >
        {/* Trio of Symbols: Book, Lamp, Mind */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-xs border border-sky-200">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 shadow-xs border border-amber-200">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs border border-indigo-200">
            <Brain className="w-7 h-7" />
          </div>
        </div>

        {/* Congratulatory Text Required */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3 flex items-center justify-center gap-2">
          <span>أحسنتِ</span>
          <span className="text-amber-400">🌟</span>
        </h2>
        <h3 className="text-xl sm:text-2xl font-extrabold text-teal-700 mb-4">
          لقد أكملتِ رحلة عقل جديدة
        </h3>
        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          «لم تكتفي بقراءة الدرس، بل بحثتِ واكتشفتِ وربطتِ المعرفة بالكتاب.»
        </p>
      </motion.div>

      {/* The Printable "إنجازي" Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="print-card bg-white rounded-3xl border-2 border-sky-200/90 shadow-xl overflow-hidden mb-8 relative"
      >
        {/* Decorative Top Ribbon */}
        <div className="h-3 bg-linear-to-r from-sky-400 via-teal-400 to-indigo-500" />

        <div className="p-6 sm:p-10">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4 text-center sm:text-right">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                  مركز مصادر التعلم • وثيقة إنجاز علمية
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  بِطَاقَةُ إِنْجَازِي
                </h3>
              </div>
            </div>

            {/* Date and Seal */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/70">
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>تاريخ إنجاز المهمة: {formattedDate}</span>
            </div>
          </div>

          {/* Student & Academic Grid Info */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-sky-50/70 via-teal-50/50 to-indigo-50/60 border border-sky-200/80 mb-8 space-y-4">
            {/* Top row: Team badge + Grade with Section + Teacher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-100/80 text-teal-800 text-xs font-extrabold border border-teal-200">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>اسم المجموعة: {journey.groupName || student.groupName || 'مجموعة عباقرة العلوم'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100/80 text-sky-800 text-xs font-extrabold border border-sky-200">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                  <span>الصف مع الشعبة: {grade.name} / {journey.section || student.section || '١'}</span>
                </span>
              </div>

              {(journey.teacherName || student.teacherName) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-100/80 text-indigo-800 text-xs font-extrabold border border-indigo-200">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>معلمة العلوم المشرفة: {journey.teacherName || student.teacherName}</span>
                </div>
              )}
            </div>

            {/* Bottom row: Student name, Science lesson, Book */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">
                  اسم الطالبة / الفريق:
                </span>
                <p className="text-base font-extrabold text-slate-800">
                  {student.name}
                </p>
                <span className="text-[11px] text-slate-500">
                  عضوة في {journey.groupName || student.groupName || 'مجموعة عباقرة العلوم'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">
                  درس العلوم المستكشف:
                </span>
                <p className="text-sm sm:text-base font-bold text-teal-800">
                  {lesson.title}
                </p>
                <span className="text-[11px] text-slate-500">
                  {lesson.unit}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">
                  عنوان الكتاب من المركز:
                </span>
                <p className="text-sm sm:text-base font-bold text-indigo-900 line-clamp-1">
                  {book.title}
                </p>
                <span className="text-[11px] text-slate-500">
                  تأليف: {book.author} • تصنيف: {book.classificationNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Notebook Photo & Summary Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Notebook Photo Section */}
            {photo && (
              <div className="lg:col-span-5 flex flex-col">
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-sky-600" />
                  <span>دليلي من الدفتر:</span>
                </h4>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-64 sm:h-72 flex items-center justify-center p-2">
                  <img
                    src={photo.dataUrl}
                    alt="صورة الدفتر المرفوعة"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Summary & Reflection Section */}
            <div className={`${photo ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col justify-between space-y-4`}>
              {/* Summary */}
              {summary && (
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">
                      ملخص الطالبة:
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {summary.wordCount} كلمة
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {summary.summaryText}
                  </p>
                </div>
              )}

              {/* Reflection Answer */}
              {summary?.reflectionAnswer && (
                <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/60">
                  <h5 className="text-xs font-bold text-teal-900 mb-1">
                    كيف ساعدكِ الكتاب على فهم الدرس؟
                  </h5>
                  <p className="text-xs sm:text-sm text-teal-800 leading-relaxed">
                    {summary.reflectionAnswer}
                  </p>
                </div>
              )}

              {/* Verification & Signatures Stamp of School and Center */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    <span>
                      معلمة مادة العلوم: <strong className="text-slate-700">{journey.teacherName || student.teacherName || 'معلمة العلوم'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    <span>اعتماد مركز مصادر التعلم: <strong className="text-slate-700">أخصائية المركز \ هدى الحارثية</strong></span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100/80 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700">تصميم: أخصائية مركز مصادر التعلم \ هدى الحارثية</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">فكرة: معلمات العلوم بمدرسة المنارة للبنات</span>
                  </div>
                  <span className="font-mono text-slate-400">رقم توثيق الرحلة: {journey.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
        <button
          id="new-journey-button"
          onClick={onStartNewJourney}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
          <span>ابدئي رحلة جديدة</span>
        </button>

        <button
          id="print-certificate-button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>طباعة بطاقة إنجازي (PDF)</span>
        </button>
      </div>
    </div>
  );
};
