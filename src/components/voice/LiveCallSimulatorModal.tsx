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
}

export default function LiveCallSimulatorModal({
  lead,
  isOpen,
  onClose,
  onMeetingBookedSuccess,
}: LiveCallSimulatorModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [callStatus, setCallStatus] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [duration, setDuration] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMeetingBooked, setIsMeetingBooked] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
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

  // Initialize or reset call only when modal is newly opened or lead ID changes
  useEffect(() => {
    if (isOpen && lead) {
      if (!isOpenRef.current || currentLeadIdRef.current !== lead.id) {
        isOpenRef.current = true;
        currentLeadIdRef.current = lead.id;
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

          const initialAiGreeting: Message = {
            speaker: 'agent',
            text: `Hello ${firstName}, I'm Ava from TechNova Solutions. I'm calling about ${requirementTopic}.`,
            timestamp: '00:03',
          };
          setMessages([initialAiGreeting]);
          speakText(initialAiGreeting.text);
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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, lead?.id]);

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

  // Free in-browser speech synthesis (Text-to-Speech)
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
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
      // Call backend AI voice agent API
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
        speakText(agentReply.text);

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
    } catch (err) {
      console.error('Call turn error:', err);
      setErrorMessage('Connection issue to Voice Agent. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleEndCall = () => {
    setCallStatus('ENDED');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl glass-card border-indigo-500/30 shadow-2xl bg-[#090d24] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 bg-[#0d1334] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  Multilingual AI Voice Agent
                </h2>
                {callStatus === 'CONNECTED' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    CONNECTED • {formatTime(duration)}
                  </span>
                )}
                {callStatus === 'RINGING' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    RINGING PROSPECT...
                  </span>
                )}
                {callStatus === 'ENDED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                    CALL ENDED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Outbound call to <span className="font-semibold text-white">{lead.name}</span> ({lead.jobTitle} at {lead.companyName}) • {lead.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callStatus === 'CONNECTED' && (
              <button
                onClick={handleEndCall}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" /> End Call
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

        {/* Modal Body: 2 Columns matching Video Slide 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Live Call Audio & Transcript Stream */}
          <div className="lg:col-span-7 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#070b1e]">
            {/* Live Call Pill Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live call • {lead.companyName}
              </span>
              <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Connected
              </span>
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
                        <span>{isAgent ? 'AI Sales Agent (Ava)' : lead.name}</span>
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
                  AI Agent is speaking...
                </div>
              )}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium pl-9">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Ava is listening &amp; formulating response...</span>
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
                  Groq Ultra-Fast Engine Active
                </span>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSendProspectMessage(
                      'Yes – we need a qualified partner for this implementation and automation.'
                    )
                  }
                  disabled={isAiThinking || callStatus !== 'CONNECTED'}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-40"
                >
                  &quot;Yes, we need a partner for this implementation...&quot;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendProspectMessage(
                      'Next quarter, around 150 users. Can we set up a call with your team?'
                    )
                  }
                  disabled={isAiThinking || callStatus !== 'CONNECTED'}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-40"
                >
                  &quot;Next quarter, 150 users. Can we set up a call?&quot;
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendProspectMessage(inputText)}
                  placeholder={`Type ${lead.name.split(' ')[0]}'s spoken words or click suggestions above...`}
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

          {/* Right Column: Call Summary & Next Best Action (Slide 5) */}
          <div className="lg:col-span-5 p-4 bg-[#0a0e28] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Call Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#060918] border border-white/[0.08]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Call Summary
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                  {callSummary}
                </p>
              </div>

              {/* Next Best Action Card */}
              <div className="p-3.5 rounded-xl bg-[#060918] border border-white/[0.08]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Next Best Action
                </div>
                <p className="text-xs text-emerald-300 leading-relaxed bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 font-medium">
                  {nextBestAction}
                </p>
              </div>

              {/* Outcomes Handled Automatically Badges */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Outcomes Handled Automatically
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      isMeetingBooked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.02] text-slate-400 border-white/[0.05]'
                    }`}
                  >
                    ✓ Interested
                  </span>

                  <span
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      isMeetingBooked
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border-emerald-500/50 shadow-md animate-pulse'
                        : 'bg-white/[0.02] text-slate-400 border-white/[0.05]'
                    }`}
                  >
                    📅 Meeting Booked
                  </span>

                  <span className="p-2 rounded-lg bg-white/[0.02] text-slate-400 border border-white/[0.05] text-center">
                    Voicemail Left
                  </span>

                  <span className="p-2 rounded-lg bg-white/[0.02] text-slate-400 border border-white/[0.05] text-center">
                    Retry Scheduled
                  </span>
                </div>
              </div>
            </div>

            {/* Multilingual Support Strip */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" /> Multilingual AI Voice Calling:
              </div>
              <div className="flex flex-wrap gap-1">
                {['English', 'हिन्दी', 'Español', 'العربية', 'Français', 'Deutsch'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
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
