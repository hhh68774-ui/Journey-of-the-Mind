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
  Tag,
  Barcode,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Zap,
  Dna,
  Atom,
  Brain,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LrcCatalogBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookForJourney?: (book: Book) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'جميع الكتب', icon: BookOpen, filter: () => true },
  {
    id: 'physics',
    label: 'الفيزياء والعلوم الطبيعية (530)',
    icon: Zap,
    filter: (b: Book) => b.classificationNumber.includes('53') || b.location.includes('الفيزياء'),
  },
  {
    id: 'chemistry',
    label: 'الكيمياء والمواد (540)',
    icon: Atom,
    filter: (b: Book) => b.classificationNumber.includes('54') || b.location.includes('الكيمياء'),
  },
  {
    id: 'biology',
    label: 'علوم الحياة والأحياء (570-599)',
    icon: Dna,
    filter: (b: Book) =>
      b.classificationNumber.includes('57') ||
      b.classificationNumber.includes('58') ||
      b.classificationNumber.includes('59') ||
      b.location.includes('الأحياء') ||
      b.location.includes('الحياة'),
  },
  {
    id: 'medical',
    label: 'الطب وجسم الإنسان (610-619)',
    icon: Brain,
    filter: (b: Book) => b.classificationNumber.includes('61') || b.location.includes('الطب'),
  },
  {
    id: 'math',
    label: 'الرياضيات والإحصاء (510)',
    icon: Tag,
    filter: (b: Book) => b.classificationNumber.includes('51') || b.location.includes('الرياضيات'),
  },
  {
    id: 'space',
    label: 'الفلك والفضاء والكون (520)',
    icon: Compass,
    filter: (b: Book) => b.classificationNumber.includes('52') || b.location.includes('الفلك'),
  },
  {
    id: 'earth',
    label: 'علوم الأرض والبيئة (550)',
    icon: Layers,
    filter: (b: Book) => b.classificationNumber.includes('55') || b.location.includes('الأرض'),
  },
  {
    id: 'general',
    label: 'العلوم العامة والموسوعات (500)',
    icon: Sparkles,
    filter: (b: Book) =>
      b.classificationNumber.startsWith('50') || b.location.includes('العلوم العامة'),
  },
  {
    id: 'tech',
    label: 'التكنولوجيا والروبوت (620-699)',
    icon: Tag,
    filter: (b: Book) =>
      (b.classificationNumber.includes('62') ||
        b.classificationNumber.includes('65') ||
        b.classificationNumber.includes('68')) &&
      !b.classificationNumber.includes('61'),
  },
];

export const LrcCatalogBrowser: React.FC<LrcCatalogBrowserProps> = ({
  isOpen,
  onClose,
  onSelectBookForJourney,
}) => {
  const [allBooks] = useState<Book[]>(() => db.getBooks());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);

  const PAGE_SIZE = 30;

  // Filtered books
  const filteredBooks = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
    const q = searchQuery.toLowerCase().trim();

    return allBooks.filter((book) => {
      const matchesCat = cat.filter(book);
      if (!matchesCat) return false;

      if (!q) return true;

      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.classificationNumber.toLowerCase().includes(q) ||
        book.serialNumber.toLowerCase().includes(q) ||
        (book.location && book.location.toLowerCase().includes(q)) ||
        (book.publisher && book.publisher.toLowerCase().includes(q)) ||
        (book.description && book.description.toLowerCase().includes(q))
      );
    });
  }, [allBooks, searchQuery, selectedCategory]);

  // Total pages
  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE) || 1;

  // Page items
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [filteredBooks, currentPage]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-teal-700 via-sky-700 to-indigo-800 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  قائمة كتب مركز مصادر التعلم
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  {allBooks.length} كتاباً مسجلاً
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-100">
                  مدرسة المنارة للبنات
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-1">
                الفهرس الشامل والموثق لمقتنيات مركز مصادر التعلم - البحث بالرقم العام، رقم التصنيف، العنوان، أو المؤلف
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Statistics Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحثي في 1124 كتاباً (العنوان، المؤلف، رقم التصنيف مثل 530، الرقم العام مثل 003459)..."
              className="w-full pl-4 pr-11 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-300 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* Quick counts */}
          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0 font-medium justify-between sm:justify-end">
            <span>النتائج:</span>
            <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {filteredBooks.length} كتاب مطابق
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = allBooks.filter(cat.filter).length;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-teal-800 text-teal-100' : 'bg-white text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Books List (Grid of Cards) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {filteredBooks.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">لا توجد كتب مطابقة لخيارات البحث</h4>
              <p className="text-xs text-slate-400 mt-1">جربي كتابة كلمة بحث أخرى أو اختيار تصنيف مختلف</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-teal-600 font-bold hover:underline cursor-pointer"
              >
                إعادة تعيين خيارات البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBooks.map((book) => {
                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar: Serial Number & Dewey Class */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[11px] flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-teal-400" />
                            <span>{book.serialNumber}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-[11px]">
                            {book.classificationNumber}
                          </span>
                        </div>

                        {book.publishYear && book.publishYear !== 'غير محدد' && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {book.publishYear} م
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-black text-slate-800 text-base leading-snug group-hover:text-teal-700 transition-colors line-clamp-2 mb-1.5">
                        {book.title}
                      </h4>

                      {/* Author */}
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                        <span className="text-slate-400">المؤلف: </span>
                        <span className="font-semibold text-slate-700">{book.author}</span>
                      </p>

                      {/* Location / Shelf */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="line-clamp-1">{book.location}</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {book.publisher && book.publisher !== 'مركز مصادر التعلم' && (
                        <span className="text-[10px] text-slate-400 line-clamp-1 truncate max-w-[120px]">
                          {book.publisher}
                        </span>
                      )}

                      {onSelectBookForJourney && (
                        <button
                          onClick={() => {
                            onSelectBookForJourney(book);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer mr-auto shadow-2xs"
                        >
                          <span>اختيار للرحلة</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination & Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-500">
            صفحة <span className="font-bold text-slate-800">{currentPage}</span> من{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> (إجمالي{' '}
            <span className="font-bold text-teal-700">{filteredBooks.length}</span> كتاباً)
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
