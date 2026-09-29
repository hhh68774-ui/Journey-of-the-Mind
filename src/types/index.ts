/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. جدول الصفوف (Grades)
export interface Grade {
  id: string;
  name: string; // e.g. "الصف الخامس"
  gradeNumber: number; // 5, 6, 7, 8, 9
  description: string;
  badgeColor?: string;
}

// 2. جدول دروس العلوم (Science Lessons)
export interface ScienceLesson {
  id: string;
  gradeId: string; // FKey -> Grade.id
  subject?: string; // e.g. "فيزياء", "أحياء", "كيمياء", "العلوم العامة"
  semester: string; // e.g. "الفصل الدراسي الأول", "الفصل الدراسي الثاني"
  unit: string; // e.g. "الوحدة 1: الطول والزمن"
  lessonNumber?: string; // e.g. "1-1"
  title: string; // e.g. "أهمية القياس"
  brief?: string; // e.g. "التعرف على بنية الخلية النباتية والحيوانية"
  keywords?: string[]; // to enhance search
}

// 3. جدول الكتب (Books)
export interface Book {
  id: string;
  title: string;
  author: string;
  classificationNumber: string; // Dewey classification, e.g. "570.2 خ ل"
  serialNumber: string; // Barcode / serial, e.g. "LRC-2024-510"
  location: string; // e.g. "قسم العلوم الحياتية - الرف الثاني - ب"
  description: string;
  coverImage: string; // URL or Data URL
  pagesCount?: number;
  publisher?: string;
  publishYear?: string;
}

// 4. جدول العلاقة بين الدروس والكتب (Lesson-Book Relations)
export interface LessonBookRelation {
  id: string;
  lessonId: string; // FKey -> ScienceLesson.id
  bookId: string; // FKey -> Book.id
  relevanceNote?: string; // Note on connection, e.g. "الفصل الثالث يوضح مجسمات الخلية"
}

// 5. جدول الطالبات (Students)
export interface Student {
  id: string;
  name: string;
  gradeId: string;
  section?: string; // الشعبة مثل "١" أو "٢"
  groupName?: string; // اسم المجموعة
  teacherName?: string; // اسم المعلمة
  schoolName?: string;
  registeredAt: string;
}

// 6. جدول الصور المرفوعة (Uploaded Photos)
export interface UploadedPhoto {
  id: string;
  journeyId: string;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// 7. جدول الملخصات (Summaries)
export interface SummaryRecord {
  id: string;
  journeyId: string;
  summaryText: string;
  wordCount: number;
  reflectionAnswer: string; // الإجابة على السؤال: كيف ساعدك الكتاب على فهم الدرس بصورة أفضل؟
  submittedAt: string;
}

// 8. جدول رحلات الطالبات (Student Journeys)
export interface StudentJourney {
  id: string;
  studentId: string;
  studentName: string;
  groupName?: string; // اسم المجموعة
  section?: string; // الشعبة
  teacherName?: string; // اسم المعلمة
  gradeId: string;
  lessonId: string;
  bookId: string;
  status: 'draft' | 'completed';
  startedAt: string;
  completedAt?: string;
}

// Full hydrated view for rendering and reports
export interface HydratedJourney {
  journey: StudentJourney;
  student: Student;
  grade: Grade;
  lesson: ScienceLesson;
  book: Book;
  photo?: UploadedPhoto;
  summary?: SummaryRecord;
}

export type StepKey = 'welcome' | 'grade' | 'lesson' | 'book' | 'mission' | 'achievement' | 'supervisor';
