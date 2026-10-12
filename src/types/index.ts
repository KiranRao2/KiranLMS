export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  created_at?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  duration?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProjectChallenge {
  id: string;
  courseId?: string;
  title: string;
  language: 'python' | 'java';
  difficulty: 'Beginner' | 'Intermediate';
  description: string;
  requirements: string[];
  starterCode: string;
}

export interface ChallengeEvaluation {
  score: number;
  passed: boolean;
  summary: string;
  strengths: string[];
  improvementTips: string[];
  detailedFeedback: string;
}

export interface StudentCourseProgress {
  courseId: string;
  videoWatched: boolean;
  completedModuleIds: string[];
  quizScore?: number;
  quizPassed?: boolean;
  quizAttempts?: number;
  challengeScore?: number;
  challengePassed?: boolean;
  lastUpdated?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  courseContext?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isDemo?: boolean;
}

export interface ConfigStatus {
  geminiConfigured: boolean;
  supabaseConfigured: boolean;
}
