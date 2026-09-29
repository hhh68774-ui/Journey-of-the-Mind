/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Book, Grade, HydratedJourney, LessonBookRelation, ScienceLesson } from '../types';
import { db } from '../services/db';
import {
  ShieldCheck,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  BarChart3,
  Link as LinkIcon,
  Unlink,
  Download,
  RotateCcw,
  Check,
  X,
  Sparkles,
  MapPin,
  Bookmark,
  Calendar,
  FileText,
  Camera,
  Layers,
  Database,
} from 'lucide-react';

interface SupervisorDashboardProps {
  grades: Grade[];
  lessons: ScienceLesson[];
  books: Book[];
  relations: LessonBookRelation[];
  hydratedJourneys: HydratedJourney[];
  onDataChanged: () => void;
  onExitSupervisor: () => void;
}

type DashboardTab = 'submissions' | 'statistics' | 'books' | 'lessons' | 'relations' | 'database';

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  grades,
  lessons,
  books,
  relations,
  hydratedJourneys,
  onDataChanged,
  onExitSupervisor,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('submissions');

  // Submissions search & filters
  const [searchSubmission, setSearchSubmission] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [inspectJourney, setInspectJourney] = useState<HydratedJourney | null>(null);

  // Book Modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    classificationNumber: '',
    serialNumber: '',
    location: '',
    description: '',
    coverImage: '',
    pagesCount: 100,
    publisher: '',
  });
  const [searchBookQuery, setSearchBookQuery] = useState('');
  const [bookPage, setBookPage] = useState(1);

  // Lesson Modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ScienceLesson | null>(null);
  const [filterLessonSubject, setFilterLessonSubject] = useState<string>('all');
  const [filterLessonGrade, setFilterLessonGrade] = useState<string>('all');
  const [searchLessonQuery, setSearchLessonQuery] = useState<string>('');
  const [lessonForm, setLessonForm] = useState({
    gradeId: 'grade-9',
    subject: 'فيزياء',
    semester: 'الفصل الدراسي الأول',
    unit: 'الوحدة 1: الطول والزمن',
    lessonNumber: '',
    title: '',
    brief: '',
    keywords: '',
  });

  // Relation Management state
  const [selectedLessonForRel, setSelectedLessonForRel] = useState<string>(lessons[0]?.id || '');
  const [selectedBookToLink, setSelectedBookToLink] = useState<string>(books[0]?.id || '');
  const [relevanceNote, setRelevanceNote] = useState('');

  // Statistics
  const statistics = useMemo(() => {
    return db.getStatistics();
  }, [hydratedJourneys, books, lessons]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return hydratedJourneys.filter((item) => {
      const q = searchSubmission.toLowerCase().trim();
      const group = (item.journey.groupName || item.student.groupName || '').toLowerCase();
      const teacher = (item.journey.teacherName || item.student.teacherName || '').toLowerCase();
      const sec = (item.journey.section || item.student.section || '').toLowerCase();

      const matchesQuery =
        !q ||
        item.student.name.toLowerCase().includes(q) ||
        item.grade.name.toLowerCase().includes(q) ||
        item.lesson.title.toLowerCase().includes(q) ||
        item.book.title.toLowerCase().includes(q) ||
        group.includes(q) ||
        teacher.includes(q) ||
        sec.includes(q);

      const matchesGrade = filterGrade === 'all' || item.grade.id === filterGrade;

      return matchesQuery && matchesGrade;
    });
  }, [hydratedJourneys, searchSubmission, filterGrade]);

  const filteredDashboardBooks = useMemo(() => {
    const q = searchBookQuery.toLowerCase().trim();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.classificationNumber.toLowerCase().includes(q) ||
        b.serialNumber.toLowerCase().includes(q) ||
        (b.location && b.location.toLowerCase().includes(q))
    );
  }, [books, searchBookQuery]);

  const totalBookPages = Math.ceil(filteredDashboardBooks.length / 24) || 1;

  const paginatedDashboardBooks = useMemo(() => {
    const start = (bookPage - 1) * 24;
    return filteredDashboardBooks.slice(start, start + 24);
  }, [filteredDashboardBooks, bookPage]);

  // Book CRUD Handlers
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      classificationNumber: '500 م ع',
      serialNumber: `LRC-2024-${Math.floor(100 + Math.random() * 900)}`,
      location: 'قاعة العلوم - الرف 1',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3745b?auto=format&fit=crop&w=600&q=80',
      pagesCount: 100,
      publisher: 'دار العلوم للنشر',
    });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    setBookForm({
      title: b.title,
      author: b.author,
      classificationNumber: b.classificationNumber,
      serialNumber: b.serialNumber,
      location: b.location,
      description: b.description,
      coverImage: b.coverImage,
      pagesCount: b.pagesCount || 100,
      publisher: b.publisher || '',
    });
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title.trim()) return;

    if (editingBook) {
      db.updateBook(editingBook.id, bookForm);
    } else {
      db.addBook(bookForm);
    }
    setIsBookModalOpen(false);
    onDataChanged();
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (window.confirm(`هل أنتِ متأكدة من حذف كتاب "${title}" من مركز المصادر؟`)) {
      db.deleteBook(id);
      onDataChanged();
    }
  };

  // Lesson CRUD Handlers
  const handleOpenAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      gradeId: 'grade-9',
      subject: 'فيزياء',
      semester: 'الفصل الدراسي الأول',
      unit: 'الوحدة 1: الطول والزمن',
      lessonNumber: '',
      title: '',
      brief: '',
      keywords: '',
    });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (l: ScienceLesson) => {
    setEditingLesson(l);
    setLessonForm({
      gradeId: l.gradeId,
      subject: l.subject || 'فيزياء',
      semester: l.semester,
      unit: l.unit,
      lessonNumber: l.lessonNumber || '',
      title: l.title,
      brief: l.brief || '',
      keywords: l.keywords?.join(', ') || '',
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    const payload = {
      gradeId: lessonForm.gradeId,
      subject: lessonForm.subject,
      semester: lessonForm.semester,
      unit: lessonForm.unit,
      lessonNumber: lessonForm.lessonNumber.trim(),
      title: lessonForm.title.trim(),
      brief: lessonForm.brief.trim(),
      keywords: lessonForm.keywords
        .split(/[,،]/)
        .map((k) => k.trim())
        .filter(Boolean),
    };

    if (editingLesson) {
      db.updateLesson(editingLesson.id, payload);
    } else {
      db.addLesson(payload);
    }
    setIsLessonModalOpen(false);
    onDataChanged();
  };

  const handleDeleteLesson = (id: string, title: string) => {
    if (window.confirm(`هل أنتِ متأكدة من حذف درس "${title}"؟`)) {
      db.deleteLesson(id);
      onDataChanged();
    }
  };

  // Relation Handler
  const handleCreateLink = () => {
    if (!selectedLessonForRel || !selectedBookToLink) return;
    db.linkLessonAndBook(selectedLessonForRel, selectedBookToLink, relevanceNote.trim());
    setRelevanceNote('');
    onDataChanged();
  };

  const handleUnlink = (lessonId: string, bookId: string) => {
    db.unlinkLessonAndBook(lessonId, bookId);
    onDataChanged();
  };

  // Export & Reset
  const handleExportJSON = () => {
    const jsonStr = db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rehlat_aql_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'هل تريدين إعادة تعيين بيانات مركز مصادر التعلم إلى البيانات الافتراضية النموذجية؟ سيتم تحديث الجداول كلها.'
      )
    ) {
      db.resetToDefaults();
      onDataChanged();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  لوحة مشرفة مركز مصادر التعلم
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  إدارة المبادرة
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                إدارة الكتب، دروس العلوم، ربط المصادر، ومتابعة مشاركات الطالبات في «رِحْلَةُ عَقْل»
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                  تصميم: أخصائية مركز مصادر التعلم \ هدى الحارثية
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                  فكرة: معلمات العلوم بمدرسة المنارة للبنات
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onExitSupervisor}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            العودة لرحلة الطالبة
          </button>
        </div>

        {/* Quick Stats Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100">
            <span className="text-xs text-sky-700 font-semibold block">الرحلات المنجزة</span>
            <span className="text-2xl font-black text-sky-900">{statistics.totalJourneys}</span>
          </div>
          <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-100">
            <span className="text-xs text-teal-700 font-semibold block">كتب المركز</span>
            <span className="text-2xl font-black text-teal-900">{books.length}</span>
          </div>
          <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
            <span className="text-xs text-indigo-700 font-semibold block">دروس العلوم</span>
            <span className="text-2xl font-black text-indigo-900">{lessons.length}</span>
          </div>
          <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
            <span className="text-xs text-purple-700 font-semibold block">الروابط النشطة</span>
            <span className="text-2xl font-black text-purple-900">{relations.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مشاركات الطالبات ({hydratedJourneys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'statistics'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>إحصائيات وتقارير</span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'books'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة الكتب ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'lessons'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>إدارة دروس العلوم ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('relations')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'relations'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>ربط الكتب بالدروس</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'database'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>قاعدة البيانات والجداول</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={searchSubmission}
                onChange={(e) => setSearchSubmission(e.target.value)}
                placeholder="ابحثي باسم الطالبة، الصف، الدرس، أو الكتاب..."
                className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-purple-500 font-medium"
              />
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold">تصفية حسب الصف:</span>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-hidden"
              >
                <option value="all">جميع الصفوف</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-600">لا توجد مشاركات تطابق خيارات البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.journey.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            {sub.grade.name} / الشعبة {sub.journey.section || sub.student.section || '١'}
                          </span>
                          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                            {sub.journey.groupName || sub.student.groupName || 'مجموعة عباقرة العلوم'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                          {sub.student.name}
                        </h3>
                        {(sub.journey.teacherName || sub.student.teacherName) && (
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            إشراف المعلمة: {sub.journey.teacherName || sub.student.teacherName}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(sub.journey.completedAt || sub.journey.startedAt).toLocaleDateString(
                          'ar-SA'
                        )}
                      </span>
                    </div>

                    {/* Lesson & Book Info */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p>
                        <strong className="text-slate-700">درس العلوم:</strong> {sub.lesson.title}
                      </p>
                      <p>
                        <strong className="text-slate-700">الكتاب المكتشف:</strong> {sub.book.title}
                      </p>
                    </div>

                    {/* Summary Preview */}
                    {sub.summary && (
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                        {sub.summary.summaryText}
                      </p>
                    )}
                  </div>

                  {/* Footer & Inspect Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sub.photo && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-medium">
                          <Camera className="w-3 h-3" />
                          <span>صورة الدفتر مرفقة</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setInspectJourney(sub)}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة تفاصيل المهمة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATISTICS */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Used Books in LRC */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <span>أكثر الكتب استخدامًا في مركز مصادر التعلم</span>
              </h3>

              {statistics.topBooks.length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد بيانات كافية بعد.</p>
              ) : (
                <div className="space-y-4">
                  {statistics.topBooks.slice(0, 5).map((item, idx) => {
                    const percent = Math.round(
                      (item.count / Math.max(1, statistics.totalJourneys)) * 100
                    );
                    return (
                      <div key={item.book.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            {idx + 1}. {item.book.title}
                          </span>
                          <span className="text-sky-600 font-bold">
                            {item.count} رحلات ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Most Linked Lessons */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <span>أكثر دروس العلوم ارتباطًا بالقراءة والبحث</span>
              </h3>

              {statistics.topLessons.length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد بيانات كافية بعد.</p>
              ) : (
                <div className="space-y-4">
                  {statistics.topLessons.slice(0, 5).map((item, idx) => {
                    const percent = Math.round(
                      (item.count / Math.max(1, statistics.totalJourneys)) * 100
                    );
                    return (
                      <div key={item.lesson.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            {idx + 1}. {item.lesson.title}
                          </span>
                          <span className="text-teal-600 font-bold">
                            {item.count} رحلات ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>توزيع الرحلات العلمية المنجزة حسب الصفوف</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {grades.map((grade) => {
                const count = statistics.gradeDistribution[grade.name] || 0;
                return (
                  <div
                    key={grade.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center"
                  >
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      {grade.name}
                    </span>
                    <span className="text-2xl font-black text-purple-700">{count}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">رحلة مكتملة</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKS MANAGEMENT */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  مكتبة مركز مصادر التعلم
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {books.length} كتاباً مسجلاً
                </span>
              </div>
              <p className="text-xs text-slate-500">
                إضافة وتعديل وحذف كتب المركز، وتحديد أرقام التصنيف وأماكنها على الرفوف
              </p>
            </div>

            <button
              onClick={handleOpenAddBook}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كتاب جديد</span>
            </button>
          </div>

          {/* Search box for Books */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchBookQuery}
                onChange={(e) => {
                  setSearchBookQuery(e.target.value);
                  setBookPage(1);
                }}
                placeholder="ابحثي في كتب المركز (العنوان، المؤلف، رقم التصنيف، الرقم العام)..."
                className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              {searchBookQuery && (
                <button
                  onClick={() => {
                    setSearchBookQuery('');
                    setBookPage(1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 shrink-0">
              يعرض <span className="font-bold text-slate-800">{filteredDashboardBooks.length}</span> كتاباً
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedDashboardBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 bg-slate-100 relative overflow-hidden">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                      تصنيف: {b.classificationNumber}
                    </div>
                    <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                      {b.serialNumber}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{b.title}</h4>
                    <p className="text-xs text-slate-500">المؤلف: {b.author}</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{b.location}</span>
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => handleOpenEditBook(b)}
                    className="p-2 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                    title="تعديل الكتاب"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(b.id, b.title)}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف الكتاب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Book Pagination */}
          {totalBookPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500">
                صفحة <span className="font-bold text-slate-800">{bookPage}</span> من{' '}
                <span className="font-bold text-slate-800">{totalBookPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={bookPage <= 1}
                  onClick={() => setBookPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                >
                  السابق
                </button>
                <button
                  disabled={bookPage >= totalBookPages}
                  onClick={() => setBookPage((p) => Math.min(totalBookPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LESSONS MANAGEMENT */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                قائمة دروس مادة العلوم (الصفوف 5 - 9)
              </h3>
              <p className="text-xs text-slate-500">
                إضافة وتعديل دروس المنهج وتوزيعها على الصفوف والوحدات والفصول الدراسية
              </p>
            </div>

            <button
              onClick={handleOpenAddLesson}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة درس علوم جديد</span>
            </button>
          </div>

          {/* Filters for lessons */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">تصفية حسب:</span>
              <select
                value={filterLessonGrade}
                onChange={(e) => setFilterLessonGrade(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium"
              >
                <option value="all">جميع الصفوف</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <select
                value={filterLessonSubject}
                onChange={(e) => setFilterLessonSubject(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium"
              >
                <option value="all">جميع المواد (فيزياء / أحياء / كيمياء / عامة)</option>
                <option value="فيزياء">فيزياء</option>
                <option value="أحياء">أحياء</option>
                <option value="كيمياء">كيمياء</option>
                <option value="العلوم العامة">العلوم العامة</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchLessonQuery}
                onChange={(e) => setSearchLessonQuery(e.target.value)}
                placeholder="ابحثي بعنوان الدرس أو رقمه..."
                className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-4">الصف</th>
                    <th className="p-4">المادة</th>
                    <th className="p-4">الفصل</th>
                    <th className="p-4">الوحدة</th>
                    <th className="p-4">عنوان الدرس</th>
                    <th className="p-4">الكتب المرتبطة</th>
                    <th className="p-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lessons
                    .filter((l) => {
                      const q = searchLessonQuery.toLowerCase().trim();
                      const matchesSearch =
                        !q ||
                        l.title.toLowerCase().includes(q) ||
                        (l.lessonNumber && l.lessonNumber.toLowerCase().includes(q)) ||
                        (l.unit && l.unit.toLowerCase().includes(q));
                      const matchesGrade = filterLessonGrade === 'all' || l.gradeId === filterLessonGrade;
                      const matchesSubject = filterLessonSubject === 'all' || l.subject === filterLessonSubject;
                      return matchesSearch && matchesGrade && matchesSubject;
                    })
                    .map((lesson) => {
                      const gradeName = grades.find((g) => g.id === lesson.gradeId)?.name || 'غير محدد';
                      const linkedCount = db.getBooksForLesson(lesson.id).length;

                      return (
                        <tr key={lesson.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-bold text-sky-700">{gradeName}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {lesson.subject || 'العلوم'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{lesson.semester}</td>
                          <td className="p-4 font-medium text-teal-700">{lesson.unit}</td>
                          <td className="p-4 font-bold text-slate-800 max-w-xs">{lesson.title}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-100">
                              {linkedCount} كتب متوفرة
                            </span>
                          </td>
                          <td className="p-4 text-left">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditLesson(lesson)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RELATIONS MANAGEMENT */}
      {activeTab === 'relations' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              ربط كتب مركز مصادر التعلم بدروس العلوم
            </h3>
            <p className="text-xs text-slate-500">
              تستطيعين ربط أكثر من كتاب بكل درس علوم، مع إضافة ملاحظة إرشادية توضح وجه الارتباط
            </p>
          </div>

          {/* Linker Action Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-purple-600" />
              <span>إنشاء رابط جديد بين درس وكتاب</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. اختاري درس العلوم:
                </label>
                <select
                  value={selectedLessonForRel}
                  onChange={(e) => setSelectedLessonForRel(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-hidden"
                >
                  {lessons.map((l) => {
                    const gradeName = grades.find((g) => g.id === l.gradeId)?.name;
                    return (
                      <option key={l.id} value={l.id}>
                        [{gradeName}] {l.title}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. اختاري الكتاب من المركز:
                </label>
                <select
                  value={selectedBookToLink}
                  onChange={(e) => setSelectedBookToLink(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-hidden"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.classificationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. ملاحظة صلة الكتاب بالدرس (اختياري):
                </label>
                <input
                  type="text"
                  value={relevanceNote}
                  onChange={(e) => setRelevanceNote(e.target.value)}
                  placeholder="مثال: الفصل الثاني يشرح تجارب هذا الدرس"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={handleCreateLink}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>اعتماد ربط الكتاب بالدرس</span>
            </button>
          </div>

          {/* Existing Links List for the currently inspected lesson */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 mb-4">
              الكتب المرتبطة حاليًا بالدرس المحدد:
            </h4>

            {(() => {
              const currentLinked = db.getBooksForLesson(selectedLessonForRel);
              if (currentLinked.length === 0) {
                return (
                  <p className="text-xs text-slate-400">
                    لا توجد كتب مرتبطة بهذا الدرس حاليًا. يمكنكِ ربط كتاب من النموذج أعلاه.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentLinked.map(({ book, note }) => (
                    <div
                      key={book.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">{book.title}</h5>
                        <p className="text-[11px] text-slate-500">
                          {book.author} • رف: {book.location}
                        </p>
                        {note && (
                          <p className="text-[10px] text-teal-700 mt-1 font-medium bg-teal-50 px-2 py-0.5 rounded inline-block">
                            {note}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleUnlink(selectedLessonForRel, book.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="إلغاء الربط"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 6: DATABASE & BACKUP */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>هيكلية وتخزين قاعدة بيانات «رِحْلَةُ عَقْل»</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              قاعدة بيانات علائقية متكاملة مقسمة إلى 8 جداول مستقلة وفقًا لمتطلبات المبادرة
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول الطالبات</span>
              <p className="text-xl font-black text-slate-800 mt-1">{db.getStudents().length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول الصفوف</span>
              <p className="text-xl font-black text-slate-800 mt-1">{grades.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول دروس العلوم</span>
              <p className="text-xl font-black text-slate-800 mt-1">{lessons.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول الكتب</span>
              <p className="text-xl font-black text-slate-800 mt-1">{books.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول علاقات الربط</span>
              <p className="text-xl font-black text-slate-800 mt-1">{relations.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول رحلات الطالبات</span>
              <p className="text-xl font-black text-slate-800 mt-1">{db.getJourneys().length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول الصور المرفوعة</span>
              <p className="text-xl font-black text-slate-800 mt-1">{db.getPhotos().length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500">جدول الملخصات</span>
              <p className="text-xl font-black text-slate-800 mt-1">{db.getSummaries().length}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير نسخة احتياطية من قاعدة البيانات (JSON)</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة البيانات النموذجية الافتراضية</span>
            </button>
          </div>
        </div>
      )}

      {/* INSPECT SUBMISSION MODAL */}
      {inspectJourney && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-800">
                  تفاصيل رحلة الطالبة: {inspectJourney.student.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectJourney(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs">الصف مع الشعبة:</span>
                  <span className="font-bold text-slate-800">
                    {inspectJourney.grade.name} / الشعبة {inspectJourney.journey.section || inspectJourney.student.section || '١'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">اسم المجموعة:</span>
                  <span className="font-bold text-teal-700">
                    {inspectJourney.journey.groupName || inspectJourney.student.groupName || 'مجموعة عباقرة العلوم'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">معلمة العلوم المشرفة:</span>
                  <span className="font-bold text-indigo-700">
                    {inspectJourney.journey.teacherName || inspectJourney.student.teacherName || 'أ. معلمة العلوم'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">اسم الطالبة / الفريق:</span>
                  <span className="font-bold text-slate-800">{inspectJourney.student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">درس العلوم:</span>
                  <span className="font-bold text-slate-800">{inspectJourney.lesson.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">الكتاب المكتشف:</span>
                  <span className="font-bold text-slate-800">{inspectJourney.book.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">تاريخ الإنجاز:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(inspectJourney.journey.completedAt || inspectJourney.journey.startedAt || '').toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              {/* Notebook Photo */}
              {inspectJourney.photo && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2">صورة الدفتر المرفوعة:</h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-80 bg-black flex items-center justify-center">
                    <img
                      src={inspectJourney.photo.dataUrl}
                      alt="دفتر الطالبة"
                      className="max-h-80 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              {inspectJourney.summary && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-700">ماذا اكتشفت من الكتاب:</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {inspectJourney.summary.summaryText}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    طول الملخص: {inspectJourney.summary.wordCount} كلمة
                  </p>
                </div>
              )}

              {/* Reflection */}
              {inspectJourney.summary?.reflectionAnswer && (
                <div className="space-y-1">
                  <h4 className="font-bold text-teal-800">إجابة سؤال التأمل العلمي:</h4>
                  <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200 text-teal-900 leading-relaxed">
                    {inspectJourney.summary.reflectionAnswer}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT BOOK MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="font-bold text-base text-slate-800">
                {editingBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد لمركز مصادر التعلم'}
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الكتاب:</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="مثال: عجائب الكيمياء الحديثة"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المؤلف:</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="مثال: د. أحمد زويل"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم التصنيف:</label>
                  <input
                    type="text"
                    required
                    value={bookForm.classificationNumber}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, classificationNumber: e.target.value })
                    }
                    placeholder="540 ز و"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي:</label>
                  <input
                    type="text"
                    required
                    value={bookForm.serialNumber}
                    onChange={(e) => setBookForm({ ...bookForm, serialNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    مكان الكتاب في المركز:
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.location}
                    onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                    placeholder="قاعة الكيمياء - الرف 2"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف مختصر جدًا للكتاب:</label>
                <textarea
                  rows={2}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="وصف شيق وموجز يوضح ما يقدمه الكتاب للطالبة..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رابط صورة الغلاف:</label>
                <input
                  type="url"
                  value={bookForm.coverImage}
                  onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  حفظ الكتاب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT LESSON MODAL */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="font-bold text-base text-slate-800">
                {editingLesson ? 'تعديل درس العلوم' : 'إضافة درس علوم جديد'}
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
                  <select
                    value={lessonForm.gradeId}
                    onChange={(e) => setLessonForm({ ...lessonForm, gradeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المادة الدراسية:</label>
                  <select
                    value={lessonForm.subject}
                    onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                  >
                    <option value="فيزياء">فيزياء</option>
                    <option value="أحياء">أحياء</option>
                    <option value="كيمياء">كيمياء</option>
                    <option value="العلوم العامة">العلوم العامة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
                  <select
                    value={lessonForm.semester}
                    onChange={(e) => setLessonForm({ ...lessonForm, semester: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                  >
                    <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
                    <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الدرس (اختياري):</label>
                  <input
                    type="text"
                    value={lessonForm.lessonNumber}
                    onChange={(e) => setLessonForm({ ...lessonForm, lessonNumber: e.target.value })}
                    placeholder="مثال: 1-1 أو 12-2"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الوحدة:</label>
                <input
                  type="text"
                  required
                  value={lessonForm.unit}
                  onChange={(e) => setLessonForm({ ...lessonForm, unit: e.target.value })}
                  placeholder="مثال: الوحدة 1: الطول والزمن"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الدرس:</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="مثال: التكاثر في النباتات والحيوانات"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نبذة عن الدرس:</label>
                <textarea
                  rows={2}
                  value={lessonForm.brief}
                  onChange={(e) => setLessonForm({ ...lessonForm, brief: e.target.value })}
                  placeholder="موجز عن المحاور الأساسية للدرس..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الكلمات الدالة (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={lessonForm.keywords}
                  onChange={(e) => setLessonForm({ ...lessonForm, keywords: e.target.value })}
                  placeholder="مثال: زهرة، تلقيح، إخصاب، بذور"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  حفظ الدرس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
