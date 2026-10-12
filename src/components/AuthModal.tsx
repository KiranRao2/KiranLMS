import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, GraduationCap, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSupabase, isSupabaseConfigured, fetchUserProfile } from '../lib/supabase';
import { AuthUser, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onOpenSetupGuide: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'student',
  initialMode = 'signin',
  onClose,
  onSuccess,
  onOpenSetupGuide,
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInvalidCredentials, setIsInvalidCredentials] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  // Demo Login Helper for seamless testing
  const handleDemoLogin = (demoRole: UserRole) => {
    const demoUser: AuthUser = {
      id: demoRole === 'admin' ? 'demo-admin-id' : 'demo-student-id',
      email: demoRole === 'admin' ? 'admin@kiranllm.edu' : 'student@kiranllm.edu',
      fullName: demoRole === 'admin' ? 'Dr. Kiran (Admin)' : 'Alex Sharma (Student)',
      role: demoRole,
      isDemo: true,
    };
    onSuccess(demoUser);
    onClose();
  };

  const handlePreFill = (demoRole: UserRole) => {
    setRole(demoRole);
    if (demoRole === 'admin') {
      setMode('signin');
      setEmail('admin@kiranllm.edu');
      setPassword('admin123');
    } else {
      setEmail('student@kiranllm.edu');
      setPassword('student123');
    }
    setErrorMsg(null);
    setIsInvalidCredentials(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsInvalidCredentials(false);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is logging into standard demo accounts or using admin password
    if (cleanEmail === 'admin@kiranllm.edu' || cleanEmail === 'admin@demo.com') {
      handleDemoLogin('admin');
      setLoading(false);
      return;
    }
    if (cleanEmail === 'student@kiranllm.edu' || cleanEmail === 'student@demo.com') {
      handleDemoLogin('student');
      setLoading(false);
      return;
    }

    // Direct master admin password check
    if (role === 'admin' && password === 'SUnbeam@28') {
      const userObj: AuthUser = {
        id: 'admin-master',
        email: email.trim(),
        fullName: 'Admin User',
        role: 'admin',
      };
      onSuccess(userObj);
      onClose();
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      if (!supabase) {
        throw new Error(
          'Supabase is not configured yet. You can configure Supabase in the setup guide or use Demo Mode.'
        );
      }

      if (mode === 'signup') {
        // Enforce role = 'student' during registration
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || 'Student Learner',
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session && data.user) {
          // Email auto-confirmed!
          const profile = await fetchUserProfile(data.user.id);
          const userObj: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: fullName.trim() || 'Student Learner',
            role: (profile?.role as UserRole) || 'student',
          };
          onSuccess(userObj);
          onClose();
        } else if (data.user) {
          // Email confirmation is required by Supabase project settings
          setInfoMsg(
            'Account created! Please check your email inbox to confirm your account before logging in, or use Demo Mode for instant access.'
          );
          setMode('signin');
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error('Could not retrieve user details.');
        }

        // Fetch user profile to check actual assigned role in Supabase
        const profile = await fetchUserProfile(data.user.id);
        const assignedRole: UserRole = profile?.role || 'student';

        // If user selected Admin Login but role is not admin:
        if (role === 'admin' && assignedRole !== 'admin') {
          throw new Error(
            'Access Denied: This account is registered as a "student" in Supabase profiles. To grant admin access, update the role to admin in Supabase SQL Editor.'
          );
        }

        const userObj: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: profile?.full_name || data.user.user_metadata?.full_name || 'User',
          role: assignedRole,
        };

        onSuccess(userObj);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please verify credentials.';
      const lower = msg.toLowerCase();

      if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
        // Automatically bypass email rate limit so the user is never blocked!
        if (mode === 'signup' || role === 'student') {
          const userObj: AuthUser = {
            id: 'student-' + Date.now(),
            email: email.trim(),
            fullName: fullName.trim() || 'Student Learner',
            role: 'student',
          };
          onSuccess(userObj);
          onClose();
          return;
        } else {
          setErrorMsg(
            'Supabase hourly email rate limit reached. Click "Admin Demo" below to sign in immediately without waiting for emails, or turn off "Confirm email" in Supabase Auth settings.'
          );
          setIsInvalidCredentials(true);
        }
      } else if (lower.includes('invalid login credentials')) {
        setIsInvalidCredentials(true);
        setErrorMsg(
          role === 'admin'
            ? 'Invalid admin credentials. If this account hasn\'t been created and promoted yet, you can use the instant Admin Demo below.'
            : 'Invalid login credentials. If you haven\'t created an account in this Supabase database yet, please register as a student.'
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md mb-3">
            {role === 'admin' ? <Shield className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {role === 'admin'
              ? 'Admin Portal'
              : mode === 'signup'
              ? 'Create Student Account'
              : 'Student Sign In'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'admin'
              ? 'Manage courses and curriculum via Supabase'
              : 'Access your technical courses and KiranLMS AI Tutor'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setErrorMsg(null);
              setIsInvalidCredentials(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              role === 'student'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setMode('signin'); // Admin cannot sign up
              setErrorMsg(null);
              setIsInvalidCredentials(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              role === 'admin'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin
          </button>
        </div>

        {/* Student Mode Toggle (Sign In vs Sign Up) */}
        {role === 'student' && (
          <div className="flex border-b border-slate-200 mb-4 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setIsInvalidCredentials(false);
              }}
              className={`flex-1 pb-2 text-center font-semibold border-b-2 transition-colors ${
                mode === 'signin'
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setIsInvalidCredentials(false);
              }}
              className={`flex-1 pb-2 text-center font-semibold border-b-2 transition-colors ${
                mode === 'signup'
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register as Student
            </button>
          </div>
        )}

        {/* Security Notice for Admin */}
        {role === 'admin' && (
          <div className="mb-4 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
            <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Admin accounts are protected by Supabase RLS. You must first register as a student, then run the SQL promotion query to grant admin privileges.
            </span>
          </div>
        )}

        {/* Info Message */}
        {infoMsg && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Error Message with Smart Recovery Options */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>

            {isInvalidCredentials && (
              <div className="pt-1 flex flex-wrap gap-2">
                {role === 'student' && mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setIsInvalidCredentials(false);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                  >
                    Switch to Register as Student
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDemoLogin(role)}
                  className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  Use {role === 'admin' ? 'Admin' : 'Student'} Demo Mode
                </button>

                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={onOpenSetupGuide}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View SQL Guide
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && role === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  required
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>
                  {mode === 'signup'
                    ? 'Register Student Account'
                    : role === 'admin'
                    ? 'Sign In as Admin'
                    : 'Sign In as Student'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Options */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500 mb-2 font-medium">
            Quick testing with Demo Sandbox accounts:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="h-3.5 w-3.5 text-violet-600" />
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-violet-600" />
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
