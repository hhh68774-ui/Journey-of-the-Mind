/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Book,
  Grade,
  HydratedJourney,
  LessonBookRelation,
  ScienceLesson,
  Student,
  StudentJourney,
  SummaryRecord,
  UploadedPhoto,
} from '../types';
import {
  initialBooks,
  initialGrades,
  initialJourneys,
  initialLessons,
  initialPhotos,
  initialRelations,
  initialStudents,
  initialSummaries,
} from './seedData';

const STORAGE_KEYS = {
  GRADES: 'rehlat_aql_grades_v4',
  LESSONS: 'rehlat_aql_lessons_v4',
  BOOKS: 'rehlat_aql_books_v4',
  RELATIONS: 'rehlat_aql_relations_v4',
  STUDENTS: 'rehlat_aql_students_v4',
  JOURNEYS: 'rehlat_aql_journeys_v4',
  PHOTOS: 'rehlat_aql_photos_v4',
  SUMMARIES: 'rehlat_aql_summaries_v4',
};

// Safe localStorage helper with auto-merging of new seed data
function loadTable<T extends { id?: string }>(key: string, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed: T[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map((item) => item.id).filter(Boolean));
    let hasNew = false;
    for (const item of defaultData) {
      if (item.id && !existingIds.has(item.id)) {
        parsed.push(item);
        hasNew = true;
      }
    }
    // Also if parsed has fewer items than defaultData (e.g. initial incomplete cache)
    if (parsed.length < defaultData.length) {
      for (const item of defaultData) {
        if (!parsed.some((p) => p.id === item.id)) {
          parsed.push(item);
          hasNew = true;
        }
      }
    }
    if (hasNew) {
      localStorage.setItem(key, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error(`Error loading table ${key}:`, err);
    return defaultData;
  }
}

function saveTable<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifySubscribers();
  } catch (err) {
    console.error(`Error saving table ${key}:`, err);
  }
}

type Listener = () => void;
const subscribers: Set<Listener> = new Set();

