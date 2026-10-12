import React, { useState } from 'react';
import { Course } from '../types';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';
import {
  Sparkles,
  Trash2,
  Video,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Code2,
  Terminal,
} from 'lucide-react';
import {
  getCourseModules,
  getStudentProgress,
  saveStudentProgress,
  calculateCoursePercentage,
} from '../lib/progress';

interface CourseCardProps {
  course: Course;
  isAdmin?: boolean;
  studentUserId?: string;
  onAskAi?: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  onProgressChange?: () => void;
  onTakeQuiz?: (course: Course) => void;
  onTakeChallenge?: (course: Course) => void;
  onOpenPlayground?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isAdmin = false,
  studentUserId,
  onAskAi,
  onDelete,
  onProgressChange,
  onTakeQuiz,
  onTakeChallenge,
  onOpenPlayground,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModules, setShowModules] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(course.youtube_url);
  const modules = getCourseModules(course);

  // Load progress if studentUserId is present
  const progress = studentUserId
    ? getStudentProgress(studentUserId, course.id)
    : { courseId: course.id, videoWatched: false, completedModuleIds: [] };

  const percentage = studentUserId
    ? calculateCoursePercentage(course, progress)
    : 0;

  const formattedDate = course.created_at
    ? new Date(course.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently Added';

  const handleToggleModule = (moduleId: string) => {
    if (!studentUserId) return;
    const isCompleted = progress.completedModuleIds.includes(moduleId);
    const updatedModuleIds = isCompleted
      ? progress.completedModuleIds.filter((id) => id !== moduleId)
      : [...progress.completedModuleIds, moduleId];

    saveStudentProgress(studentUserId, course.id, {
      completedModuleIds: updatedModuleIds,
    });
    onProgressChange?.();
  };

  const handleToggleVideoWatched = () => {
    if (!studentUserId) return;
    saveStudentProgress(studentUserId, course.id, {
      videoWatched: !progress.videoWatched,
    });
    onProgressChange?.();
  };

  const completedModulesCount = progress.completedModuleIds.filter((id) =>
    modules.some((m) => m.id === id)
  ).length;

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden">
      {/* Video Preview or Iframe */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        {embedUrl ? (
          isPlaying ? (
            <iframe
              src={`${embedUrl}?autoplay=1&rel=0`}
              title={course.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <div className="relative h-full w-full flex items-center justify-center bg-slate-950 group/thumb">
              {/* YouTube Thumbnail Preview */}
              <img
                src={`https://img.youtube.com/vi/${embedUrl.split('/').pop()}/hqdefault.jpg`}
                alt={course.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover/thumb:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

              {/* Play Button */}
              <button
                onClick={() => {
                  setIsPlaying(true);
                  // Auto-mark video as watched upon playing if not yet watched
                  if (studentUserId && !progress.videoWatched) {
                    saveStudentProgress(studentUserId, course.id, { videoWatched: true });
                    onProgressChange?.();
                  }
                }}
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-lg backdrop-blur-xs transition-transform group-hover/thumb:scale-110 hover:bg-violet-600"
                title="Play Video Lesson"
              >
                <div className="ml-1 h-0 w-0 border-y-8 border-y-transparent border-l-12 border-l-white" />
              </button>

              <span className="absolute bottom-3 left-3 z-10 rounded bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-slate-200 backdrop-blur-xs flex items-center gap-1">
                <Video className="h-3 w-3 text-violet-400" />
                Lesson Video
              </span>

              {/* Quick Video Watched Indicator */}
              {studentUserId && progress.videoWatched && (
                <span className="absolute top-3 right-3 z-10 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 shadow-xs flex items-center gap-1 backdrop-blur-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Video Watched
                </span>
              )}
            </div>
          )
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4 text-center">
            <Video className="h-8 w-8 text-slate-500 mb-2" />
            <p className="text-xs">Video preview unavailable</p>
            <a
              href={course.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-xs text-violet-400 underline inline-flex items-center gap-1"
            >
              Open Link <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Course Info & Progress */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-medium text-violet-700 text-xs border border-violet-100">
            Technical Course
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1">
          {course.title}
        </h3>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
          {course.description}
        </p>

        {/* Course Progress Section for Students */}
        {studentUserId && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
            {/* Percentage Bar & Header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                {percentage === 100 ? (
                  <Award className="h-4 w-4 text-emerald-600" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                )}
                <span>Course Progress</span>
              </span>
              <span
                className={`font-bold font-mono px-2 py-0.5 rounded-full text-[11px] ${
                  percentage === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : percentage > 0
                    ? 'bg-violet-100 text-violet-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {percentage}% {percentage === 100 ? 'Completed 🎉' : 'Done'}
              </span>
            </div>

            {/* Visual Progress Track */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage === 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Progress Summary and Module Accordion Button */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>
                {completedModulesCount}/{modules.length} modules completed
                {progress.videoWatched ? ' • Video watched' : ''}
              </span>
              <button
                type="button"
                onClick={() => setShowModules(!showModules)}
                className="font-semibold text-violet-700 hover:text-violet-900 transition-colors inline-flex items-center gap-0.5"
              >
                {showModules ? 'Hide modules' : 'View modules'}
                {showModules ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Expandable Module Checklist */}
            {showModules && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2 animate-fade-in text-xs">
                {/* Video Checkbox */}
                <div
                  onClick={handleToggleVideoWatched}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {progress.videoWatched ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={`font-medium ${
                        progress.videoWatched ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      Watch Course Video Lecture
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Video</span>
                </div>

                {/* Individual Modules */}
                {modules.map((m) => {
                  const isDone = progress.completedModuleIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleModule(m.id)}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`font-medium truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                      {m.duration && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                          {m.duration}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* End-of-Course Quiz Button */}
            {onTakeQuiz && (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => onTakeQuiz(course)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    progress.quizPassed
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-violet-600 text-white shadow-xs hover:bg-violet-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 shrink-0" />
                    <span>
                      {progress.quizPassed
                        ? `Quiz Passed: ${progress.quizScore}% 🏆`
                        : progress.quizScore !== undefined
                        ? `Retake Quiz (Score: ${progress.quizScore}%)`
                        : 'Take End-of-Course Quiz'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold opacity-80">
                    {progress.quizPassed ? 'Retake' : 'Start →'}
                  </span>
                </button>
              </div>
            )}

            {/* AI Project Challenge Button */}
            {onTakeChallenge && (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => onTakeChallenge(course)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    progress.challengePassed
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      {progress.challengePassed
                        ? `AI Project Evaluated: ${progress.challengeScore}/100 🌟`
                        : progress.challengeScore !== undefined
                        ? `Improve Project (Score: ${progress.challengeScore})`
                        : 'Hands-On AI Project Challenge'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-700">
                    {progress.challengePassed ? 'Review' : 'Build →'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          {onAskAi && (
            <button
              onClick={() => onAskAi(course)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-50 py-2.5 px-3 text-xs font-semibold text-violet-700 hover:bg-violet-100 hover:text-violet-800 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              <span>Ask KiranLMS</span>
            </button>
          )}

          {onOpenPlayground && (
            <button
              onClick={() => onOpenPlayground(course)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Open in Code Playground"
            >
              <Terminal className="h-3.5 w-3.5 text-slate-600" />
              <span className="hidden sm:inline">Code Lab</span>
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(course.id)}
              className="flex items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-200"
              title="Delete Course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
