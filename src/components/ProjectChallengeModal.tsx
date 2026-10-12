import React, { useState } from 'react';
import { Course, ProjectChallenge, ChallengeEvaluation } from '../types';
import { DEFAULT_CHALLENGES } from '../lib/challengesData';
import { saveStudentProgress, getStudentProgress } from '../lib/progress';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code2,
  RotateCcw,
  Bot,
  Check,
  ListChecks,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ProjectChallengeModalProps {
  course?: Course;
  studentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onEvaluationCompleted: () => void;
  onAskAi?: (course: Course) => void;
}

export const ProjectChallengeModal: React.FC<ProjectChallengeModalProps> = ({
  course,
  studentUserId,
  isOpen,
  onClose,
  onEvaluationCompleted,
  onAskAi,
}) => {
  // Select matching challenge
  const availableChallenges = DEFAULT_CHALLENGES.filter((c) => {
    if (!course) return true;
    const titleLower = course.title.toLowerCase();
    if (titleLower.includes('python')) return c.language === 'python';
    if (titleLower.includes('java')) return c.language === 'java';
    return true;
  });

  const [selectedChallenge, setSelectedChallenge] = useState<ProjectChallenge>(
    availableChallenges[0] || DEFAULT_CHALLENGES[0]
  );
  const [code, setCode] = useState<string>(selectedChallenge.starterCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);

  if (!isOpen) return null;

  const handleSelectChallenge = (c: ProjectChallenge) => {
    setSelectedChallenge(c);
    setCode(c.starterCode);
    setEvaluation(null);
    setError(null);
  };

  const handleSubmitChallenge = async () => {
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/evaluate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedChallenge.language,
          challengeTitle: selectedChallenge.title,
          challengeDescription: `${selectedChallenge.description}\nRequirements:\n${selectedChallenge.requirements.join('\n')}`,
        }),
      });

      const data: ChallengeEvaluation = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to evaluate challenge.');
      }

      setEvaluation(data);

      // Save progress if course exists
      if (course) {
        const currentProgress = getStudentProgress(studentUserId, course.id);
        saveStudentProgress(studentUserId, course.id, {
          challengeScore: Math.max(currentProgress.challengeScore || 0, data.score),
          challengePassed: data.passed || Boolean(currentProgress.challengePassed),
        });
        onEvaluationCompleted();
      }
    } catch (err: any) {
      console.error('Challenge eval error:', err);
      setError(err?.message || 'Error communicating with AI Evaluator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Hands-On Capstone
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-semibold text-slate-700">
                  {selectedChallenge.difficulty} • {selectedChallenge.language.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                AI Project Challenge Evaluator
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

        {/* Challenge Selector Tabs (if multiple available) */}
        {availableChallenges.length > 1 && (
          <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto gap-2 py-2">
            {availableChallenges.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedChallenge.id === c.id
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        {/* Main Body: Two Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
          {/* Left Column: Requirements & Prompt (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedChallenge.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {selectedChallenge.description}
              </p>
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2.5">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" />
                <span>Evaluation Criteria:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedChallenge.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Grading Standard */}
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">How Gemini Grades:</span>
              <p>• 40% Functional correctness & test cases</p>
              <p>• 20% Code style, readability & comments</p>
              <p>• 20% Edge case handling (e.g. 0 division, empty inputs)</p>
              <p>• 20% Algorithmic efficiency & structure</p>
              <p className="font-semibold text-emerald-700 pt-1">Pass requirement: Score ≥ 70 / 100</p>
            </div>
          </div>

          {/* Right Column: Code Editor + Evaluation Results (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
            {!evaluation ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400">
                  <span className="text-amber-400 font-bold uppercase">
                    Your {selectedChallenge.language} Solution
                  </span>
                  <span>{code.split('\n').length} lines</span>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  placeholder={`Write your ${selectedChallenge.language} solution code here...`}
                  className="flex-1 min-h-[320px] bg-slate-950 p-4 font-mono text-xs sm:text-sm text-emerald-300 leading-6 focus:outline-none placeholder-slate-700"
                />

                {error && (
                  <div className="bg-rose-950 p-3 text-xs text-rose-300 border-t border-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="border-t border-slate-800 bg-slate-900 p-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCode(selectedChallenge.starterCode)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Starter Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitChallenge}
                    disabled={loading || !code.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Evaluating Code with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Submit for AI Evaluation</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Evaluation Results Screen */
              <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* Score Header Card */}
                <div
                  className={`rounded-2xl p-6 text-center border space-y-2 ${
                    evaluation.passed
                      ? 'bg-gradient-to-b from-emerald-50 to-teal-50/40 border-emerald-200'
                      : 'bg-gradient-to-b from-amber-50 to-orange-50/40 border-amber-200'
                  }`}
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-1">
                    {evaluation.passed ? (
                      <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Challenge Passed 🏆
                      </span>
                    ) : (
                      <span className="text-amber-800 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Needs Revisions (Pass ≥ 70)
                      </span>
                    )}
                  </div>

                  <h3 className="text-4xl font-extrabold text-slate-900 font-mono">
                    {evaluation.score} <span className="text-lg text-slate-400 font-sans">/ 100</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                    {evaluation.summary}
                  </p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Strengths Identified
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {evaluation.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-2">
                    <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      Actionable Tips
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {evaluation.improvementTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-sky-600 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Detailed Pedagogical Feedback:
                  </span>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <MarkdownRenderer content={evaluation.detailedFeedback} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEvaluation(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit & Resubmit Solution
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
