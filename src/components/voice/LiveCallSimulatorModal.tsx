'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
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
} from 'lucide-react';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import {
  getTranslation,
  getLocaleForVoice,
  getAiGreeting,
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
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
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

  // Synchronize language when defaultLanguage prop changes
  useEffect(() => {
    if (defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage]);

  const t = getTranslation(selectedLanguage);
  const quickReplies = getQuickReplies(selectedLanguage);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Universal high-fidelity speech synthesis supporting Hindi, Spanish, French, German, Arabic, English
  const speakText = (text: string, lang = selectedLanguage) => {
    // 1. Cancel previous audio and speech synthesis
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsAiSpeaking(true);

    // 2. Play high-fidelity neural voice from /api/voice/tts
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
        console.warn('Neural audio playback failed, trying browser SpeechSynthesis:', err);
        fallbackBrowserSpeak(text, lang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play blocked by browser policy, attempting SpeechSynthesis:', err);
          fallbackBrowserSpeak(text, lang);
        });
      }
    } catch (err) {
      console.warn('Error creating Audio object, falling back to SpeechSynthesis:', err);
      fallbackBrowserSpeak(text, lang);
    }
  };

  const fallbackBrowserSpeak = (text: string, lang: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = getLocaleForVoice(lang);
      utterance.lang = targetLocale;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Attempt to pick a browser voice that matches target locale or language
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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Initialize or reset call only when modal is newly opened or lead ID changes
  useEffect(() => {
    if (isOpen && lead) {
      if (!isOpenRef.current || currentLeadIdRef.current !== lead.id) {
        isOpenRef.current = true;
        currentLeadIdRef.current = lead.id;
        const initialLang = defaultLanguage || 'English';
        setSelectedLanguage(initialLang);
        setCallStatus('RINGING');
        setDuration(0);
        setIsMeetingBooked(false);
        setErrorMessage(null);
        setCallSummary('Evaluating requirement fit, timeline, and decision maker authority...');
        setNextBestAction('Qualify company rollout scale and propose solutions demo.');

        // Ring for 1.8 seconds then connect
        const ringTimer = setTimeout(() => {
          setCallStatus('CONNECTED');
          const firstName = lead.name ? lead.name.split(' ')[0] : 'there';
          const requirementTopic = lead.companyName
            ? `your active requirement at ${lead.companyName}`
            : 'your public requirement';

          const greetingText = getAiGreeting(initialLang, firstName, lead.companyName, requirementTopic);
          const initialAiGreeting: Message = {
            speaker: 'agent',
            text: greetingText,
            timestamp: '00:03',
          };
          setMessages([initialAiGreeting]);
          speakText(greetingText, initialLang);
        }, 1800);

        return () => clearTimeout(ringTimer);
      }
    } else if (!isOpen) {
      isOpenRef.current = false;
      currentLeadIdRef.current = null;
      setMessages([]);
      setCallStatus('RINGING');
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
  }, [isOpen, lead?.id, defaultLanguage]);

  // Duration timer
  useEffect(() => {
    if (callStatus === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiSpeaking, isAiThinking]);

  // Handle switching language in real-time during an active call
  const handleSwitchLanguage = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (lead && callStatus === 'CONNECTED') {
      const firstName = lead.name ? lead.name.split(' ')[0] : 'there';
      const requirementTopic = lead.companyName
        ? `your requirement at ${lead.companyName}`
        : 'your requirement';

      const localizedGreeting = getAiGreeting(newLang, firstName, lead.companyName, requirementTopic);
      const switchMessage: Message = {
        speaker: 'agent',
        text: localizedGreeting,
        timestamp: formatTime(duration),
      };
      setMessages((prev) => [...prev, switchMessage]);
      speakText(localizedGreeting, newLang);
    }
  };

  const handleSendProspectMessage = async (textToSend: string) => {
    if (!textToSend.trim() || callStatus !== 'CONNECTED' || isAiThinking) return;

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
      // Call backend AI voice agent API with user selected language
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
          language: selectedLanguage,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl glass-card border-indigo-500/30 bg-[#090d22] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Call Header */}
        <div className="p-4 border-b border-white/[0.08] bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 flex items-center justify-between">
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
              <div className="flex items-center gap-2">
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                    CALL ENDED
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
                <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {selectedLanguage}
                </span>
                <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {callStatus === 'CONNECTED' ? t.connectedStatus : t.ringingStatus}
                </span>
              </div>
            </div>

            {/* Scrolling Transcript Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[280px] max-h-[360px]">
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
                      className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
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

              {isAiSpeaking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium animate-pulse pl-9">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  AI Agent is speaking in {selectedLanguage}...
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
                <span>Simulate or Speak {lead.name.split(' ')[0]}&apos;s Response:</span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Groq Multilingual Engine Active
                </span>
              </div>

              {/* Quick Prompt Suggestions in current language */}
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

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendProspectMessage(inputText)}
                  placeholder={t.typeSpokenWords}
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

            {/* Multilingual Support Strip */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" /> {t.multilingualTitle}:
              </div>
              <div className="flex flex-wrap gap-1">
                {(['English', 'हिन्दी', 'Español', 'العربية', 'Français', 'Deutsch'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSwitchLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
