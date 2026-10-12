import React, { useState, useEffect, useCallback } from 'react';
import { AuthUser, Course, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { fetchCourses, getSupabase, fetchUserProfile } from './lib/supabase';
import { INITIAL_SAMPLE_COURSES } from './lib/constants';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [courses, setCourses] = useState<Course[]>(INITIAL_SAMPLE_COURSES);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Modals & Navigation
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('student');
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'student' | 'admin'>('home');

  // Load courses
  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const res = await fetchCourses();
      if (res.courses && res.courses.length > 0) {
        setCourses(res.courses);
      } else {
        setCourses(INITIAL_SAMPLE_COURSES);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      setCourses(INITIAL_SAMPLE_COURSES);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Check Supabase session on load
  useEffect(() => {
    loadCourses();

    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          const role: UserRole = (profile?.role as UserRole) || 'student';
          const userObj: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Student Learner',
            role,
          };
          setCurrentUser(userObj);
          setCurrentView(role === 'admin' ? 'admin' : 'student');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          const role: UserRole = (profile?.role as UserRole) || 'student';
          const userObj: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Student Learner',
            role,
          };
          setCurrentUser(userObj);
        } else {
          // If no active session, clear user unless in demo mode
          setCurrentUser((prev) => (prev?.isDemo ? prev : null));
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loadCourses]);

  const handleOpenStudentLogin = () => {
    setAuthModalRole('student');
    setAuthModalOpen(true);
  };

  const handleOpenAdminLogin = () => {
    setAuthModalRole('admin');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('student');
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase && !currentUser?.isDemo) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleGoToDashboard = () => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('student');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Route Views */}
      {currentView === 'home' && (
        <>
          <Navbar
            currentUser={currentUser}
            onOpenStudentLogin={handleOpenStudentLogin}
            onOpenAdminLogin={handleOpenAdminLogin}
            onOpenSetupGuide={() => setSetupGuideOpen(true)}
            onSignOut={handleSignOut}
            onGoToDashboard={handleGoToDashboard}
          />
          <HomePage
            courses={courses}
            onOpenStudentLogin={handleOpenStudentLogin}
            onOpenAdminLogin={handleOpenAdminLogin}
            onOpenSetupGuide={() => setSetupGuideOpen(true)}
            onSelectCourseForAi={() => {
              // If not logged in, prompt student login or go straight to dashboard
              if (!currentUser) {
                handleOpenStudentLogin();
              } else {
                setCurrentView('student');
              }
            }}
          />
        </>
      )}

      {currentView === 'student' && currentUser && (
        <StudentDashboard
          user={currentUser}
          courses={courses}
          onSignOut={handleSignOut}
          onOpenSetupGuide={() => setSetupGuideOpen(true)}
        />
      )}

      {currentView === 'admin' && currentUser && (
        <AdminDashboard
          user={currentUser}
          courses={courses}
          onRefreshCourses={loadCourses}
          onSignOut={handleSignOut}
          onOpenSetupGuide={() => setSetupGuideOpen(true)}
          onBackToHome={() => setCurrentView('home')}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialRole={authModalRole}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onOpenSetupGuide={() => {
          setAuthModalOpen(false);
          setSetupGuideOpen(true);
        }}
      />

      {/* Setup Guide & SQL Modal */}
      <SetupGuideModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
        onConfigUpdated={() => {
          loadCourses();
        }}
      />
    </div>
  );
}
