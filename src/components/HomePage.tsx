import React, { useState } from 'react';
import { Course } from '../types';
import { CourseCard } from './CourseCard';
import { AiTutor } from './AiTutor';
import { CodePlayground } from './CodePlayground';
import {
  Sparkles,
  GraduationCap,
  Shield,
  BookOpen,
  Bot,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
  Zap,
  Terminal,
  Award,
  FileCode,
  Bug,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface HomePageProps {
  courses: Course[];
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
  onOpenSetupGuide: () => void;
  onSelectCourseForAi: (course: Course) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  onOpenStudentLogin,
  onOpenAdminLogin,
  onOpenSetupGuide,
  onSelectCourseForAi,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'try-ai' | 'playground'>('preview');
  const isDbConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Alert banner if Supabase is not configured yet */}
      {!isDbConfigured && (
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 text-xs text-center border-b border-violet-800 flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Database className="h-3.5 w-3.5 text-violet-300" />
            Supabase database is ready to connect. Running in preview sandbox mode with starter courses.
          </span>
          <button
            onClick={onOpenSetupGuide}
            className="underline font-bold text-violet-200 hover:text-white transition-colors"
          >
            View Setup Instructions & SQL Schema →
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-xs font-semibold text-violet-800 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-violet-600 animate-pulse" />
              <span>Built for Students & Technical Beginners</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
              <span className="text-slate-900">KiranLMS</span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your AI Technical Learning Assistant
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ask technical programming questions and receive simple, clear English explanations with analogies and real code examples. Explore curated courses in Python, Java, and AI with an interactive in-browser debugger.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenStudentLogin}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-violet-700 transition-all hover:shadow-lg active:scale-95"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Student Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-950 transition-all active:scale-95"
              >
                <Shield className="h-5 w-5 text-violet-600" />
                <span>Admin Login</span>
              </button>

              <button
                onClick={() => setActiveTab('playground')}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all"
              >
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Try Code Playground</span>
              </button>

              <button
                onClick={() => setActiveTab('try-ai')}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all"
              >
                <Bot className="h-4 w-4 text-violet-600" />
                <span>Try AI Tutor Demo</span>
              </button>
            </div>

            {/* Mini Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Gemini 3.8 Code Reviewer
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                AI Project Challenge Grader
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Supabase Auth & Progress
              </span>
            </div>
          </div>
        </div>

        {/* Subtle background gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* Main Feature Navigation / Interactive Section */}
      <section className="bg-slate-50/70 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          {/* Section Heading & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Interactive Learning Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Explore Courses, AI Debugger & Tutor
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Watch video lectures, test Python or Java in the browser playground, and chat with KiranLMS AI Tutor.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap rounded-xl bg-slate-200/80 p-1 text-xs font-semibold gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveTab('playground')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
                  activeTab === 'playground'
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                Code Playground & Debugger
              </button>
              <button
                onClick={() => setActiveTab('try-ai')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${
                  activeTab === 'try-ai'
                    ? 'bg-white text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bot className="h-3.5 w-3.5 text-violet-600" />
                AI Tutor Chat
              </button>
            </div>
          </div>

          {/* Tab 1: Course Cards */}
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isAdmin={false}
                  onAskAi={() => {
                    onSelectCourseForAi(course);
                    setActiveTab('try-ai');
                  }}
                  onOpenPlayground={() => setActiveTab('playground')}
                />
              ))}
            </div>
          )}

          {/* Tab 2: Embedded Code Playground */}
          {activeTab === 'playground' && (
            <div className="h-[680px] max-w-6xl mx-auto">
              <CodePlayground />
            </div>
          )}

          {/* Tab 3: Embedded Interactive AI Tutor */}
          {activeTab === 'try-ai' && (
            <div className="h-[600px] max-w-4xl mx-auto">
              <AiTutor
                courses={courses}
                onOpenSetupGuide={onOpenSetupGuide}
              />
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Learn with KiranLMS?
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Designed specifically for technical students to bridge the gap between watching lectures and hands-on programming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 mb-4">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">24/7 AI Technical Tutor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions like &quot;What is Python?&quot; or &quot;How does recursion work?&quot; and get clear analogies, line-by-line breakdowns, and zero-jargon explanations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Interactive Code Playground</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Write Python and Java in the browser. Click &quot;AI Review &amp; Debug&quot; where Gemini explains syntax or logic errors in plain English and gives hints without spoiling answers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">AI Project Challenge Evaluator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete capstone mini-projects at the end of each course. Gemini scores submissions out of 100 with actionable feedback on readability, edge cases, and optimization.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Supabase Auth & Progress</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student progress percentages automatically calculate based on watched videos, completed modules, quiz scores, and AI challenge submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Database Schema & Instructions Callout Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-400/30">
                <Database className="h-3.5 w-3.5" />
                Supabase & Gemini Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Complete Two-Table Database Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                KiranLMS is designed around two clean tables:
                <br />
                <code className="text-violet-300 font-mono">1. profiles</code> (user ID, full name, role)
                <br />
                <code className="text-violet-300 font-mono">2. courses</code> (course ID, title, description, YouTube URL, created_at)
                <br />
                With Row Level Security ensuring students cannot tamper with course content.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenSetupGuide}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Open Supabase SQL Schema & Setup Guide</span>
                </button>
              </div>
            </div>

            <div className="w-full lg:max-w-md rounded-2xl bg-slate-950 p-5 border border-slate-800 font-mono text-xs text-slate-300 shadow-xl overflow-x-auto">
              <div className="text-slate-500 mb-2">// SQL snippet: Profiles & Courses</div>
              <div className="text-emerald-400">CREATE TABLE profiles (</div>
              <div className="pl-4">id UUID REFERENCES auth.users,</div>
              <div className="pl-4">full_name TEXT NOT NULL,</div>
              <div className="pl-4">role TEXT DEFAULT &apos;student&apos;</div>
              <div className="text-emerald-400">);</div>
              <div className="text-emerald-400 mt-2">CREATE TABLE courses (</div>
              <div className="pl-4">id UUID PRIMARY KEY,</div>
              <div className="pl-4">title TEXT NOT NULL,</div>
              <div className="pl-4">description TEXT NOT NULL,</div>
              <div className="pl-4">youtube_url TEXT NOT NULL</div>
              <div className="text-emerald-400">);</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span>KiranLMS — AI Technical Learning Assistant</span>
          </div>
          <p>© {new Date().getFullYear()} KiranLMS. Powered by Google Gemini and Supabase.</p>
          <button
            onClick={onOpenSetupGuide}
            className="text-violet-600 hover:underline font-semibold"
          >
            Database & API Setup Guide
          </button>
        </div>
      </footer>
    </div>
  );
};

