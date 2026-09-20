'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Globe2,
  Languages,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuthLanguage } from '@/contexts/AuthLanguageContext';
import { AuthSupportedLanguage } from '@/lib/i18n/authTranslations';

export default function SignInPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useAuthLanguage();
  const [identifier, setIdentifier] = useState(''); // Name or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const staticMembers = [
    { name: 'Archit', email: 'archit@chaos2commit.ai' },
    { name: 'Yash', email: 'yash@chaos2commit.ai' },
    { name: 'Jayraj', email: 'jayraj@chaos2commit.ai' },
    { name: 'kavya', email: 'kavya@chaos2commit.ai' },
  ];

  const languages: { code: string; label: AuthSupportedLanguage }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
  ];

  const handleSelectMember = (member: { name: string; email: string }) => {
    setIdentifier(member.name);
    setPassword('1234');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier || !password) {
      setErrorMessage('Please enter both your name or email, and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Save user session in localStorage
      localStorage.setItem('chaos2commit_user', JSON.stringify(data.user));
      setSuccessMessage(data.message || 'Authentication successful! Redirecting to dashboard...');

      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Unable to connect to authentication server. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Sign In Glassmorphic Card */}
      <div className="glass-card p-6 sm:p-8 bg-white/85 dark:bg-[#0c132c]/90 border-black/[0.08] dark:border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden rounded-3xl">
        
        {/* Glow Accent at the top of the card */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Multi-Language Capability Badge & Direct Language Selector */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            <Globe2 className="w-3 h-3 text-indigo-500 shrink-0" />
            <span>{t.multiLangBadge}</span>
          </div>

          {/* Direct Language Switcher Dropdown on Card */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="h-7 px-2 rounded-lg bg-black/[0.04] dark:bg-[#0f172a] border border-black/10 dark:border-white/[0.1] flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{languages.find(l => l.label === language)?.code.toUpperCase() || 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-white/[0.1] shadow-2xl py-1.5 z-50 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.label);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      language === lang.label 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    {lang.label}
                    {language === lang.label && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Header */}
        <div className="mb-5 text-center sm:text-left relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.signInTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.signInSubtitle}
          </p>
        </div>

        {/* Multi-Language Capability Banner */}
        <div className="mb-5 p-2.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-[11px] font-medium leading-tight">
            {t.multiLangHighlight}
          </span>
        </div>

        {/* Quick Static Members Preset Buttons */}
        <div className="mb-5 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <span>{t.staticMembersTitle}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
            {t.staticMembersSubtitle}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {staticMembers.map((member) => {
              const isSelected = identifier.toLowerCase() === member.name.toLowerCase();
              return (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => handleSelectMember(member)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-[#0c1430] text-slate-700 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10'
                  }`}
                >
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{member.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Email/Name & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.workEmailOrName}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.workEmailOrNamePlaceholder}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.1] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.passwordLabel}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {t.forgotPasswordLink}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.1] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {t.rememberMeLabel}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-base tracking-wide text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.signingInButton}</span>
              </>
            ) : (
              <>
                <span>{t.signInButton}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Sign Up */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t.dontHaveAccount}{' '}
          <Link
            href="/sign-up"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            {t.createAccountLink}
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 relative">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t.forgotPasswordLink}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your registered work email or name to receive recovery instructions.
            </p>

            {forgotSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Recovery instructions sent to {forgotEmail}!</span>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/[0.04] dark:bg-black/40 border border-black/[0.1] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSubmitted(false);
                  setForgotEmail('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
              >
                Close
              </button>
              {!forgotSubmitted && (
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.includes('@')) {
                      setForgotSubmitted(true);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
