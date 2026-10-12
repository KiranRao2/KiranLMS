import React, { useState } from 'react';
import { Course, QuizQuestion } from '../types';
import { getQuizForCourse } from '../lib/quizData';
import { saveStudentProgress, getStudentProgress } from '../lib/progress';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bot,
  BookOpen,
} from 'lucide-react';

interface QuizModalProps {
  course: Course;
  studentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onQuizCompleted: () => void;
  onAskAiAboutTopic?: (course: Course) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  course,
  studentUserId,
  isOpen,
  onClose,
  onQuizCompleted,
  onAskAiAboutTopic,
}) => {
  const questions: QuizQuestion[] = getQuizForCourse(course);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    setAnswers((prev) => ({ ...prev, [currentIndex]: selectedOption }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(answers[currentIndex + 1] ?? null);
      setIsSubmitted(answers[currentIndex + 1] !== undefined);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correctIndex) {
          correctCount++;
        }
      });

      const finalPercentage = Math.round((correctCount / totalQuestions) * 100);
      const passed = finalPercentage >= 70;

      const currentProgress = getStudentProgress(studentUserId, course.id);
      saveStudentProgress(studentUserId, course.id, {
        quizScore: Math.max(currentProgress.quizScore || 0, finalPercentage),
        quizPassed: passed || Boolean(currentProgress.quizPassed),
        quizAttempts: (currentProgress.quizAttempts || 0) + 1,
      });

      setShowResults(true);
      onQuizCompleted();
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setAnswers({});
    setShowResults(false);
  };

  // Score calculation for Results Screen
  let score = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) {
      score++;
    }
  });
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const isPassed = scorePercent >= 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                  Knowledge Test
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-semibold text-slate-700">
                  {course.title}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                End-of-Course Knowledge Quiz
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar across questions */}
        {!showResults && (
          <div className="h-1.5 w-full bg-slate-100">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        )}

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {!showResults ? (
            <div className="space-y-6">
              {/* Question Index & Header */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-violet-700">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="font-mono">
                  {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Complete
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle =
                    'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 text-slate-700';

                  if (isSelected && !isSubmitted) {
                    optionStyle =
                      'border-violet-600 bg-violet-50 text-violet-950 ring-2 ring-violet-500/20';
                  }

                  if (isSubmitted) {
                    if (isCorrect) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'border-rose-400 bg-rose-50 text-rose-950 font-medium';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm text-left transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected && !isSubmitted
                              ? 'bg-violet-600 text-white'
                              : isSubmitted && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isSubmitted && isSelected && !isCorrect
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isSubmitted && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-rose-500 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation card once answered */}
              {isSubmitted && (
                <div
                  className={`rounded-xl p-4 text-xs leading-relaxed animate-fade-in ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    <span>
                      {selectedOption === currentQ.correctIndex
                        ? 'Correct! Explanation:'
                        : 'Explanation:'}
                    </span>
                  </div>
                  <p>{currentQ.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-6">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-md ${
                  isPassed
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white'
                }`}
              >
                {isPassed ? <Award className="h-10 w-10" /> : <HelpCircle className="h-10 w-10" />}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    isPassed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isPassed ? 'Quiz Passed! 🏆' : 'Needs Review'}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  You Scored {score} out of {totalQuestions} ({scorePercent}%)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  {isPassed
                    ? 'Congratulations! You demonstrated a strong grasp of the foundational concepts. Your course progress percentage has been updated!'
                    : 'A score of 70% or higher is required to master this course quiz. You can review the lesson video and retake the quiz anytime!'}
                </p>
              </div>

              {/* Score Breakdown Pills */}
              <div className="flex justify-center gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">
                    Correct Answers
                  </span>
                  <span className="text-base font-bold text-emerald-600">
                    {score} / {totalQuestions}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">
                    Pass Requirement
                  </span>
                  <span className="text-base font-bold text-slate-700">70%</span>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase font-semibold text-slate-400">
                    Result Status
                  </span>
                  <span
                    className={`text-base font-bold ${
                      isPassed ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {isPassed ? 'Passed' : 'Incomplete'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRetake}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4 text-slate-500" />
                  <span>Retake Quiz</span>
                </button>

                {onAskAiAboutTopic && (
                  <button
                    onClick={() => {
                      onClose();
                      onAskAiAboutTopic(course);
                    }}
                    className="rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors flex items-center gap-1.5"
                  >
                    <Bot className="h-4 w-4 text-violet-600" />
                    <span>Ask KiranLMS AI about this Course</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls (for active questions) */}
        {!showResults && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Select an answer and click check to see explanations.
            </span>

            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleCheckAnswer}
                  className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 disabled:opacity-40 transition-colors"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors flex items-center gap-1.5"
                >
                  <span>{currentIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
