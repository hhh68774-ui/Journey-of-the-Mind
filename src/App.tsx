/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { db, subscribeDatabase } from './services/db';
import {
  Book,
  Grade,
  HydratedJourney,
  LessonBookRelation,
  ScienceLesson,
  StepKey,
} from './types';
import { Header } from './components/Header';
import { JourneyProgressBar } from './components/JourneyProgressBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GradeSelection } from './components/GradeSelection';
import { LessonSelection } from './components/LessonSelection';
import { LibrarySelection } from './components/LibrarySelection';
import { MissionDocumentation } from './components/MissionDocumentation';
import { AchievementScreen } from './components/AchievementScreen';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { CurriculumDirectoryModal } from './components/CurriculumDirectoryModal';
import { LrcCatalogBrowser } from './components/LrcCatalogBrowser';

export default function App() {
  // Database States
  const [grades, setGrades] = useState<Grade[]>(() => db.getGrades());
  const [lessons, setLessons] = useState<ScienceLesson[]>(() => db.getLessons());
  const [books, setBooks] = useState<Book[]>(() => db.getBooks());
  const [relations, setRelations] = useState<LessonBookRelation[]>(() => db.getRelations());
  const [hydratedJourneys, setHydratedJourneys] = useState<HydratedJourney[]>(() =>
    db.getHydratedJourneys()
  );

  // Curriculum directory and LRC books catalog modals state
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isLrcCatalogOpen, setIsLrcCatalogOpen] = useState(false);

  // Active Flow State
  const [currentStep, setCurrentStep] = useState<StepKey>('welcome');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ScienceLesson | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('مجموعة عباقرة العلوم');
  const [section, setSection] = useState<string>('١');
  const [teacherName, setTeacherName] = useState<string>('');
  const [activeCompletedJourney, setActiveCompletedJourney] = useState<HydratedJourney | null>(
    null
  );

  // Reload database data when modifications happen
  const reloadData = useCallback(() => {
    setGrades(db.getGrades());
    setLessons(db.getLessons());
    setBooks(db.getBooks());
    setRelations(db.getRelations());
    setHydratedJourneys(db.getHydratedJourneys());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeDatabase(() => {
      reloadData();
    });
    return () => unsubscribe();
  }, [reloadData]);

  // Step Navigations
  const handleStartJourney = () => {
    setCurrentStep('grade');
  };

  const handleSelectGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setSelectedLesson(null);
    setSelectedBook(null);
    setCurrentStep('lesson');
  };

  const handleSelectLessonDirectly = (grade: Grade, lesson: ScienceLesson) => {
    setSelectedGrade(grade);
    setSelectedLesson(lesson);
    setSelectedBook(null);
    setCurrentStep('lesson');
    setIsCurriculumModalOpen(false);
  };

  const handleSelectLesson = (lesson: ScienceLesson) => {
    setSelectedLesson(lesson);
  };

  const handleContinueToBooks = () => {
    if (selectedLesson) {
      setCurrentStep('book');
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentStep('mission');
  };

  const handleSelectBookFromCatalog = (book: Book) => {
    setSelectedBook(book);
    setIsLrcCatalogOpen(false);
    if (!selectedGrade) {
      const g9 = grades.find((g) => g.id === 'grade-9') || grades[grades.length - 1];
      setSelectedGrade(g9);
    }
    const relatedLessons = db.getLessonsForBook(book.id);
    const targetLesson =
      relatedLessons[0] || lessons.find((l) => l.gradeId === 'grade-9') || lessons[0];
    if (!selectedLesson) {
      setSelectedLesson(targetLesson);
    }
    setCurrentStep('mission');
  };

  const handleSubmitMission = (data: {
    studentName: string;
    groupName: string;
    section: string;
    teacherName: string;
    photoDataUrl: string;
    photoFileName: string;
    summaryText: string;
    wordCount: number;
    reflectionAnswer: string;
  }) => {
    if (!selectedGrade || !selectedLesson || !selectedBook) return;

    const completed = db.completeJourney({
      studentName: data.studentName,
      groupName: data.groupName,
      section: data.section,
      teacherName: data.teacherName,
      gradeId: selectedGrade.id,
      lessonId: selectedLesson.id,
      bookId: selectedBook.id,
      photoDataUrl: data.photoDataUrl,
      photoFileName: data.photoFileName,
      summaryText: data.summaryText,
      wordCount: data.wordCount,
      reflectionAnswer: data.reflectionAnswer,
    });

    setActiveCompletedJourney(completed);
    setCurrentStep('achievement');
  };

  const handleStartNewJourney = () => {
    setSelectedGrade(null);
    setSelectedLesson(null);
    setSelectedBook(null);
    setActiveCompletedJourney(null);
    setCurrentStep('grade');
  };

  const handleToggleSupervisor = () => {
    if (currentStep === 'supervisor') {
      setCurrentStep('welcome');
    } else {
      setCurrentStep('supervisor');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Universal Header with Brand Name «رِحْلَةُ عَقْل» */}
      <Header
        currentStep={currentStep}
        onNavigate={(step) => setCurrentStep(step)}
        selectedGradeName={selectedGrade?.name}
        selectedLessonTitle={selectedLesson?.title}
        isSupervisorMode={currentStep === 'supervisor'}
        onToggleSupervisor={handleToggleSupervisor}
        onOpenCurriculumDirectory={() => setIsCurriculumModalOpen(true)}
        onOpenLrcCatalog={() => setIsLrcCatalogOpen(true)}
      />

      {/* Top Progress Tracker «رحلتي» */}
      <JourneyProgressBar
        currentStep={currentStep}
        onNavigateStep={(step) => setCurrentStep(step)}
        hasGrade={!!selectedGrade}
        hasLesson={!!selectedLesson}
        hasBook={!!selectedBook}
        hasCompleted={!!activeCompletedJourney}
      />

      {/* Active Screen Content */}
      <main className="flex-1">
        {currentStep === 'welcome' && (
          <WelcomeScreen
            onStartJourney={handleStartJourney}
            onOpenSupervisor={() => setCurrentStep('supervisor')}
            totalJourneysCount={hydratedJourneys.length}
            grades={grades}
            lessons={lessons}
            onSelectLessonDirectly={handleSelectLessonDirectly}
            onOpenCurriculumModal={() => setIsCurriculumModalOpen(true)}
            onOpenLrcCatalog={() => setIsLrcCatalogOpen(true)}
          />
        )}

        {currentStep === 'grade' && (
          <GradeSelection
            grades={grades}
            lessons={lessons}
            selectedGradeId={selectedGrade?.id}
            onSelectGrade={handleSelectGrade}
          />
        )}

        {currentStep === 'lesson' && selectedGrade && (
          <LessonSelection
            selectedGrade={selectedGrade}
            lessons={lessons}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={handleSelectLesson}
            onContinueToBooks={handleContinueToBooks}
            onChangeGrade={() => setCurrentStep('grade')}
            onOpenCurriculumModal={() => setIsCurriculumModalOpen(true)}
            onSelectBookDirectly={(book, lesson) => {
              setSelectedLesson(lesson);
              setSelectedBook(book);
              setCurrentStep('mission');
            }}
          />
        )}

        {currentStep === 'book' && selectedLesson && (
          <LibrarySelection
            selectedLesson={selectedLesson}
            allBooks={books}
            selectedBookId={selectedBook?.id}
            onSelectBook={handleSelectBook}
            onChangeLesson={() => setCurrentStep('lesson')}
          />
        )}

        {currentStep === 'mission' && selectedGrade && selectedLesson && selectedBook && (
          <MissionDocumentation
            grade={selectedGrade}
            lesson={selectedLesson}
            book={selectedBook}
            studentName={studentName}
            onUpdateStudentName={setStudentName}
            groupName={groupName}
            onUpdateGroupName={setGroupName}
            section={section}
            onUpdateSection={setSection}
            teacherName={teacherName}
            onUpdateTeacherName={setTeacherName}
            onSubmitMission={handleSubmitMission}
            onBackToBook={() => setCurrentStep('book')}
          />
        )}

        {currentStep === 'achievement' && activeCompletedJourney && (
          <AchievementScreen
            hydratedJourney={activeCompletedJourney}
            onStartNewJourney={handleStartNewJourney}
          />
        )}

        {currentStep === 'supervisor' && (
          <SupervisorDashboard
            grades={grades}
            lessons={lessons}
            books={books}
            relations={relations}
            hydratedJourneys={hydratedJourneys}
            onDataChanged={reloadData}
            onExitSupervisor={() => setCurrentStep('welcome')}
          />
        )}
      </main>

      {/* Minimal Academic Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-600">
            <span className="font-bold text-slate-800">«رِحْلَةُ عَقْل»</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">تصميم: أخصائية مركز مصادر التعلم \ هدى الحارثية</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">فكرة: معلمات العلوم بمدرسة المنارة للبنات</span>
          </div>
          <div className="text-slate-400">مخصص لطالبات الصفوف من الخامس إلى التاسع</div>
        </div>
      </footer>

      {/* Universal Curriculum & Lesson Titles Directory Modal */}
      <CurriculumDirectoryModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        grades={grades}
        lessons={lessons}
        onSelectLessonDirectly={handleSelectLessonDirectly}
      />

      {/* Official Learning Resource Center 1,124 Books Catalog Browser */}
      <LrcCatalogBrowser
        isOpen={isLrcCatalogOpen}
        onClose={() => setIsLrcCatalogOpen(false)}
        onSelectBookForJourney={handleSelectBookFromCatalog}
      />
    </div>
  );
}
