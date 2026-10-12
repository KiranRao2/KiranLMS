# KiranLMS — AI-Powered Technical Learning Platform

An interactive, beginner-friendly Learning Management System (LMS) and Coding Platform built with **React**, **TypeScript**, **Tailwind CSS**, **Monaco Editor**, and powered by **Google Gemini AI** and **Supabase**.

---

## 🌟 Key Features

1. **Interactive AI Code Playground & Debugger**:
   - In-browser code editor using Monaco (`@monaco-editor/react`) for **Python** and **Java**.
   - Live simulated output terminal with standard output and error tracebacks.
   - **"AI Review & Debug"** powered by Google Gemini API: Explains syntax or logic errors with plain English analogies and progressive hints without spoiling solutions.

2. **AI Project Challenge Evaluator**:
   - Hands-on mini-project coding challenges (e.g., Safe Calculator, Palindrome Checker, Bank Account Class).
   - Automated code evaluation returning scores (0–100), pass/fail status, strengths, improvement tips, and detailed code feedback.

3. **Course Quizzes & Dynamic Progress Tracking**:
   - Interactive multiple-choice quizzes at the end of each course.
   - Dynamic percentage completion tracking on the **Student Dashboard** based on completed modules, watched videos, quizzes passed, and project challenges solved.

4. **KiranLMS AI Tutor**:
   - Context-aware technical assistant ready to answer questions on Python, Java, Data Structures, Algorithms, AI/ML, and Web Development.

5. **Authentication & User Profiles**:
   - Supabase Auth integration with custom avatars, role switching, and enrollments.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Monaco Editor
- **Backend / Serverless**: Express API + Netlify Serverless Functions (`netlify/functions/api.ts`)
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Database / Auth**: Supabase

---

## 📦 How to Push this Code to GitHub

Follow these steps in your terminal to initialize and push this project to your GitHub account:

### 1. Initialize Git & Add Files (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: KiranLMS with AI Code Playground and Netlify setup"
```

### 2. Rename branch to `main`
```bash
git branch -M main
```

### 3. Create a New Repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Enter a repository name (e.g., `kiran-lms`).
3. Leave "Initialize this repository with a README" **unchecked** (since we already have a repository).
4. Click **Create repository**.

### 4. Link and Push to your GitHub Repository
Copy the remote URL from your newly created GitHub repository and run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/kiran-lms.git
git push -u origin main
```
*(Replace `YOUR_USERNAME/kiran-lms` with your actual GitHub username and repository name).*

---

## 🌐 How to Deploy & Host on Netlify

This project is already pre-configured for Netlify with `netlify.toml`, `public/_redirects`, and Netlify Serverless Functions for all `/api/*` endpoints!

### Option A: Deploy via Netlify Dashboard with GitHub (Recommended)

1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select **GitHub** and authorize access.
4. Choose your `kiran-lms` repository.
5. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
6. Click **"Environment variables"** (or go to **Site configuration > Environment variables**) and add:
   - `GEMINI_API_KEY`: Your Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xyzcompany.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key
7. Click **"Deploy site"**! Netlify will build your Vite app, deploy serverless functions, and give you a live URL (e.g., `https://kiran-lms.netlify.app`).

---

### Option B: Deploy via Netlify CLI

You can also deploy directly from your command line:

```bash
# 1. Install Netlify CLI globally
npm install -g netlify-cli

# 2. Login to your Netlify account
netlify login

# 3. Initialize and deploy
netlify init

# 4. Deploy production build
npm run build
netlify deploy --prod
```

---

## 💻 Local Development Setup

To run KiranLMS locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kiran-lms.git
   cd kiran-lms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔒 Security Note
- Secrets like `GEMINI_API_KEY` are kept safe on the server side / Netlify serverless functions and never exposed to the client browser.
- `.env` files are included in `.gitignore` to prevent leaking private credentials.
