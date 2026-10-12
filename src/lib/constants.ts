import { Course } from '../types';

export const INITIAL_SAMPLE_COURSES: Course[] = [
  {
    id: 'course-1-python',
    title: 'Python Basics',
    description: 'Master Python fundamentals including variables, data types, control flow, functions, loops, and object-oriented programming with interactive coding examples.',
    youtube_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'course-2-java',
    title: 'Java Fundamentals',
    description: 'Learn core Java principles, class architecture, methods, data structures, and foundational algorithms designed specifically for beginners.',
    youtube_url: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'course-3-aiml',
    title: 'AI & Machine Learning',
    description: 'An introductory guide to artificial intelligence, neural networks, machine learning algorithms, and modern Large Language Models (LLMs).',
    youtube_url: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const SAMPLE_QUESTIONS = [
  {
    category: 'Python',
    question: 'What is Python and why is it so widely used for beginners?',
  },
  {
    category: 'Java',
    question: 'What is the difference between a class and an object in Java?',
  },
  {
    category: 'AI & ML',
    question: 'How do Large Language Models (LLMs) learn and generate human-like text?',
  },
  {
    category: 'Algorithms',
    question: 'Explain what Big O notation is using a simple everyday analogy.',
  },
];

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- KiranLMS — AI Technical Learning Assistant
-- Supabase Database Schema & Row Level Security (RLS) Setup
-- ====================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own name, but CANNOT elevate their role
CREATE POLICY "Users can update own profile name"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'student');

-- Function and trigger to auto-create profile when user registers via Supabase Auth
-- Note: Role always defaults to 'student' to prevent unauthorized admin creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (students, visitors, authenticated) can view courses
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO public
  USING (true);

-- Helper function to check if the current user has 'admin' role in profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Only admin can insert courses
CREATE POLICY "Only admins can insert courses"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Policy: Only admin can update courses
CREATE POLICY "Only admins can update courses"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy: Only admin can delete courses
CREATE POLICY "Only admins can delete courses"
  ON public.courses FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. Seed initial sample courses
INSERT INTO public.courses (title, description, youtube_url)
VALUES
  ('Python Basics', 'Master Python fundamentals including variables, data types, control flow, functions, loops, and object-oriented programming with interactive coding examples.', 'https://www.youtube.com/watch?v=kqtD5dpn9C8'),
  ('Java Fundamentals', 'Learn core Java principles, class architecture, methods, data structures, and foundational algorithms designed specifically for beginners.', 'https://www.youtube.com/watch?v=eIrMbAQSU34'),
  ('AI & Machine Learning', 'An introductory guide to artificial intelligence, neural networks, machine learning algorithms, and modern Large Language Models (LLMs).', 'https://www.youtube.com/watch?v=JMUxmLyrhSk');

-- 4. To designate an admin user:
-- First create the user via the app (Register as Student) or via Supabase Dashboard (Auth -> Add user).
-- Then promote them to admin using this safe query:
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'yellasirimadhusmitha@gmail.com');

-- If you ever get "Database error querying schema" from manual auth.users inserts, run this fix:
-- UPDATE auth.users SET confirmation_token = COALESCE(confirmation_token, ''), recovery_token = COALESCE(recovery_token, ''), email_change_token_new = COALESCE(email_change_token_new, ''), email_change = COALESCE(email_change, '');
`;
