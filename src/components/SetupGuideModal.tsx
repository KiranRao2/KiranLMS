import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Database, Sparkles, Key, CheckCircle2, AlertCircle, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/constants';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured } from '../lib/supabase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose, onConfigUpdated }) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'gemini' | 'security'>('supabase');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedAdminSql, setCopiedAdminSql] = useState(false);

  // Form for interactive credentials
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Status check state
  const [serverStatus, setServerStatus] = useState<{
    geminiConfigured: boolean;
    supabaseConfigured: boolean;
  } | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkServerHealth();
      const cfg = getSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseAnonKey(cfg.anonKey);
    }
  }, [isOpen]);

  const checkServerHealth = async () => {
    setIsCheckingServer(true);
    try {
      const res = await fetch('/api/config-status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch {
      setServerStatus({
        geminiConfigured: false,
        supabaseConfigured: false,
      });
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const adminSqlSnippet = `UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'yellasirimadhusmitha@gmail.com');

-- If you ever see "Database error querying schema", run this fix in SQL Editor:
-- UPDATE auth.users SET confirmation_token = COALESCE(confirmation_token, ''), recovery_token = COALESCE(recovery_token, ''), email_change_token_new = COALESCE(email_change_token_new, ''), email_change = COALESCE(email_change, '');`;

  const handleCopyAdminSql = () => {
    navigator.clipboard.writeText(adminSqlSnippet);
    setCopiedAdminSql(true);
    setTimeout(() => setCopiedAdminSql(false), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) return;

    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onConfigUpdated?.();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    onConfigUpdated?.();
  };

  if (!isOpen) return null;

  const isClientConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Setup Guide: Supabase & Gemini AI
              </h2>
              <p className="text-xs text-slate-500">
                Connect your real database and AI API step-by-step
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-100/70 px-6 py-3 border-b border-slate-200 text-xs">
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-violet-600" />
              Supabase Status:
            </span>
            {isClientConnected || serverStatus?.supabaseConfigured ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                <AlertCircle className="h-3 w-3" /> Credentials Missing
              </span>
            )}
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              Gemini API Status:
            </span>
            {serverStatus?.geminiConfigured ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" /> Active on Server
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                <Key className="h-3 w-3" /> Server Env Variable Required
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`border-b-2 py-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-4 w-4" />
            1. Supabase Setup & SQL Schema
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`border-b-2 py-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'gemini'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            2. Gemini AI Setup
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`border-b-2 py-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            3. Admin Role & Security
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">1</span>
                  Create a Free Supabase Project
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-violet-600 underline font-semibold inline-flex items-center gap-1">supabase.com <ExternalLink className="h-3 w-3" /></a> and create a new project. Choose a secure database password.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">2</span>
                    Run SQL in Supabase SQL Editor
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>SQL Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Full SQL Schema</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  In your Supabase project dashboard, navigate to <strong>SQL Editor</strong>, paste this script, and click <strong>Run</strong>. This creates the <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">profiles</code> and <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">courses</code> tables with Row Level Security (RLS).
                </p>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300">
                  <pre>{SUPABASE_SQL_SCHEMA}</pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">3</span>
                  Connect Supabase Credentials
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Find your credentials under <strong>Project Settings → API</strong>. You can configure them in your <code className="font-mono bg-white px-1 py-0.5 rounded">.env</code> file or test immediately by entering them below:
                </p>

                <form onSubmit={handleSaveCredentials} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project URL (e.g. https://your-project-id.supabase.co)
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Anon Public API Key
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="submit"
                      className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
                    >
                      Connect & Save Credentials
                    </button>
                    {isClientConnected && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Disconnect Credentials
                      </button>
                    )}
                  </div>

                  {saveSuccess && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                      Supabase client initialized successfully! Courses and authentication will now use your live database.
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">1</span>
                  How KiranLMS Protects Your Gemini API Key
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  All requests to Gemini API are securely routed through our backend Express endpoint (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">/api/chat</code>). The API key is stored exclusively in server environment variables (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">GEMINI_API_KEY</code>) and is <strong>never exposed</strong> to client browsers.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-xs text-white">2</span>
                  Setting the Gemini API Key
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  In Google AI Studio or your hosting environment, define:
                </p>
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400">
                  GEMINI_API_KEY=&quot;AIzaSy...your-gemini-key&quot;
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  The backend automatically uses model <code className="font-mono text-violet-700 bg-violet-50 px-1 rounded">gemini-3.8-flash</code> via the official <code className="font-mono text-violet-700 bg-violet-50 px-1 rounded">@google/genai</code> SDK.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  Strict Admin Role Security
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  Per strict security standards: <strong>Users cannot select the Admin role during registration</strong>. Every new user signing up via Supabase Auth is assigned the <code className="font-mono bg-amber-100 text-amber-900 px-1 rounded">student</code> role by default via the database trigger.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    How to Designate an Admin
                  </h4>
                  <button
                    onClick={handleCopyAdminSql}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                  >
                    {copiedAdminSql ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy Admin Query
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  After signing up with your email in the application, run this one-line SQL query in your Supabase SQL Editor:
                </p>
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300">
                  <pre>{adminSqlSnippet}</pre>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Once executed, Row Level Security will authorize this account to access the Admin Dashboard and manage courses.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={checkServerHealth}
            disabled={isCheckingServer}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900 hover:underline"
          >
            {isCheckingServer ? 'Testing connection...' : '🔄 Re-check Status'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
