import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, ArrowRight, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage, Course } from '../types';
import { SAMPLE_QUESTIONS } from '../lib/constants';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AiTutorProps {
  courses: Course[];
  activeCourseContext?: Course | null;
  onClearContext?: () => void;
  onOpenSetupGuide: () => void;
}

export const AiTutor: React.FC<AiTutorProps> = ({
  courses,
  activeCourseContext,
  onClearContext,
  onOpenSetupGuide,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `Hello! 👋 I am **KiranLMS AI Tutor**, your personal AI Technical Learning Assistant.

Whether you're starting out with **Python**, mastering **Java**, or exploring **AI & Machine Learning**, I'm here to explain concepts simply and clearly.

Ask me anything! For example:
- *"What is Python and how do variables work?"*
- *"Can you explain Object-Oriented Programming with a simple analogy?"*
- *"What is the difference between an Array and a Linked List?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string>(
    activeCourseContext ? activeCourseContext.title : 'General'
  );
  const [errorNote, setErrorNote] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync selected context when prop changes
  useEffect(() => {
    if (activeCourseContext) {
      setSelectedContext(activeCourseContext.title);
    }
  }, [activeCourseContext]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    setErrorNote(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      courseContext: selectedContext !== 'General' ? selectedContext : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Server-side call to /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          courseContext: selectedContext !== 'General' ? selectedContext : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsConfig) {
          setErrorNote(
            'The Gemini API key is missing on the server. Please add GEMINI_API_KEY in your server environment.'
          );
        }
        throw new Error(data.error || 'Failed to get an answer from KiranLMS AI Tutor.');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Unable to complete answer:** ${err.message || 'Server error occurred.'}\n\nPlease check server connection or configure \`GEMINI_API_KEY\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: 'Chat history cleared. What technical topic would you like to explore next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">KiranLMS AI Tutor</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Online
              </span>
            </div>
            <p className="text-xs text-slate-500">Your Beginner-Friendly Technical Tutor</p>
          </div>
        </div>

        {/* Course Context Selector */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
            <BookOpen className="h-3.5 w-3.5 text-violet-600" />
            <span className="font-medium text-slate-500">Topic:</span>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="General">General CS & Tech</option>
              {courses.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error / Setup Alert if missing credentials */}
      {errorNote && (
        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            {errorNote}
          </span>
          <button
            onClick={onOpenSetupGuide}
            className="font-bold underline text-violet-700 hover:text-violet-900 ml-2"
          >
            Setup Guide
          </button>
        </div>
      )}

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {/* Course Context Pill if attached to user message */}
                {isUser && msg.courseContext && (
                  <div className="mb-1 text-[11px] font-medium text-violet-300 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Regarding: {msg.courseContext}
                  </div>
                )}

                {/* Message Body */}
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}

                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 shadow-xs mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs mt-1">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-xs bg-white border border-slate-200 px-4 py-3 text-slate-600 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-medium text-violet-700">
                <span className="h-2 w-2 rounded-full bg-violet-600 animate-ping" />
                KiranLMS AI is thinking and drafting an answer...
              </div>
              <div className="mt-2 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-100 bg-white px-4 py-2.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Suggested Beginner Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.question)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3 text-violet-600" />
                {q.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask KiranLMS anything about ${selectedContext !== 'General' ? selectedContext : 'programming, algorithms, or computer science'}... (Shift+Enter for newline)`}
            className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50/50 p-3 pr-24 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus:outline-none disabled:opacity-40 transition-colors"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-1.5 text-[11px] text-slate-400 text-center">
          KiranLMS explains technical concepts in plain English. Powered by Google Gemini on the backend.
        </p>
      </div>
    </div>
  );
};
