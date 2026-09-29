/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useId } from 'react';
import { Book, Grade, ScienceLesson } from '../types';
import { CameraModal } from './CameraModal';
import {
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  FileText,
  HelpCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  FlaskConical,
  User,
  Users,
  GraduationCap,
  ArrowRight,
  Compass,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MissionDocumentationProps {
  grade: Grade;
  lesson: ScienceLesson;
  book: Book;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  groupName: string;
  onUpdateGroupName: (name: string) => void;
  section: string;
  onUpdateSection: (section: string) => void;
  teacherName: string;
  onUpdateTeacherName: (name: string) => void;
  onSubmitMission: (data: {
    studentName: string;
    groupName: string;
    section: string;
    teacherName: string;
    photoDataUrl: string;
    photoFileName: string;
    summaryText: string;
    wordCount: number;
    reflectionAnswer: string;
  }) => void;
  onBackToBook: () => void;
}

export const MissionDocumentation: React.FC<MissionDocumentationProps> = ({
  grade,
  lesson,
  book,
  studentName,
  onUpdateStudentName,
  groupName,
  onUpdateGroupName,
  section,
  onUpdateSection,
  teacherName,
  onUpdateTeacherName,
  onSubmitMission,
  onBackToBook,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [summaryText, setSummaryText] = useState<string>('');
  const [reflectionAnswer, setReflectionAnswer] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputId = useId();

  // Word count helper
  const wordCount = summaryText.trim() ? summaryText.trim().split(/\s+/).length : 0;

  // Handle file selection from local device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
        return;
      }

      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoDataUrl(event.target.result as string);
          setValidationError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    setPhotoDataUrl(dataUrl);
    setPhotoFileName(`camera_notebook_${Date.now()}.jpg`);
    setValidationError(null);
  };

  // Submission validation
  const handleSubmit = () => {
    if (!studentName.trim()) {
      setValidationError('لطفًا، اكتبي اسم الطالبة (أو أسماء عضوات المجموعة) لتخصيص بطاقة إنجازكِ ✨');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!groupName.trim()) {
      setValidationError('لطفًا، حددي اسم المجموعة لفريقكِ المدرسي 👥');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!section.trim()) {
      setValidationError('لطفًا، أدخلي رقم أو رمز الشعبة لعرض الصف مع الشعبة بدقة 🏫');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!teacherName.trim()) {
      setValidationError('لطفًا، اكتبي اسم معلمة العلوم المشرفة 👩‍🏫');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!grade || !lesson || !book) {
      setValidationError('يرجى التأكد من اختيار الصف والدرس والكتاب لإتمام الرحلة.');
      return;
    }

    if (!photoDataUrl) {
      setValidationError('عزيزتي الطالبة، يرجى رفع صورة واضحة من دفتر العلوم في قسم «دليلي من الدفتر» 📷');
      return;
    }

    if (!summaryText.trim() || wordCount < 5) {
      setValidationError('اكتبي ملخصًا مفيدًا من الكتاب في قسم «ماذا اكتشفت من الكتاب؟» (على الأقل 5 كلمات) ✍️');
      return;
    }

    // Clear any previous error
    setValidationError(null);

    // Call submit handler
    onSubmitMission({
      studentName: studentName.trim(),
      groupName: groupName.trim(),
      section: section.trim(),
      teacherName: teacherName.trim(),
      photoDataUrl,
      photoFileName: photoFileName || 'notebook_photo.jpg',
      summaryText: summaryText.trim(),
      wordCount,
      reflectionAnswer: reflectionAnswer.trim() || 'ساعدني الكتاب على ربط المفاهيم النظرية بصور واقعية وأمثلة ملموسة.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToBook}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>الرجوع لاختيار كتاب آخر</span>
        </button>
      </div>

      {/* Screen Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 text-xs font-semibold mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>المرحلة الرابعة: التوثيق والتأمل العلمي</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
          مَهَمَّةُ رِحْلَةِ عَقْل
        </h2>
        <p className="text-sm text-slate-500">
          «اقرئي الجزء المرتبط بموضوع الدرس، ثم سجلي ما اكتشفته في رحلتك.»
        </p>
      </div>

      {/* Summary Header Card: Lesson + Book details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-sky-50 via-teal-50/40 to-indigo-50/60 border border-sky-200/80 rounded-3xl p-6 mb-8 shadow-xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Science Lesson */}
          <div className="flex items-start gap-3.5 bg-white/90 p-4 rounded-2xl border border-sky-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block mb-1">
                درس العلوم
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                {lesson.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {grade.name} • {lesson.unit}
              </p>
            </div>
          </div>

          {/* Book */}
          <div className="flex items-start gap-3.5 bg-white/90 p-4 rounded-2xl border border-teal-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block mb-1">
                الكتاب المختار من المركز
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1">
                {book.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                تأليف: {book.author} • تصنيف: {book.classificationNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Academic & Team Documentation Section */}
        <div className="mt-5 pt-5 border-t border-sky-100/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>بيانات توثيق المهمة المدرسية:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              تُطبع هذه البيانات رسميًا على بطاقة «إنجازي» لمركز مصادر التعلم
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. الصف مع الشعبة */}
            <div className="bg-white/95 p-3.5 rounded-2xl border border-sky-100/90 shadow-2xs flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                    <span>الصف مع الشعبة:</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded-md">
                    {grade.name} / {section || '١'}
                  </span>
                </label>
                <input
                  id="section-input"
                  type="text"
                  value={section}
                  onChange={(e) => onUpdateSection(e.target.value)}
                  placeholder="الشعبة (مثال: ١، ٢، أ)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:bg-white font-medium text-slate-800"
                />
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">شعبة سريعة:</span>
                {['١', '٢', '٣', '٤', '٥'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUpdateSection(num)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      section === num
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. اسم المجموعة */}
            <div className="bg-white/95 p-3.5 rounded-2xl border border-teal-100/90 shadow-2xs flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>اسم المجموعة:</span>
                </label>
                <input
                  id="group-name-input"
                  type="text"
                  value={groupName}
                  onChange={(e) => onUpdateGroupName(e.target.value)}
                  placeholder="مثال: مجموعة عباقرة العلوم"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white font-medium text-slate-800"
                />
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1">
                {['عباقرة العلوم', 'مستكشفات المجهر', 'رائدات الفضاء'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onUpdateGroupName(`مجموعة ${name}`)}
                    className="text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    +{name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. اسم المعلمة */}
            <div className="bg-white/95 p-3.5 rounded-2xl border border-indigo-100/90 shadow-2xs flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>اسم المعلمة:</span>
                </label>
                <input
                  id="teacher-name-input"
                  type="text"
                  value={teacherName}
                  onChange={(e) => onUpdateTeacherName(e.target.value)}
                  placeholder="مثال: أ. نورة الكعبي"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium text-slate-800"
                />
              </div>
              <span className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 block">
                معلمة مادة العلوم المشرفة
              </span>
            </div>

            {/* 4. اسم الطالبة / عضوات الفريق */}
            <div className="bg-white/95 p-3.5 rounded-2xl border border-purple-100/90 shadow-2xs flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>اسم الطالبة / الفريق:</span>
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => onUpdateStudentName(e.target.value)}
                  placeholder="مثال: مريم خالد، عائشة سالم"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:bg-white font-medium text-slate-800"
                />
              </div>
              <span className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 block">
                الطالبة أو الطالبات المشاركات
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Validation alert banner */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium">
              {validationError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Section 1: «دليلي من الدفتر» */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                دليلي من الدفتر
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              صورة لملاحظاتكِ، رسوماتكِ أو تجاربكِ
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            التقطي بكاميرا جهازك أو ارفعي صورة واضحة من صفحة دفتر العلوم التي توثق درسك وتوضح ما دونتِه من مفاهيم أو رسوم بيانية.
          </p>

          {/* Hidden HTML file input */}
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {photoDataUrl ? (
            /* Uploaded Photo Preview Card */
            <div className="relative rounded-2xl overflow-hidden border-2 border-teal-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-full sm:w-64 h-52 rounded-xl overflow-hidden bg-black shrink-0 shadow-xs">
                <img
                  src={photoDataUrl}
                  alt="معاينة صورة الدفتر"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-right w-full space-y-3">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم رفع صورة الدفتر بنجاح</span>
                </div>
                <p className="text-xs text-slate-500 font-mono break-all">
                  {photoFileName}
                </p>

                {/* Actions: Replace or Delete */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="replace-photo-button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                    <span>استبدال الصورة</span>
                  </button>

                  <button
                    id="delete-photo-button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Area Box */
            <div className="border-2 border-dashed border-sky-200/80 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-sky-50/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mx-auto mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 mb-1">
                ارفعي صورة صفحة الدفتر المرتبطة بالدرس
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                يمكنكِ التقاط صورة مباشرة عبر الكاميرا أو اختيار صورة من مكتبة جهازك
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  id="upload-notebook-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>رفع صورة الدفتر</span>
                </button>

                <button
                  id="camera-capture-btn"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-teal-600" />
                  <span>التقاط بالكاميرا</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: «ماذا اكتشفت من الكتاب؟» */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                ماذا اكتشفتِ من الكتاب؟
              </h3>
            </div>

            {/* Word Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              <span>عداد الكلمات:</span>
              <span className={`font-black ${wordCount >= 10 ? 'text-teal-600' : 'text-slate-700'}`}>
                {wordCount} كلمة
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            لخصي المعلومات الجديدة والمثيرة التي وجدتها بين صفحات كتاب ({book.title})، وكيف أضافت لفهمك لموضوع ({lesson.title}).
          </p>

          <textarea
            id="summary-textarea"
            rows={5}
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="اكتبي بأسلوبك أهم المعلومات التي تعلمتها من الكتاب، وما علاقتها بدرس العلوم."
            className="w-full p-4 text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-3 focus:ring-teal-100 transition-all placeholder:text-slate-400 leading-relaxed resize-y min-h-[140px]"
          />
        </div>

        {/* Section 3: Reflection Question */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              سؤال التأمل العلمي:
            </h3>
          </div>

          <label className="block text-sm font-semibold text-slate-700 mb-2">
            كيف ساعدكِ الكتاب على فهم الدرس بصورة أفضل؟
          </label>

          <input
            id="reflection-input"
            type="text"
            value={reflectionAnswer}
            onChange={(e) => setReflectionAnswer(e.target.value)}
            placeholder="مثال: ساعدني في رؤية صور مجسمة واقعية للخلايا وشرح أثرها في الحياة اليومية..."
            className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-100 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Final Submit Button: «إنهاء رحلة العقل» */}
        <div className="pt-4 text-center">
          <button
            id="finish-journey-button"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-linear-to-r from-teal-500 via-sky-600 to-indigo-600 hover:from-teal-600 hover:via-sky-700 hover:to-indigo-700 text-white font-black text-lg shadow-md shadow-sky-200 hover:shadow-lg transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>إنهاء رحلة العقل</span>
          </button>
          <p className="text-xs text-slate-400 mt-2">
            سيتم توثيق إنجازكِ وإصدار بطاقة «إنجازي» فور الضغط على الزر
          </p>
        </div>
      </div>

      {/* Camera Modal component */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
