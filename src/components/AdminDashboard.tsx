import React, { useState } from 'react';
import { AuthUser, Course } from '../types';
import { CourseCard } from './CourseCard';
import { addCourseToDatabase, removeCourseFromDatabase, seedSampleCoursesToDatabase, isSupabaseConfigured } from '../lib/supabase';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import { Shield, PlusCircle, Video, Trash2, Database, AlertCircle, CheckCircle2, ArrowLeft, LogOut, Sparkles, ExternalLink } from 'lucide-react';

interface AdminDashboardProps {
  user: AuthUser;
  courses: Course[];
  onRefreshCourses: () => void;
  onSignOut: () => void;
  onOpenSetupGuide: () => void;
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  courses,
  onRefreshCourses,
  onSignOut,
  onOpenSetupGuide,
  onBackToHome,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live video preview
  const previewEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);
  const isDbConfigured = isSupabaseConfigured();

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !description.trim() || !youtubeUrl.trim()) {
      setFeedback({ type: 'error', message: 'All fields are required.' });
      return;
    }

    if (!previewEmbedUrl) {
      setFeedback({
        type: 'error',
        message: 'Please provide a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...).',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await addCourseToDatabase({
        title: title.trim(),
        description: description.trim(),
        youtube_url: youtubeUrl.trim(),
      });

      setTitle('');
      setDescription('');
      setYoutubeUrl('');

      setFeedback({
        type: 'success',
        message: result.isFromDb
          ? `Successfully saved "${result.course.title}" to Supabase courses table!`
          : `Saved "${result.course.title}" (Sandbox Mode. Connect Supabase to persist to cloud database).`,
      });

      onRefreshCourses();
    } catch (err: any) {
      console.error('Failed to add course:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to add course. Make sure RLS admin permissions are configured.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await removeCourseFromDatabase(courseId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Course deleted successfully.' });
        onRefreshCourses();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete course.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Delete operation failed.' });
    }
  };

  const handleSeedCourses = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await seedSampleCoursesToDatabase();
      setFeedback({
        type: 'success',
        message: `Successfully seeded ${res.count} sample courses into Supabase!`,
      });
      onRefreshCourses();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to seed courses into Supabase. Check RLS policies.',
      });
    } finally {
      setSeeding(false);
    }
  };

  // Strictly enforce admin authorization
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 border border-slate-200 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted to Administrators</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Your account ({user.email}) currently has the <strong>student</strong> role. Under Row Level Security, only verified admin profiles can access course management.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onBackToHome}
              className="rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white hover:bg-violet-700"
            >
              Return to Student Home
            </button>
            <button
              onClick={onOpenSetupGuide}
              className="rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Admin Promotion SQL Guide
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Shield className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">KiranLMS</span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSetupGuide}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-violet-600" />
            <span>Supabase Config & SQL</span>
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Admin Header Stats */}
        <div className="rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-400/30 mb-2">
                <Shield className="h-3.5 w-3.5" />
                Authorized Admin Session: {user.email}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Course Management & Content Dashboard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                Add, manage, and publish technical courses. All course mutations are protected by Supabase Row Level Security.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-slate-800/80 px-4 py-3 border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Courses</p>
                <p className="text-xl font-extrabold text-white">{courses.length}</p>
              </div>

              <div className="rounded-xl bg-slate-800/80 px-4 py-3 border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Database Sync</p>
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isDbConfigured ? 'Supabase Connected' : 'Local Sandbox'}
                </p>
              </div>

              {isDbConfigured && (
                <button
                  onClick={handleSeedCourses}
                  disabled={seeding}
                  className="rounded-xl bg-violet-600 px-4 py-3 text-xs font-bold text-white hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50"
                  title="Insert 3 Default Starter Courses into Supabase"
                >
                  {seeding ? 'Seeding...' : '⚡ Seed 3 Sample Courses'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-xl p-4 text-xs font-medium flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        )}

        {/* Two Column Layout: Add Course Form + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Course Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold text-slate-900">Add New Technical Course</h2>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern TypeScript & React Architecture"
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the topics covered in simple terms for student beginners..."
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=kqtD5dpn9C8"
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Accepts standard YouTube links (<code className="font-mono">youtube.com/watch?v=...</code> or <code className="font-mono">youtu.be/...</code>).
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-xl bg-violet-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      <span>Save Course to Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Video Preview (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Video className="h-4 w-4 text-violet-600" />
                Live Video Preview
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Watch the video embed preview updates in real time as you paste the URL.
              </p>

              <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                {previewEmbedUrl ? (
                  <iframe
                    src={previewEmbedUrl}
                    title="Live Preview"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs">
                    <Video className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    Enter a valid YouTube URL on the left to preview the video player here.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200/60 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Row Level Security Notice:</span>
              Students are strictly disallowed from creating or modifying courses. Only authenticated accounts whose profile row has <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">role = &apos;admin&apos;</code> are authorized to execute inserts.
            </div>
          </div>
        </div>

        {/* Existing Courses Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Saved Courses ({courses.length})</h2>
              <p className="text-xs text-slate-500">
                Courses displayed to students in their dashboard and available for AI context.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isAdmin={true}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>

          {courses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
              <Database className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h4 className="text-base font-bold text-slate-800">No courses in the database yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                You can create a course using the form above or click below to seed the three default sample courses.
              </p>
              {isDbConfigured && (
                <button
                  onClick={handleSeedCourses}
                  disabled={seeding}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors shadow-sm"
                >
                  Seed 3 Sample Courses Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
