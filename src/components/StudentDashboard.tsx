import React, { useState } from 'react';
import { AuthUser, Course } from '../types';
import { CourseCard } from './CourseCard';
import { AiTutor } from './AiTutor';
import { QuizModal } from './QuizModal';
import { CodePlayground } from './CodePlayground';
import { ProjectChallengeModal } from './ProjectChallengeModal';
import {
  BookOpen,
  Bot,
  Settings,
  LogOut,
  Sparkles,
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Award,
  Code2,
  Terminal,
} from 'lucide-react';
import { getOverallStudentStats } from '../lib/progress';

interface StudentDashboardProps {
  user: AuthUser;
  courses: Course[];
  onSignOut: () => void;
  onOpenSetupGuide: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  courses,
  onSignOut,
  onOpenSetupGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'tutor' | 'playground' | 'challenges'>('courses');
  const [activeCourseContext, setActiveCourseContext] = useState<Course | null>(null);
  const [activeQuizCourse, setActiveQuizCourse] = useState<Course | null>(null);
  const [activeChallengeCourse, setActiveChallengeCourse] = useState<Course | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progressVersion, setProgressVersion] = useState(0);

  // Compute student stats reactively
  const stats = getOverallStudentStats(user.id, courses);

  const handleAskAiAboutCourse = (course: Course) => {
    setActiveCourseContext(course);
    setActiveTab('tutor');
    setSidebarOpen(false);
  };

  const handleProgressChange = () => {
    setProgressVersion((v) => v + 1);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-base">KiranLMS</span>
              <span className="block text-[10px] font-semibold text-violet-600 uppercase tracking-wider">
                Student Hub
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="m-4 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xs">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold text-slate-900">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.2 text-[10px] font-semibold text-violet-700">
                  <GraduationCap className="h-3 w-3" /> Student
                </span>
                {user.isDemo && (
                  <span className="rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-800">Demo</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-2">
          <button
            onClick={() => {
              setActiveTab('courses');
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'courses'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>My Courses ({courses.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tutor');
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'tutor'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>AI Tutor Chatbot</span>
            <span className="ml-auto rounded-full bg-violet-100 px-1.5 py-0.2 text-[9px] font-bold text-violet-700">
              Gemini
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('playground');
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'playground'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>AI Code Playground</span>
            <span className="ml-auto rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              Debug
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('challenges');
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'challenges'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>AI Project Challenges</span>
            <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
              Score
            </span>
          </button>

          <button
            onClick={() => {
              onOpenSetupGuide();
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Setup & SQL Guide</span>
          </button>
        </nav>

        {/* Sign Out Button */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                {activeTab === 'courses'
                  ? 'Technical Learning Courses'
                  : activeTab === 'tutor'
                  ? 'KiranLMS AI Tutor'
                  : activeTab === 'playground'
                  ? 'Interactive AI Code Playground & Debugger'
                  : 'AI Project Challenge Evaluator'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Welcome back, {user.fullName}! Ready to master coding concepts today?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'courses' && (
              <button
                onClick={() => setActiveTab('courses')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                <span>Back to Courses</span>
              </button>
            )}

            {activeTab !== 'playground' && (
              <button
                onClick={() => setActiveTab('playground')}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Code Playground</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'courses' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Welcome Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200 border border-violet-400/30 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                    Interactive Technical Learning
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome to KiranLMS Dashboard!
                  </h2>
                  <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                    Watch beginner-friendly video lessons below, track your module completion percentage, and click <strong>&quot;Ask Kiran AI about this Course&quot;</strong> anytime you need an explanation.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('tutor')}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                    >
                      <Bot className="h-3.5 w-3.5 text-violet-600" />
                      Ask AI a Technical Question
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Decorative blob */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
              </div>

              {/* Student Learning Progress Overview Cards */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-violet-600" />
                      <span>Your Learning Progress</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Progress automatically calculates from completed modules and watched video lessons.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Overall Completion:</span>
                    <span className="font-mono font-bold text-sm text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                      {stats.overallPercentage}%
                    </span>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${stats.overallPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Mini Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100/80">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Overall Progress</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">{stats.overallPercentage}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Completed Courses</p>
                    <p className="text-lg font-extrabold text-emerald-600 mt-0.5 flex items-center gap-1">
                      {stats.completedCoursesCount} <span className="text-xs text-slate-400 font-normal">/ {courses.length}</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Quizzes Passed</p>
                    <p className="text-lg font-extrabold text-violet-600 mt-0.5 flex items-center gap-1">
                      {stats.totalQuizzesPassed} <span className="text-xs text-slate-400 font-normal">/ {courses.length}</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">AI Projects Evaluated</p>
                    <p className="text-lg font-extrabold text-amber-600 mt-0.5 flex items-center gap-1">
                      {stats.totalChallengesPassed} <span className="text-xs text-slate-400 font-normal">/ {courses.length}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Grid Header */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Your Technical Courses</h3>
                  <p className="text-xs text-slate-500">
                    Showing {courses.length} foundational courses curated for beginners
                  </p>
                </div>
              </div>

              {/* Course Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={`${course.id}-${progressVersion}`}
                    course={course}
                    isAdmin={false}
                    studentUserId={user.id}
                    onAskAi={handleAskAiAboutCourse}
                    onProgressChange={handleProgressChange}
                    onTakeQuiz={(selectedCourse) => setActiveQuizCourse(selectedCourse)}
                    onTakeChallenge={(selectedCourse) => setActiveChallengeCourse(selectedCourse)}
                    onOpenPlayground={(selectedCourse) => {
                      setActiveCourseContext(selectedCourse);
                      setActiveTab('playground');
                    }}
                  />
                ))}
              </div>

              {courses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <h4 className="text-base font-bold text-slate-800">No courses available yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    An administrator can add new courses from the Admin Dashboard or seed the default courses into Supabase.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tutor' && (
            <div className="h-[calc(100vh-8rem)] max-w-6xl mx-auto">
              <AiTutor
                courses={courses}
                activeCourseContext={activeCourseContext}
                onClearContext={() => setActiveCourseContext(null)}
                onOpenSetupGuide={onOpenSetupGuide}
              />
            </div>
          )}

          {activeTab === 'playground' && (
            <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto">
              <CodePlayground
                initialLanguage={
                  activeCourseContext?.title.toLowerCase().includes('java') ? 'java' : 'python'
                }
                courseContextTitle={activeCourseContext?.title}
              />
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-6 sm:p-8 text-white shadow-md">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white border border-white/30 mb-2">
                    <Award className="h-3.5 w-3.5" />
                    Hands-On Code Evaluation
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    AI Project Challenge Evaluator
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-amber-100 leading-relaxed">
                    Build real-world programming mini-projects. When you submit your code, Gemini assesses functional correctness, edge case handling, and code style with a score out of 100.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Capstone Project
                        </span>
                        <span className="font-mono text-[11px]">
                          {course.title.toLowerCase().includes('java') ? 'Java' : 'Python'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{course.title} Challenge</h4>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                        Implement a complete solution testing core principles learned in {course.title}.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <button
                        onClick={() => setActiveChallengeCourse(course)}
                        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Code2 className="h-4 w-4" />
                        <span>Launch Project Challenge</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Course Quiz Modal */}
      {activeQuizCourse && (
        <QuizModal
          course={activeQuizCourse}
          studentUserId={user.id}
          isOpen={true}
          onClose={() => setActiveQuizCourse(null)}
          onQuizCompleted={handleProgressChange}
          onAskAiAboutTopic={(course) => {
            setActiveQuizCourse(null);
            handleAskAiAboutCourse(course);
          }}
        />
      )}

      {/* Project Challenge Modal */}
      {activeChallengeCourse && (
        <ProjectChallengeModal
          course={activeChallengeCourse}
          studentUserId={user.id}
          isOpen={true}
          onClose={() => setActiveChallengeCourse(null)}
          onEvaluationCompleted={handleProgressChange}
          onAskAi={handleAskAiAboutCourse}
        />
      )}
    </div>
  );
};
