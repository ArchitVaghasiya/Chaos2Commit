'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2,
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
  Check,
  Briefcase
} from 'lucide-react';
import { useAuthLanguage } from '@/contexts/AuthLanguageContext';
import { AuthSupportedLanguage } from '@/lib/i18n/authTranslations';

export default function SignUpPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useAuthLanguage();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [companySize, setCompanySize] = useState('51 - 200 employees');
  const [industry, setIndustry] = useState('IT & Software Services');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages: { code: string; label: AuthSupportedLanguage }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ar', label: 'العربية' },
  ];

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-300 dark:bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName || !contactName || !email || !password) {
      setErrorMessage('Please fill in all required company details.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid official work email address.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email,
          companyName,
          companySize,
          industry,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        setErrorMessage(data.error || 'Failed to register company account.');
        return;
      }

      // Save user session in localStorage
      localStorage.setItem('chaos2commit_user', JSON.stringify(data.user));
      setSuccessMessage(data.message || 'Company account created! Redirecting to dashboard...');

      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Unable to connect to registration server. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Sign Up Glassmorphic Card */}
      <div className="glass-card p-6 sm:p-8 bg-white/85 dark:bg-[#0c132c]/90 border-black/[0.08] dark:border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden rounded-3xl">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Multi-Language Capability Badge & Direct Language Selector */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
            <Globe2 className="w-3 h-3 text-purple-500 shrink-0" />
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
              <Languages className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
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
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' 
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
        <div className="mb-4 text-center sm:text-left relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-heading">
            {t.signUpTitle}
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
            {t.signUpSubtitle}
          </p>
        </div>

        {/* Multi-Language Capability Banner */}
        <div className="mb-4 p-2.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-[11px] font-medium leading-tight">
            {t.multiLangHighlight}
          </span>
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

        {/* Company Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Company Name */}
          <div>
            <label className="block text-sm font-bold text-slate-850 dark:text-slate-100 mb-1">
              {t.companyNameLabel}
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t.companyNamePlaceholder}
                autoComplete="organization"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.12] text-base font-medium text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Contact Person Name */}
          <div>
            <label className="block text-sm font-bold text-slate-850 dark:text-slate-100 mb-1">
              {t.contactPersonLabel}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={t.contactPersonPlaceholder}
                autoComplete="name"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.12] text-base font-medium text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-sm font-bold text-slate-850 dark:text-slate-100 mb-1">
              {t.workEmailLabel}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.workEmailPlaceholder}
                autoComplete="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.12] text-base font-medium text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Company Size & Industry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.companySizeLabel}
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c1430] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
              >
                <option value="1 - 10 employees">1 - 10 employees</option>
                <option value="11 - 50 employees">11 - 50 employees</option>
                <option value="51 - 200 employees">51 - 200 employees</option>
                <option value="201 - 500 employees">201 - 500 employees</option>
                <option value="500+ employees">500+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.industryLabel}
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c1430] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
              >
                <option value="IT & Software Services">IT & Software Services</option>
                <option value="Financial Services & Fintech">Financial Services</option>
                <option value="Healthcare & Life Sciences">Healthcare</option>
                <option value="Manufacturing & Logistics">Manufacturing</option>
                <option value="E-Commerce & Retail">E-Commerce</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.passwordLabel}
              </label>
              {password && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {t.passwordStrengthLabel}: <span className="font-bold">{passwordStrength.label}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-purple-600 border-slate-300 dark:border-slate-700 bg-transparent focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                {t.termsAgreePrefix}
                <Link href="#" className="text-purple-600 dark:text-purple-400 underline">{t.termsLink}</Link>
                {t.termsAnd}
                <Link href="#" className="text-purple-600 dark:text-purple-400 underline">{t.privacyLink}</Link>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-base tracking-wide text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.signingUpButton}</span>
              </>
            ) : (
              <>
                <span>{t.signUpButton}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Sign In */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {t.alreadyHaveAccount}{' '}
          <Link
            href="/sign-in"
            className="font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
          >
            {t.signInButton}
          </Link>
        </div>

      </div>
    </div>
  );
}
