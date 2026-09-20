'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Save
} from 'lucide-react';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id?: string;
    name?: string;
    email?: string;
    companyName?: string;
    companySize?: string;
    industry?: string;
    role?: string;
  } | null;
  onProfileUpdated: (updatedUser: any) => void;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: UpdateProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('51 - 200 employees');
  const [industry, setIndustry] = useState('IT & Software Services');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setCompanyName(currentUser.companyName || '');
      setCompanySize(currentUser.companySize || '51 - 200 employees');
      setIndustry(currentUser.industry || 'IT & Software Services');
      setPassword('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email) {
      setErrorMessage('Name and Email are required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser?.id,
          name,
          email,
          companyName,
          companySize,
          industry,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        setErrorMessage(data.error || 'Failed to update profile details.');
        return;
      }

      setIsLoading(false);
      setSuccessMessage(data.message || 'Profile updated successfully!');
      onProfileUpdated(data.user);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Unable to connect to profile server. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-card p-6 sm:p-7 bg-white/95 dark:bg-[#0c132c]/95 border-black/10 dark:border-white/10 rounded-3xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Neon PostgreSQL Account</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Update Profile Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your personal and company information
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.05] hover:bg-black/[0.1] dark:hover:bg-white/[0.1] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
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

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Archit Vaghasiya"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.1] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="archit@chaos2commit.ai"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.1] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Chaos2Commit Enterprise"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.1] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Company Size & Industry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/[0.03] dark:bg-[#0c1430] border border-black/[0.1] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/[0.03] dark:bg-[#0c1430] border border-black/[0.1] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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

          {/* Change Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Change Password <span className="text-[11px] font-normal text-slate-400">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.1] dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
