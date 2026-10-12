import { Course, CourseModule, StudentCourseProgress } from '../types';

/**
 * Returns structured modules for a course.
 * If standard starter courses, returns custom tailored curriculum modules.
 * For newly added courses, generates structured modules from the course title.
 */
export function getCourseModules(course: Course): CourseModule[] {
  const titleLower = course.title.toLowerCase();

  if (titleLower.includes('python')) {
    return [
      { id: `${course.id}-m1`, title: 'Module 1: Setup, Syntax & Variables', duration: '15 min' },
      { id: `${course.id}-m2`, title: 'Module 2: Conditionals, Loops & Logic', duration: '20 min' },
      { id: `${course.id}-m3`, title: 'Module 3: Functions & Reusability', duration: '25 min' },
      { id: `${course.id}-m4`, title: 'Module 4: Lists, Dictionaries & Data Structures', duration: '30 min' },
      { id: `${course.id}-m5`, title: 'Module 5: Object-Oriented Programming (OOP)', duration: '35 min' },
    ];
  }

  if (titleLower.includes('java')) {
    return [
      { id: `${course.id}-m1`, title: 'Module 1: Java Architecture, JVM & Basics', duration: '20 min' },
      { id: `${course.id}-m2`, title: 'Module 2: Classes, Objects & Methods', duration: '25 min' },
      { id: `${course.id}-m3`, title: 'Module 3: Control Flow & Iterations', duration: '20 min' },
      { id: `${course.id}-m4`, title: 'Module 4: Encapsulation & Inheritance', duration: '30 min' },
      { id: `${course.id}-m5`, title: 'Module 5: Arrays, Collections & Exceptions', duration: '35 min' },
    ];
  }

  if (titleLower.includes('ai') || titleLower.includes('machine learning')) {
    return [
      { id: `${course.id}-m1`, title: 'Module 1: Foundations of Artificial Intelligence', duration: '20 min' },
      { id: `${course.id}-m2`, title: 'Module 2: Supervised vs Unsupervised Learning', duration: '25 min' },
      { id: `${course.id}-m3`, title: 'Module 3: Neural Networks & Deep Learning', duration: '30 min' },
      { id: `${course.id}-m4`, title: 'Module 4: Large Language Models (LLMs) & Prompts', duration: '35 min' },
      { id: `${course.id}-m5`, title: 'Module 5: Ethics & Real-World AI Systems', duration: '20 min' },
    ];
  }

  // Default modular curriculum for any admin-added course
  return [
    { id: `${course.id}-m1`, title: `Module 1: Getting Started with ${course.title}`, duration: '20 min' },
    { id: `${course.id}-m2`, title: 'Module 2: Core Principles & Foundational Patterns', duration: '25 min' },
    { id: `${course.id}-m3`, title: 'Module 3: Hands-On Implementation & Exercises', duration: '30 min' },
    { id: `${course.id}-m4`, title: 'Module 4: Capstone Challenge & Best Practices', duration: '35 min' },
  ];
}

const STORAGE_PREFIX = 'kiran_lms_student_progress_';

function getStorageKey(userId: string, courseId: string): string {
  return `${STORAGE_PREFIX}${userId}_${courseId}`;
}

export function getStudentProgress(userId: string, courseId: string): StudentCourseProgress {
  if (typeof window === 'undefined') {
    return { courseId, videoWatched: false, completedModuleIds: [] };
  }

  const raw = localStorage.getItem(getStorageKey(userId, courseId));
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        courseId,
        videoWatched: Boolean(parsed.videoWatched),
        completedModuleIds: Array.isArray(parsed.completedModuleIds) ? parsed.completedModuleIds : [],
        quizScore: typeof parsed.quizScore === 'number' ? parsed.quizScore : undefined,
        quizPassed: Boolean(parsed.quizPassed),
        quizAttempts: typeof parsed.quizAttempts === 'number' ? parsed.quizAttempts : 0,
        challengeScore: typeof parsed.challengeScore === 'number' ? parsed.challengeScore : undefined,
        challengePassed: Boolean(parsed.challengePassed),
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    } catch {
      // Fallback
    }
  }

  return { courseId, videoWatched: false, completedModuleIds: [] };
}

export function saveStudentProgress(
  userId: string,
  courseId: string,
  updates: Partial<StudentCourseProgress>
): StudentCourseProgress {
  const current = getStudentProgress(userId, courseId);
  const updated: StudentCourseProgress = {
    ...current,
    ...updates,
    courseId,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(getStorageKey(userId, courseId), JSON.stringify(updated));
  }

  return updated;
}

/**
 * Calculates percentage completion for a given course.
 * Based on completed modules, video watched status, passed quiz, and passed project challenge.
 */
export function calculateCoursePercentage(course: Course, progress: StudentCourseProgress): number {
  const modules = getCourseModules(course);
  // Total components: Modules + Video Lecture (1) + End-of-Course Quiz (1) + Project Challenge (1)
  const totalItems = modules.length + 3;

  const completedModulesCount = progress.completedModuleIds.filter((id) =>
    modules.some((m) => m.id === id)
  ).length;

  const videoCount = progress.videoWatched ? 1 : 0;
  const quizCount = progress.quizPassed ? 1 : 0;
  const challengeCount = progress.challengePassed ? 1 : 0;
  const completedItems = completedModulesCount + videoCount + quizCount + challengeCount;

  if (totalItems === 0) return 0;
  return Math.min(100, Math.round((completedItems / totalItems) * 100));
}

/**
 * Computes overall stats across all courses for the student dashboard overview.
 */
export function getOverallStudentStats(userId: string, courses: Course[]) {
  if (courses.length === 0) {
    return {
      overallPercentage: 0,
      completedCoursesCount: 0,
      inProgressCoursesCount: 0,
      totalModulesCompleted: 0,
      totalQuizzesPassed: 0,
      totalChallengesPassed: 0,
    };
  }

  let totalPercentageSum = 0;
  let completedCoursesCount = 0;
  let inProgressCoursesCount = 0;
  let totalModulesCompleted = 0;
  let totalQuizzesPassed = 0;
  let totalChallengesPassed = 0;

  for (const course of courses) {
    const progress = getStudentProgress(userId, course.id);
    const percentage = calculateCoursePercentage(course, progress);
    totalPercentageSum += percentage;

    if (percentage === 100) {
      completedCoursesCount++;
    } else if (percentage > 0) {
      inProgressCoursesCount++;
    }

    totalModulesCompleted += progress.completedModuleIds.length;
    if (progress.quizPassed) {
      totalQuizzesPassed++;
    }
    if (progress.challengePassed) {
      totalChallengesPassed++;
    }
  }

  const overallPercentage = Math.round(totalPercentageSum / courses.length);

  return {
    overallPercentage,
    completedCoursesCount,
    inProgressCoursesCount,
    totalModulesCompleted,
    totalQuizzesPassed,
    totalChallengesPassed,
  };
}