export function subscribeDatabase(listener: Listener): () => void {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notifySubscribers() {
  subscribers.forEach((fn) => fn());
}

export const db = {
  // --- الصفوف (Grades) ---
  getGrades(): Grade[] {
    return loadTable<Grade>(STORAGE_KEYS.GRADES, initialGrades);
  },
  getGradeById(id: string): Grade | undefined {
    return this.getGrades().find((g) => g.id === id);
  },

  // --- دروس العلوم (Science Lessons) ---
  getLessons(): ScienceLesson[] {
    return loadTable<ScienceLesson>(STORAGE_KEYS.LESSONS, initialLessons);
  },
  getLessonsByGrade(gradeId: string): ScienceLesson[] {
    return this.getLessons().filter((l) => l.gradeId === gradeId);
  },
  getLessonById(id: string): ScienceLesson | undefined {
    return this.getLessons().find((l) => l.id === id);
  },
  addLesson(lesson: Omit<ScienceLesson, 'id'>): ScienceLesson {
    const lessons = this.getLessons();
    const newLesson: ScienceLesson = {
      ...lesson,
      id: `les-${Date.now()}`,
    };
    lessons.push(newLesson);
    saveTable(STORAGE_KEYS.LESSONS, lessons);
    return newLesson;
  },
  updateLesson(id: string, updates: Partial<ScienceLesson>): boolean {
    const lessons = this.getLessons();
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) return false;
    lessons[index] = { ...lessons[index], ...updates };
    saveTable(STORAGE_KEYS.LESSONS, lessons);
    return true;
  },
  deleteLesson(id: string): boolean {
    let lessons = this.getLessons();
    const initialLen = lessons.length;
    lessons = lessons.filter((l) => l.id !== id);
    if (lessons.length !== initialLen) {
      saveTable(STORAGE_KEYS.LESSONS, lessons);
      // Clean relations
      const rels = this.getRelations().filter((r) => r.lessonId !== id);
      saveTable(STORAGE_KEYS.RELATIONS, rels);
      return true;
    }
    return false;
  },

  // --- الكتب (Books) ---
  getBooks(): Book[] {
    return loadTable<Book>(STORAGE_KEYS.BOOKS, initialBooks);
  },
  getBookById(id: string): Book | undefined {
    return this.getBooks().find((b) => b.id === id);
  },
  addBook(book: Omit<Book, 'id'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: `book-${Date.now()}`,
    };
    books.unshift(newBook);
    saveTable(STORAGE_KEYS.BOOKS, books);
    return newBook;
  },
  updateBook(id: string, updates: Partial<Book>): boolean {
    const books = this.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) return false;
    books[index] = { ...books[index], ...updates };
    saveTable(STORAGE_KEYS.BOOKS, books);
    return true;
  },
  deleteBook(id: string): boolean {
    let books = this.getBooks();
    const initialLen = books.length;
    books = books.filter((b) => b.id !== id);
    if (books.length !== initialLen) {
      saveTable(STORAGE_KEYS.BOOKS, books);
      // Clean relations
      const rels = this.getRelations().filter((r) => r.bookId !== id);
      saveTable(STORAGE_KEYS.RELATIONS, rels);
      return true;
    }
    return false;
  },

  // --- العلاقة بين الدروس والكتب (Relations) ---
  getRelations(): LessonBookRelation[] {
    return loadTable<LessonBookRelation>(STORAGE_KEYS.RELATIONS, initialRelations);
  },
  getBooksForLesson(lessonId: string): { book: Book; note?: string }[] {
    const relations = this.getRelations().filter((r) => r.lessonId === lessonId);
    const books = this.getBooks();
    const result: { book: Book; note?: string }[] = [];

    relations.forEach((rel) => {
      const book = books.find((b) => b.id === rel.bookId);
      if (book) {
        result.push({ book, note: rel.relevanceNote });
      }
    });

    return result;
  },
  getLessonsForBook(bookId: string): ScienceLesson[] {
    const relations = this.getRelations().filter((r) => r.bookId === bookId);
    const lessons = this.getLessons();
    const result: ScienceLesson[] = [];
    relations.forEach((rel) => {
      const lesson = lessons.find((l) => l.id === rel.lessonId);
      if (lesson) {
        result.push(lesson);
      }
    });
    return result;
  },
  linkLessonAndBook(lessonId: string, bookId: string, relevanceNote?: string): LessonBookRelation {
    const relations = this.getRelations();
    const existing = relations.find((r) => r.lessonId === lessonId && r.bookId === bookId);
    if (existing) {
      existing.relevanceNote = relevanceNote || existing.relevanceNote;
      saveTable(STORAGE_KEYS.RELATIONS, relations);
      return existing;
    }
    const newRel: LessonBookRelation = {
      id: `rel-${Date.now()}`,
      lessonId,
      bookId,
      relevanceNote,
    };
    relations.push(newRel);
    saveTable(STORAGE_KEYS.RELATIONS, relations);
    return newRel;
  },
  unlinkLessonAndBook(lessonId: string, bookId: string): boolean {
    let relations = this.getRelations();
    const before = relations.length;
    relations = relations.filter((r) => !(r.lessonId === lessonId && r.bookId === bookId));
    if (relations.length !== before) {
      saveTable(STORAGE_KEYS.RELATIONS, relations);
      return true;
    }
    return false;
  },

  // --- الطالبات (Students) ---
  getStudents(): Student[] {
    return loadTable<Student>(STORAGE_KEYS.STUDENTS, initialStudents);
  },
  findOrCreateStudent(
    name: string,
    gradeId: string,
    schoolName?: string,
    section?: string,
    groupName?: string,
    teacherName?: string
  ): Student {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.name.trim() === name.trim() && s.gradeId === gradeId);
    if (index !== -1) {
      if (section || groupName || teacherName) {
        students[index] = {
          ...students[index],
          section: section || students[index].section,
          groupName: groupName || students[index].groupName,
          teacherName: teacherName || students[index].teacherName,
        };
        saveTable(STORAGE_KEYS.STUDENTS, students);
      }
      return students[index];
    }

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: name.trim(),
      gradeId,
      section: section || '١',
      groupName: groupName || 'مجموعة رائدات العلوم',
      teacherName: teacherName || '',
      schoolName: schoolName || 'مركز مصادر التعلم',
      registeredAt: new Date().toISOString(),
    };
    students.push(newStudent);
    saveTable(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  },

  // --- الصور المرفوعة (Photos) ---
  getPhotos(): UploadedPhoto[] {
    return loadTable<UploadedPhoto>(STORAGE_KEYS.PHOTOS, initialPhotos);
  },
  getPhotoByJourneyId(journeyId: string): UploadedPhoto | undefined {
    return this.getPhotos().find((p) => p.journeyId === journeyId);
  },

  // --- الملخصات (Summaries) ---
  getSummaries(): SummaryRecord[] {
    return loadTable<SummaryRecord>(STORAGE_KEYS.SUMMARIES, initialSummaries);
  },
  getSummaryByJourneyId(journeyId: string): SummaryRecord | undefined {
    return this.getSummaries().find((s) => s.journeyId === journeyId);
  },

  // --- رحلات الطالبات (Journeys) ---
  getJourneys(): StudentJourney[] {
    return loadTable<StudentJourney>(STORAGE_KEYS.JOURNEYS, initialJourneys);
  },
  getJourneyById(id: string): StudentJourney | undefined {
    return this.getJourneys().find((j) => j.id === id);
  },

  // Full submission flow with relational transaction
  completeJourney(data: {
    studentName: string;
    groupName?: string;
    section?: string;
    teacherName?: string;
    gradeId: string;
    lessonId: string;
    bookId: string;
    photoDataUrl: string;
    photoFileName: string;
    photoFileSize?: number;
    summaryText: string;
    wordCount: number;
    reflectionAnswer: string;
  }): HydratedJourney {
    const student = this.findOrCreateStudent(
      data.studentName,
      data.gradeId,
      undefined,
      data.section,
      data.groupName,
      data.teacherName
    );
    const journeyId = `jou-${Date.now()}`;
    const now = new Date().toISOString();

    const journey: StudentJourney = {
      id: journeyId,
      studentId: student.id,
      studentName: student.name,
      groupName: data.groupName || student.groupName || '',
      section: data.section || student.section || '',
      teacherName: data.teacherName || student.teacherName || '',
      gradeId: data.gradeId,
      lessonId: data.lessonId,
      bookId: data.bookId,
      status: 'completed',
      startedAt: now,
      completedAt: now,
    };

    const photo: UploadedPhoto = {
      id: `pho-${Date.now()}`,
      journeyId,
      dataUrl: data.photoDataUrl,
      fileName: data.photoFileName,
      fileSize: data.photoFileSize || 0,
      uploadedAt: now,
    };

    const summary: SummaryRecord = {
      id: `sum-${Date.now()}`,
      journeyId,
      summaryText: data.summaryText,
      wordCount: data.wordCount,
      reflectionAnswer: data.reflectionAnswer,
      submittedAt: now,
    };

    // Save to all respective tables
    const journeys = this.getJourneys();
    journeys.unshift(journey);
    saveTable(STORAGE_KEYS.JOURNEYS, journeys);

    const photos = this.getPhotos();
    photos.unshift(photo);
    saveTable(STORAGE_KEYS.PHOTOS, photos);

    const summaries = this.getSummaries();
    summaries.unshift(summary);
    saveTable(STORAGE_KEYS.SUMMARIES, summaries);

    const grade = this.getGradeById(data.gradeId) || initialGrades[0];
    const lesson = this.getLessonById(data.lessonId) || initialLessons[0];
    const book = this.getBookById(data.bookId) || initialBooks[0];

    return {
      journey,
      student,
      grade,
      lesson,
      book,
      photo,
      summary,
    };
  },

  // Hydrated journeys for display & reports
  getHydratedJourneys(): HydratedJourney[] {
    const journeys = this.getJourneys();
    const students = this.getStudents();
    const grades = this.getGrades();
    const lessons = this.getLessons();
    const books = this.getBooks();
    const photos = this.getPhotos();
    const summaries = this.getSummaries();

    return journeys.map((journey) => {
      const baseStudent = students.find((s) => s.id === journey.studentId);
      const student: Student = {
        id: journey.studentId,
        name: baseStudent?.name || journey.studentName,
        gradeId: baseStudent?.gradeId || journey.gradeId,
        section: journey.section || baseStudent?.section || '١',
        groupName: journey.groupName || baseStudent?.groupName || 'مجموعة رائدات العلوم',
        teacherName: journey.teacherName || baseStudent?.teacherName || '',
        schoolName: baseStudent?.schoolName || 'مركز مصادر التعلم',
        registeredAt: baseStudent?.registeredAt || journey.startedAt,
      };
      const grade = grades.find((g) => g.id === journey.gradeId) || {
        id: journey.gradeId,
        name: 'الصف غير محدد',
        gradeNumber: 0,
        description: '',
      };
      const lesson = lessons.find((l) => l.id === journey.lessonId) || {
        id: journey.lessonId,
        gradeId: journey.gradeId,
        semester: '',
        unit: '',
        title: 'درس غير متوفر',
      };
      const book = books.find((b) => b.id === journey.bookId) || {
        id: journey.bookId,
        title: 'كتاب غير محدد',
        author: 'غير معروف',
        classificationNumber: '',
        serialNumber: '',
        location: '',
        description: '',
        coverImage: '',
      };
      const photo = photos.find((p) => p.journeyId === journey.id);
      const summary = summaries.find((s) => s.journeyId === journey.id);

      return {
        journey,
        student,
        grade,
        lesson,
        book,
        photo,
        summary,
      };
    });
  },

  // Statistics calculation for the LRC Teacher Dashboard
  getStatistics() {
    const hydrated = this.getHydratedJourneys();
    const totalJourneys = hydrated.length;

    // Most used books count
    const bookUsageMap: Record<string, { book: Book; count: number }> = {};
    const lessonUsageMap: Record<string, { lesson: ScienceLesson; count: number }> = {};
    const gradeUsageMap: Record<string, number> = {};

    hydrated.forEach((item) => {
      // Books
      if (item.book && item.book.id) {
        if (!bookUsageMap[item.book.id]) {
          bookUsageMap[item.book.id] = { book: item.book, count: 0 };
        }
        bookUsageMap[item.book.id].count += 1;
      }

      // Lessons
      if (item.lesson && item.lesson.id) {
        if (!lessonUsageMap[item.lesson.id]) {
          lessonUsageMap[item.lesson.id] = { lesson: item.lesson, count: 0 };
        }
        lessonUsageMap[item.lesson.id].count += 1;
      }

      // Grades
      if (item.grade && item.grade.name) {
        gradeUsageMap[item.grade.name] = (gradeUsageMap[item.grade.name] || 0) + 1;
      }
    });

    const topBooks = Object.values(bookUsageMap).sort((a, b) => b.count - a.count);
    const topLessons = Object.values(lessonUsageMap).sort((a, b) => b.count - a.count);

    return {
      totalJourneys,
      totalBooks: this.getBooks().length,
      totalLessons: this.getLessons().length,
      totalStudents: this.getStudents().length,
      topBooks,
      topLessons,
      gradeDistribution: gradeUsageMap,
    };
  },

  // Reset database back to default seed data
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(initialGrades));
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(initialLessons));
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(initialBooks));
    localStorage.setItem(STORAGE_KEYS.RELATIONS, JSON.stringify(initialRelations));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
    localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(initialJourneys));
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(initialPhotos));
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(initialSummaries));
    notifySubscribers();
  },

  // Export full JSON backup
  exportDatabaseJSON(): string {
    const data = {
      grades: this.getGrades(),
      lessons: this.getLessons(),
      books: this.getBooks(),
      relations: this.getRelations(),
      students: this.getStudents(),
      journeys: this.getJourneys(),
      photos: this.getPhotos(),
      summaries: this.getSummaries(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },
};
