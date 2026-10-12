import React from 'react';
import { Sparkles, Database, Shield, GraduationCap, LogIn, LogOut, Settings } from 'lucide-react';
import { AuthUser } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentUser: AuthUser | null;
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
  onOpenSetupGuide: () => void;
  onSignOut: () => void;
  onGoToDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenStudentLogin,
  onOpenAdminLogin,
  onOpenSetupGuide,
  onSignOut,
  onGoToDashboard,
}) => {
  const isDbConfigured = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                KiranLMS
              </span>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-100 hidden sm:inline-block">
                AI Tutor
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Your AI Technical Learning Assistant
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Setup Guide Button */}
          <button
            onClick={onOpenSetupGuide}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Setup Guide & SQL Schema"
          >
            <Database className="h-3.5 w-3.5 text-violet-600" />
            <span className="hidden md:inline">Setup & SQL</span>
            <span
              className={`h-2 w-2 rounded-full ${
                isDbConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
              >
                {currentUser.role === 'admin' ? (
                  <>
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin Portal</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Student Dashboard</span>
                  </>
                )}
              </button>

              <button
                onClick={onSignOut}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenStudentLogin}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student Login</span>
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-violet-600" />
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
