/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Book, ScienceLesson } from '../types';
import { db } from '../services/db';
import {
  Search,
  BookOpen,
  MapPin,
  Barcode,
  Bookmark,
  Check,
  Sparkles,
  ChevronRight,
  Filter,
  PlusCircle,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LibrarySelectionProps {
  selectedLesson: ScienceLesson;
  allBooks: Book[];
  selectedBookId?: string;
  onSelectBook: (book: Book) => void;
  onChangeLesson: () => void;
  onOpenAddBookModal?: () => void;
}

export const LibrarySelection: React.FC<LibrarySelectionProps> = ({
  selectedLesson,
  allBooks,
  selectedBookId,
  onSelectBook,
  onChangeLesson,
  onOpenAddBookModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'linked' | 'all'>('linked');

  // Linked books for this specific lesson
  const linkedData = useMemo(() => {
    return db.getBooksForLesson(selectedLesson.id);
  }, [selectedLesson.id, allBooks]);

  const linkedBooks = useMemo(() => {
    return linkedData.map((d) => d.book);
  }, [linkedData]);

  // Base pool of books depending on viewMode
  const baseBooks = useMemo(() => {
    if (viewMode === 'linked' && linkedBooks.length > 0) {
      return linkedBooks;
    }
    return allBooks;
  }, [viewMode, linkedBooks, allBooks]);

  // Filtered by search query
  const displayedBooks = useMemo(() => {
    if (!searchQuery.trim()) return baseBooks;
    const q = searchQuery.toLowerCase();
    return baseBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.classificationNumber.toLowerCase().includes(q) ||
        b.serialNumber.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
    );
  }, [baseBooks, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Top Breadcrumb & Selected Lesson context */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <button
          onClick={onChangeLesson}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>تغيير درس العلوم ({selectedLesson.title})</span>
        </button>

        {onOpenAddBookModal && (
          <button
            onClick={onOpenAddBookModal}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>إضافة كتاب جديد لمركز المصادر</span>
          </button>
        )}
      </div>

      {/* Main Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>مكتبة مركز مصادر التعلم • رحلة عقل</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
          الكتب المرتبطة بدرس: {selectedLesson.title}
        </h2>
        <p className="text-sm text-slate-500">
          ابحثي عن كتابكِ المعرفي، توجهي إلى الرف المخصص بالمركز لقراءته، ثم اختاريه للتوثيق
        </p>
      </div>

      {/* Search Bar & Mode Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-8 space-y-4">
        {/* Search input titled: "ابحثي عن كتاب" as explicitly specified */}
        <div className="relative">
          <input
            id="book-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحثي عن كتاب (بالعنوان، اسم المؤلف، رقم التصنيف، أو موضوع الكتاب)..."
            className="w-full pl-4 pr-11 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-3 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('linked')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'linked'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>الكتب المقترحة لهذا الدرس ({linkedBooks.length})</span>
            </button>

            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>جميع كتب المركز ({allBooks.length})</span>
            </button>
          </div>

          <div className="text-slate-400 text-[11px] hidden sm:block">
            يعرض {displayedBooks.length} كتاب
          </div>
        </div>
      </div>

      {/* Book Cards Grid */}
      {displayedBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-700 mb-1">
            لم نجد كتبًا مطابقة لعملية البحث
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            يمكنكِ استعراض جميع كتب المركز أو البحث بكلمات أخرى
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setViewMode('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
          >
            عرض جميع كتب مركز مصادر التعلم
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBooks.map((book) => {
            const isSelected = selectedBookId === book.id;
            const relationNote = linkedData.find((r) => r.book.id === book.id)?.note;

            return (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
              >
                <div
                  id={`book-card-${book.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between h-full group ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-200 shadow-md'
                      : 'border-slate-200/80 hover:border-sky-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Cover Image & Badges */}
                  <div>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback graceful banner
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1532012164546-f432f2e3745b?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent" />

                      {/* Dewey Classification Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 shadow-xs border border-white/60 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-sky-600" />
                        <span>تصنيف: {book.classificationNumber}</span>
                      </div>

                      {/* Serial Number */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white/90">
                        {book.serialNumber}
                      </div>

                      {/* Title over cover bottom */}
                      <div className="absolute bottom-3 right-3 left-3">
                        <h3 className="text-white font-bold text-base line-clamp-1 drop-shadow-xs">
                          {book.title}
                        </h3>
                        <p className="text-white/80 text-xs truncate">
                          المؤلف: {book.author}
                        </p>
                      </div>
                    </div>

                    {/* Book Metadata details */}
                    <div className="p-4 space-y-3">
                      {/* Physical Location in Center */}
                      <div className="flex items-start gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">مكان الكتاب في المركز: </span>
                          <span>{book.location}</span>
                        </div>
                      </div>

                      {/* Very brief description */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {book.description}
                      </p>

                      {/* If there's a relevance note for this lesson */}
                      {relationNote && (
                        <div className="flex items-start gap-1.5 text-[11px] bg-teal-50/70 border border-teal-200/60 text-teal-800 p-2 rounded-lg">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>صلته بالدرس:</strong> {relationNote}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Choose this book button */}
                  <div className="p-4 pt-0">
                    <button
                      id={`choose-book-btn-${book.id}`}
                      onClick={() => onSelectBook(book)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-xs hover:shadow-md'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>اخترتِ هذا الكتاب (المتابعة للتوثيق)</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4" />
                          <span>اخترت هذا الكتاب</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
