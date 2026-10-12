import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Course, Profile } from '../types';
import { INITIAL_SAMPLE_COURSES } from './constants';

const STORAGE_KEY_URL = 'kiran_llm_supabase_url';
const STORAGE_KEY_ANON = 'kiran_llm_supabase_anon';

export function getSupabaseConfig(): { url: string; anonKey: string; isFromEnv: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (envUrl && envAnon && !envUrl.includes('your-project')) {
    return { url: envUrl, anonKey: envAnon, isFromEnv: true };
  }

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : '')?.trim() || '';
  const localAnon = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : '')?.trim() || '';

  return {
    url: localUrl,
    anonKey: localAnon,
    isFromEnv: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    cachedClient = null; // reset client
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    cachedClient = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return cachedClient;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

// -------------------------------------------------------------
// Database Operations with Graceful Fallbacks
// -------------------------------------------------------------

// Local storage backup for courses when running in sandbox/offline mode
const LOCAL_COURSES_KEY = 'kiran_llm_sandbox_courses';

export function getLocalCourses(): Course[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_COURSES;
  const raw = localStorage.getItem(LOCAL_COURSES_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(INITIAL_SAMPLE_COURSES));
    return INITIAL_SAMPLE_COURSES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_COURSES;
  } catch {
    return INITIAL_SAMPLE_COURSES;
  }
}

export function saveLocalCourse(course: Omit<Course, 'id' | 'created_at'>): Course {
  const courses = getLocalCourses();
  const newCourse: Course = {
    ...course,
    id: `course-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newCourse, ...courses];
  localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(updated));
  return newCourse;
}

export function deleteLocalCourse(id: string) {
  const courses = getLocalCourses();
  const filtered = courses.filter((c) => c.id !== id);
  localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(filtered));
}

// Fetch courses (attempts Supabase first, falls back to local sandbox)
export async function fetchCourses(): Promise<{ courses: Course[]; isFromDb: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { courses: getLocalCourses(), isFromDb: false };
  }

  try {
    const { data, error } = await client
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching courses from Supabase:', error.message);
      return {
        courses: getLocalCourses(),
        isFromDb: false,
        error: `Supabase query note: ${error.message}. Showing local cache.`,
      };
    }

    if (data && data.length > 0) {
      return { courses: data as Course[], isFromDb: true };
    }

    // If table exists but is empty, return empty list or initial samples
    return { courses: [], isFromDb: true };
  } catch (err: any) {
    return {
      courses: getLocalCourses(),
      isFromDb: false,
      error: err?.message || 'Network error connecting to Supabase',
    };
  }
}

// Insert a course (Supabase if connected and admin, else local)
export async function addCourseToDatabase(course: {
  title: string;
  description: string;
  youtube_url: string;
}): Promise<{ course: Course; isFromDb: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    const saved = saveLocalCourse(course);
    return { course: saved, isFromDb: false };
  }

  try {
    const { data, error } = await client
      .from('courses')
      .insert([course])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { course: data as Course, isFromDb: true };
  } catch (err: any) {
    console.error('Failed to insert course to Supabase:', err);
    throw err;
  }
}

// Delete course
export async function removeCourseFromDatabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    deleteLocalCourse(id);
    return { success: true };
  }

  try {
    const { error } = await client.from('courses').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Seed sample courses into Supabase
export async function seedSampleCoursesToDatabase(): Promise<{ count: number; error?: string }> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase is not configured.');

  const sampleRows = INITIAL_SAMPLE_COURSES.map((c) => ({
    title: c.title,
    description: c.description,
    youtube_url: c.youtube_url,
  }));

  const { data, error } = await client.from('courses').insert(sampleRows).select();
  if (error) throw error;
  return { count: data?.length || 0 };
}

// Fetch user profile from Supabase profiles table
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch profile from Supabase:', error.message);
      return null;
    }
    return data as Profile;
  } catch {
    return null;
  }
}
