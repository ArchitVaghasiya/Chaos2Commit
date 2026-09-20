'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  Volume2,
  Calendar,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Globe2,
  AlertCircle,
  Loader2,
  Lock,
  Timer,
  AlertTriangle,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import {
  getTranslation,
  getLocaleForVoice,
  getAiGreeting,
  getLanguageConfirmationSpeech,
  getCallLimitWrapupSpeech,
  getQuickReplies,
  SupportedLanguage,
} from '@/lib/i18n/translations';

interface Message {
  speaker: 'agent' | 'prospect';
  text: string;
  timestamp: string;
}

interface LiveCallSimulatorModalProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMeetingBookedSuccess?: () => void;
  defaultLanguage?: string;
}

const CALL_LIMIT_SECONDS = 180; // 3 Minutes (180 seconds) call limit

const AVAILABLE_LANGUAGES: { code: SupportedLanguage; label: string; flag: string; native: string }[] = [
  { code: 'English', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'हिन्दी', label: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'Español', label: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'Français', label: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'Deutsch', label: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'العربية', label: 'Arabic', flag: '🇦🇪', native: 'العربية' },
];

export default function LiveCallSimulatorModal({
  lead,
  isOpen,
  onClose,
  onMeetingBookedSuccess,
  defaultLanguage = 'English',
}: LiveCallSimulatorModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [callStatus, setCallStatus] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [duration, setDuration] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMeetingBooked, setIsMeetingBooked] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (defaultLanguage as SupportedLanguage) || 'English'
  );
  // Real Call Language Lock: Once the prospect selects their preferred language, it is permanently locked for the rest of the call
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const [callSummary, setCallSummary] = useState(
    'Evaluating requirement fit, timeline, and decision maker authority...'
  );
  const [nextBestAction, setNextBestAction] = useState(
    'Qualify company rollout scale and propose solutions demo.'
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const currentLeadIdRef = useRef<string | null>(null);
  const isOpenRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = getTranslation(selectedLanguage);
  const quickReplies = getQuickReplies(selectedLanguage);
  const remainingSeconds = Math.max(0, CALL_LIMIT_SECONDS - duration);
  const isApproachingLimit = callStatus === 'CONNECTED' && remainingSeconds > 0 && remainingSeconds <= 25;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Universal speech synthesis: Neural Audio (/api/voice/tts) + Web Speech API fallback
  const speakText = useCallback((text: string, lang: string = selectedLanguage) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsAiSpeaking(true);

    try {
      const audioUrl = `/api/voice/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsAiSpeaking(true);
      audio.onended = () => {
        setIsAiSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = (err) => {
        console.warn('Neural audio playback failed, trying browser SpeechSynthesis fallback:', err);
        fallbackBrowserSpeak(text, lang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay blocked by browser policy, attempting SpeechSynthesis:', err);
          fallbackBrowserSpeak(text, lang);
        });
      }
    } catch (err) {
      console.warn('Error creating Audio object, falling back to SpeechSynthesis:', err);
      fallbackBrowserSpeak(text, lang);
    }
  }, [selectedLanguage]);

  const fallbackBrowserSpeak = (text: string, lang: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = getLocaleForVoice(lang);
      utterance.lang = targetLocale;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = targetLocale.split('-')[0].toLowerCase();
        const matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() === targetLocale.toLowerCase() ||
            v.lang.toLowerCase().startsWith(langPrefix)
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(false);
    }
  };

  // Initialize or reset call session
  useEffect(() => {
    if (isOpen && lead) {
      if (!isOpenRef.current || currentLeadIdRef.current !== lead.id) {
        isOpenRef.current = true;
        currentLeadIdRef.current = lead.id;
        const initialLang = (defaultLanguage as SupportedLanguage) || 'English';
        setSelectedLanguage(initialLang);
        setIsLanguageSelected(false);
        setIsLimitReached(false);
        setCallStatus('RINGING');
        setDuration(0);
        setIsMeetingBooked(false);
        setErrorMessage(null);
        setCallSummary('Evaluating requirement fit, timeline, and decision maker authority...');
        setNextBestAction('Qualify company rollout scale and propose solutions demo.');

        // Ring for 1.8 seconds then connect
        const ringTimer = setTimeout(() => {
          setCallStatus('CONNECTED');
          
          // Realistic Call Workflow: First ask prospect for their preferred language!
          const chooseLangPrompt =
            "Hello! Before we begin our conversation, which language are you most comfortable with for today's call?";

          const initialAiQuestion: Message = {
            speaker: 'agent',
            text: chooseLangPrompt,
            timestamp: '00:02',
          };
          setMessages([initialAiQuestion]);
          speakText(chooseLangPrompt, 'English');
        }, 1800);

        return () => clearTimeout(ringTimer);
      }
    } else if (!isOpen) {
      isOpenRef.current = false;
      currentLeadIdRef.current = null;
      setMessages([]);
      setIsLanguageSelected(false);
      setIsLimitReached(false);
      setCallStatus('RINGING');
      setDuration(0);
      setErrorMessage(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, lead?.id, defaultLanguage, speakText]);

  // Duration timer & Call Limit Enforcement (3:00 Max)
  useEffect(() => {
    if (callStatus === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const next = prev + 1;
          if (next >= CALL_LIMIT_SECONDS) {
            // Reached call limit! Gracefully end call
            if (timerRef.current) clearInterval(timerRef.current);
            setCallStatus('ENDED');
            setIsLimitReached(true);
            const wrapupText = getCallLimitWrapupSpeech(selectedLanguage);
            const wrapupMsg: Message = {
              speaker: 'agent',
              text: wrapupText,
              timestamp: formatTime(CALL_LIMIT_SECONDS),
            };
            setMessages((existing) => [...existing, wrapupMsg]);
            speakText(wrapupText, selectedLanguage);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus, selectedLanguage, speakText]);

  // Auto-scroll chat transcript
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiSpeaking, isAiThinking]);

  // Step 1: Handle User Selecting Language at Call Start (PERMANENTLY LOCKED FOR CALL)
  const handleSelectCallLanguage = (lang: SupportedLanguage) => {
    if (isLanguageSelected || callStatus !== 'CONNECTED') return;

    setSelectedLanguage(lang);
    setIsLanguageSelected(true);

    if (!lead) return;

    const firstName = lead.name ? lead.name.split(' ')[0] : 'there';
    const requirementTopic = lead.companyName
      ? `your active requirement at ${lead.companyName}`
      : 'your public requirement';

    // 1. Log prospect choice
    const userChoiceMessage: Message = {
      speaker: 'prospect',
      text: lang === 'English'
        ? "I'd prefer to speak in English."
        : lang === 'हिन्दी'
        ? 'मैं हिन्दी में बात करना पसंद करूँगा।'
        : lang === 'Español'
        ? 'Prefiero hablar en español.'
        : lang === 'Français'
        ? 'Je préfère parler en français.'
        : lang === 'Deutsch'
        ? 'Ich spreche lieber auf Deutsch.'
        : 'أفضل التحدث باللغة العربية.',
      timestamp: formatTime(duration),
    };

    // 2. Ava confirms in selected language and begins pitch
    const confirmationSpeech = getLanguageConfirmationSpeech(
      lang,
      firstName,
      lead.companyName,
      requirementTopic
    );

    const agentConfirmMessage: Message = {
      speaker: 'agent',
      text: confirmationSpeech,
      timestamp: formatTime(duration + 1),
    };

    setMessages((prev) => [...prev, userChoiceMessage, agentConfirmMessage]);
    speakText(confirmationSpeech, lang);
  };

  // Step 2: Handle Subsequent Prospect Responses in the Locked Language
  const handleSendProspectMessage = async (textToSend: string) => {
    if (!textToSend.trim() || callStatus !== 'CONNECTED' || isAiThinking) return;

    // If prospect hasn't officially locked a language yet, detect or use current
    if (!isLanguageSelected) {
      const lower = textToSend.toLowerCase();
      let matchedLang: SupportedLanguage = selectedLanguage;
      if (lower.includes('hindi') || lower.includes('हिंदी') || lower.includes('हिन्दी')) {
        matchedLang = 'हिन्दी';
      } else if (lower.includes('spanish') || lower.includes('español')) {
        matchedLang = 'Español';
      } else if (lower.includes('french') || lower.includes('français')) {
        matchedLang = 'Français';
      } else if (lower.includes('german') || lower.includes('deutsch')) {
        matchedLang = 'Deutsch';
      } else if (lower.includes('arabic') || lower.includes('عربي')) {
        matchedLang = 'العربية';
      } else if (lower.includes('english')) {
        matchedLang = 'English';
      }

      handleSelectCallLanguage(matchedLang);
      return;
    }

    const userMsg: Message = {
      speaker: 'prospect',
      text: textToSend,
      timestamp: formatTime(duration),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsAiThinking(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          messages: newHistory.map((m) => ({
            role: m.speaker === 'agent' ? 'assistant' : 'user',
            content: m.text,
          })),
          prospectSpeech: textToSend,
          language: selectedLanguage, // Locked language sent to backend
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.reply) {
        const agentReply: Message = {
          speaker: 'agent',
          text: data.reply,
          timestamp: formatTime(duration + 2),
        };
        setMessages((prev) => [...prev, agentReply]);
        speakText(agentReply.text, selectedLanguage);

        if (data.meetingBooked) {
          setIsMeetingBooked(true);
          setCallSummary(
            data.summary ||
              `Qualified: requirement verified. Budget approved, ${lead?.jobTitle || 'Decision maker'} confirmed.`
          );
          setNextBestAction(data.nextBestAction || 'Send case study, confirm Thursday 3 PM demo.');
          onMeetingBookedSuccess?.();
        }
      } else {
        setErrorMessage(data?.error || 'Voice response could not be generated. Please retry.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error communicating with AI voice agent.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleEndCall = () => {
    setCallStatus('ENDED');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  if (!isOpen || !lead) return null;

  const progressPercent = Math.min(100, (duration / CALL_LIMIT_SECONDS) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl glass-card border-indigo-500/30 bg-[#090d22] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Call Header */}
        <div className="p-4 border-b border-white/[0.08] bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-purple-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {callStatus === 'CONNECTED' && (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#090d22]"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  {t.voiceSimulatorTitle}
                </h2>

                {callStatus === 'CONNECTED' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {t.connectedStatus.toUpperCase()} • {formatTime(duration)}
                  </span>
                )}

                {callStatus === 'RINGING' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    {t.ringingStatus}
                  </span>
                )}

                {callStatus === 'ENDED' && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLimitReached
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {isLimitReached ? t.callLimitReached : 'CALL ENDED'}
                  </span>
                )}

                {/* Call Limit Display Badge in Header */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                    isApproachingLimit
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 animate-pulse'
                      : isLimitReached
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}
                >
                  <Timer className="w-3 h-3" />
                  <span>
                    {isLimitReached
                      ? 'Limit 3:00 Reached'
                      : `${t.timeLeftLabel}: ${formatTime(remainingSeconds)} / 03:00`}
                  </span>
                </div>

                {/* Language Locked Status Pill */}
                {isLanguageSelected && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{selectedLanguage} (Locked)</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-300">
                {t.outboundCallTo} <span className="font-semibold text-white">{lead.name}</span> ({lead.jobTitle} at {lead.companyName}) • {lead.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callStatus === 'CONNECTED' && (
              <button
                onClick={handleEndCall}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" /> {t.endCallBtn}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close Live Call dialog"
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Call Limit Progress Bar */}
        <div className="w-full bg-white/[0.05] h-1.5 relative overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isLimitReached
                ? 'bg-rose-500'
                : isApproachingLimit
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Live Call Audio & Transcript Stream */}
          <div className="lg:col-span-7 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#070b1e]">
            {/* Live Call Pill Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Call • {lead.companyName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                  {isLanguageSelected && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                  {selectedLanguage}
                </span>
                <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {callStatus === 'CONNECTED' ? t.connectedStatus : callStatus === 'ENDED' ? 'ENDED' : t.ringingStatus}
                </span>
              </div>
            </div>

            {/* Scrolling Transcript Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[280px] max-h-[350px]">
              {messages.map((msg, idx) => {
                const isAgent = msg.speaker === 'agent';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      isAgent ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-md shadow-indigo-600/30">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[84%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-[#141b3c] border border-indigo-500/30 text-slate-100 rounded-tl-none shadow-md'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-semibold">
                        <span>{isAgent ? t.aiSalesAgentLabel : lead.name}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                    {!isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Step 1 Prompt: Initial Language Choice Interactive Card (Displayed when call connects and language not yet locked) */}
              {callStatus === 'CONNECTED' && !isLanguageSelected && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-blue-950/60 to-purple-950/80 border border-indigo-500/40 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4 text-indigo-400" />
                      <span>Select Preferred Language for Call:</span>
                    </div>
                    <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Locks for Call
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Just like a real sales call, Ava asks which language you are most comfortable with. Click your choice below to lock it for this session:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {AVAILABLE_LANGUAGES.map((langItem) => (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => handleSelectCallLanguage(langItem.code)}
                        className="p-2 rounded-xl bg-white/[0.06] hover:bg-indigo-600/40 border border-white/[0.12] hover:border-indigo-400 text-left transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{langItem.flag}</span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-200">
                              {langItem.native}
                            </div>
                            <div className="text-[10px] text-slate-400">{langItem.label}</div>
                          </div>
                        </div>
                        <Check className="w-3.5 h-3.5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Approaching Limit Notification in Transcript */}
              {isApproachingLimit && (
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.approachingLimitWarning} ({remainingSeconds}s remaining). Wrapping up qualification...</span>
                </div>
              )}

              {/* Call Limit Reached Notification */}
              {isLimitReached && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{t.callLimitReached}. Follow-up invitation emailed to prospect.</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-rose-500/30 px-2 py-0.5 rounded border border-rose-500/50">
                    Max 3:00
                  </span>
                </div>
              )}

              {isAiSpeaking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium animate-pulse pl-9">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  Ava is speaking in {selectedLanguage}...
                </div>
              )}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium pl-9">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Ava is listening &amp; formulating response in {selectedLanguage}...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-[11px] text-rose-400 hover:text-white underline cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Interactive Speak / Reply Controls */}
            <div className="pt-3 border-t border-white/[0.06] mt-2 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  {!isLanguageSelected
                    ? 'Step 1: Choose or speak language to begin'
                    : `Simulate or Speak ${lead.name.split(' ')[0]}'s Response (${selectedLanguage}):`}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Groq Multilingual Neural Voice
                </span>
              </div>

              {/* Quick Prompt Suggestions in current language (Enabled after language is selected) */}
              {isLanguageSelected ? (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSendProspectMessage(quickReplies.reply1)}
                    disabled={isAiThinking || callStatus !== 'CONNECTED'}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-40"
                  >
                    &quot;{quickReplies.reply1}&quot;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendProspectMessage(quickReplies.reply2)}
                    disabled={isAiThinking || callStatus !== 'CONNECTED'}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-40"
                  >
                    &quot;{quickReplies.reply2}&quot;
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleSelectCallLanguage(l.code)}
                      disabled={callStatus !== 'CONNECTED'}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {l.flag} {l.native}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendProspectMessage(inputText)}
                  placeholder={
                    !isLanguageSelected
                      ? 'Type preferred language (English, हिन्दी, Español...) or select above...'
                      : t.typeSpokenWords
                  }
                  disabled={isAiThinking || callStatus !== 'CONNECTED'}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#090d1f] border border-white/[0.1] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendProspectMessage(inputText)}
                  disabled={!inputText.trim() || isAiThinking || callStatus !== 'CONNECTED'}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
                >
                  {isAiThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Call Summary & Next Best Action */}
          <div className="lg:col-span-5 p-4 bg-[#0a0e28] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Call Limit Metric Box */}
              <div className="p-3.5 rounded-xl bg-[#060918] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-indigo-400" />
                    {t.callLimitLabel}
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      isApproachingLimit
                        ? 'text-amber-400 font-bold animate-pulse'
                        : isLimitReached
                        ? 'text-rose-400 font-bold'
                        : 'text-indigo-300'
                    }`}
                  >
                    {formatTime(remainingSeconds)} left
                  </span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isLimitReached
                        ? 'bg-rose-500'
                        : isApproachingLimit
                        ? 'bg-amber-400'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Standard telecom limit enforced for initial autonomous outreach. Call cleanly wraps up at 3:00.
                </p>
              </div>

              {/* Call Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#060918] border border-white/[0.08]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {t.callSummaryTitle}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  {callSummary}
                </p>
              </div>

              {/* Next Best Action Card */}
              <div className="p-3.5 rounded-xl bg-[#060918] border border-white/[0.08]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {t.nextBestActionTitle}
                </div>
                <p className="text-xs text-emerald-300 leading-relaxed bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 font-medium">
                  {nextBestAction}
                </p>
              </div>

              {/* Outcomes Handled Automatically Badges */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {t.outcomesHandledTitle}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      isMeetingBooked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.02] text-slate-400 border-white/[0.05]'
                    }`}
                  >
                    {t.interestedBadge}
                  </span>

                  <span
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      isMeetingBooked
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border-emerald-500/50 shadow-md animate-pulse'
                        : 'bg-white/[0.02] text-slate-400 border-white/[0.05]'
                    }`}
                  >
                    {t.meetingBookedBadge}
                  </span>

                  <span className="p-2 rounded-lg bg-white/[0.02] text-slate-400 border border-white/[0.05] text-center">
                    {t.voicemailBadge}
                  </span>

                  <span className="p-2 rounded-lg bg-white/[0.02] text-slate-400 border border-white/[0.05] text-center">
                    {t.retryBadge}
                  </span>
                </div>
              </div>
            </div>

            {/* Language Lock Strip: Strictly locked once call starts */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  {isLanguageSelected ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>
                    {isLanguageSelected ? t.languageLockedBadge : t.multilingualTitle}:
                  </span>
                </div>
                {isLanguageSelected && (
                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>

              {isLanguageSelected ? (
                <div className="p-2 rounded-lg bg-white/[0.03] border border-amber-500/20 text-slate-300 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Session Language: <strong className="text-white">{selectedLanguage}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400">Locked till call end</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_LANGUAGES.map((langItem) => (
                    <button
                      key={langItem.code}
                      onClick={() => handleSelectCallLanguage(langItem.code)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                        selectedLanguage === langItem.code
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {langItem.flag} {langItem.code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
