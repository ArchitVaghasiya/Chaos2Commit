'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Headphones,
  CalendarCheck,
  Voicemail,
  PhoneForwarded,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  Sparkles,
  Bot,
  User,
  Search,
  Filter,
  RefreshCw,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface CallRecord {
  id: string;
  contactName: string;
  companyName: string;
  phone: string;
  duration: string;
  durationSeconds?: number;
  status: string;
  outcome: string;
  timestamp: string;
  summary: string;
  nextBestAction: string;
  transcript: {
    speaker: string;
    text: string;
    time: string;
    timestamp?: string;
    offsetSeconds?: number;
  }[];
  sentiment?: string;
  language?: string;
  calendlyStatus?: string;
  calendlyUrl?: string | null;
  createdAt?: string;
}

const SAMPLE_FALLBACK_RECORDS: CallRecord[] = [
  {
    id: 'call-sample-1',
    contactName: 'John Smith',
    companyName: 'TechNova Solutions',
    phone: '+1 (555) 123-4567',
    duration: '2m 45s',
    status: 'CONNECTED',
    outcome: 'MEETING_BOOKED',
    timestamp: 'Today, 2:15 PM',
    summary:
      'Qualified: 150-user Microsoft 365 & SharePoint rollout planned for next quarter. Budget approved, John is the CTO and decision maker.',
    nextBestAction: 'Send SharePoint case study, confirm Thursday 3 PM demo with solutions lead.',
    transcript: [
      {
        speaker: 'Ava (AI)',
        text: "Hello John, I'm Ava from TechNova Solutions. I'm calling about your public Microsoft 365 & SharePoint automation requirement.",
        time: '00:02',
      },
      {
        speaker: 'John Smith',
        text: "Yes – we need a partner for SharePoint and workflow automation. What's your experience?",
        time: '00:14',
      },
      {
        speaker: 'Ava (AI)',
        text: 'We specialize in enterprise SharePoint migrations and workflow automation. What timeline and team size are you planning for?',
        time: '00:26',
      },
      {
        speaker: 'John Smith',
        text: 'Next quarter, around 150 users. Can we set up a call with your solutions team?',
        time: '00:41',
      },
      {
        speaker: 'Ava (AI)',
        text: 'Absolutely! I have booked Thursday at 3 PM with our solutions lead. A confirmation email and calendar invite has been sent to your inbox.',
        time: '00:58',
      },
    ],
    sentiment: 'POSITIVE',
  },
  {
    id: 'call-sample-2',
    contactName: 'Priya Nair',
    companyName: 'CloudTech Inc.',
    phone: '+1 (555) 872-9012',
    duration: '0m 48s',
    status: 'CONNECTED',
    outcome: 'HUMAN_HANDOFF',
    timestamp: 'Today, 1:40 PM',
    summary:
      'Prospect requested direct connection with solution architect. SMS with Calendly direct booking link dispatched.',
    nextBestAction: 'Track Calendly booking. Trigger automatic AI re-dial if lead does not book within timeframe.',
    transcript: [
      {
        speaker: 'Ava (AI)',
        text: "Hi Priya, Ava calling from TechNova Solutions regarding your company's cloud infrastructure deployment.",
        time: '00:03',
      },
      {
        speaker: 'Priya Nair',
        text: 'Can I speak to someone from your engineering team or receive a link to schedule a direct call?',
        time: '00:14',
      },
      {
        speaker: 'Ava (AI)',
        text: "I completely understand! I have just sent a text message to your phone with our Calendly booking link so you can directly pick a timeslot that works best for you.",
        time: '00:24',
      },
    ],
    sentiment: 'NEUTRAL',
    calendlyStatus: 'LINK_SENT',
  },
];

export default function ConversationsHub() {
  const [calls, setCalls] = useState<CallRecord[]>(SAMPLE_FALLBACK_RECORDS);
  const [selectedCall, setSelectedCall] = useState<CallRecord>(SAMPLE_FALLBACK_RECORDS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Playback Ref
  const isPlayingRef = useRef(false);

  // Fetch real calls from database
  const fetchCalls = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.calls) && data.calls.length > 0) {
          setCalls(data.calls);
          // Preserve selected call if it exists, or select newest call
          setSelectedCall((prev) => {
            const found = data.calls.find((c: CallRecord) => c.id === prev?.id);
            return found || data.calls[0];
          });
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalls();

    // Listen for call completion events dispatched across the app
    const handleCallCompleted = () => {
      fetchCalls(true);
    };

    window.addEventListener('call-completed', handleCallCompleted);
    window.addEventListener('focus', handleCallCompleted);

    return () => {
      window.removeEventListener('call-completed', handleCallCompleted);
      window.removeEventListener('focus', handleCallCompleted);
      stopAudioPlayback();
    };
  }, []);

  // Stop any active audio speech synthesis
  const stopAudioPlayback = () => {
    isPlayingRef.current = false;
    setIsPlayingAudio(false);
    setActiveSpeechIdx(null);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Play dialogue conversation audibly
  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    if (!selectedCall || !selectedCall.transcript || selectedCall.transcript.length === 0) {
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech audio playback is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);
    isPlayingRef.current = true;

    const turns = selectedCall.transcript;
    let currentIdx = 0;

    const playNextTurn = () => {
      if (!isPlayingRef.current || currentIdx >= turns.length) {
        stopAudioPlayback();
        return;
      }

      setActiveSpeechIdx(currentIdx);
      const turn = turns[currentIdx];
      const isAgent = turn.speaker.includes('Ava') || turn.speaker.includes('AI');

      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = isAgent ? 1.05 : 0.95;
      utterance.pitch = isAgent ? 1.1 : 0.95;

      utterance.onend = () => {
        currentIdx++;
        setTimeout(playNextTurn, 400);
      };

      utterance.onerror = () => {
        currentIdx++;
        setTimeout(playNextTurn, 200);
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    };

    playNextTurn();
  };

  // Filtered Calls list
  const filteredCalls = calls.filter((c) => {
    const matchesFilter = outcomeFilter === 'ALL' || c.outcome === outcomeFilter;
    const matchesSearch =
      !searchQuery ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.summary && c.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="glass-card p-6 border-slate-200 dark:border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> AI Voice Conversations &amp; Transcripts
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Live Call Intelligence, Audio Audits &amp; Transcripts
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Review conversational qualification logs, voicemail drops, Calendly booking links, and live transcripts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCalls()}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Refresh and sync newest calls from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Logs'}</span>
            </button>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search call logs by name or text..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Outcome Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-white/[0.06] text-xs">
          {[
            { id: 'ALL', label: `All Call Records (${calls.length})` },
            { id: 'MEETING_BOOKED', label: `Meetings Booked (${calls.filter((c) => c.outcome === 'MEETING_BOOKED').length})` },
            { id: 'HUMAN_HANDOFF', label: `Human Handoff (${calls.filter((c) => c.outcome === 'HUMAN_HANDOFF').length})` },
            { id: 'INTERESTED', label: `Interested Leads (${calls.filter((c) => c.outcome === 'INTERESTED').length})` },
            { id: 'RETRY_SCHEDULED', label: `Retry Queue (${calls.filter((c) => c.outcome === 'RETRY_SCHEDULED').length})` },
            { id: 'DND', label: `DND Opt-Out (${calls.filter((c) => c.outcome === 'DND').length})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setOutcomeFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                outcomeFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-white/[0.02] text-slate-600 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.04]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Call List & Detail Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Call Record List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredCalls.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
              <Headphones className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No calls match this filter</div>
              <p className="text-xs text-slate-500 mt-1">Start a call from the Leads tab or click &ldquo;All Call Records&rdquo;.</p>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const isSelected = selectedCall?.id === call.id;
              return (
                <div
                  key={call.id}
                  onClick={() => {
                    stopAudioPlayback();
                    setSelectedCall(call);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-white dark:bg-[#090d20] border-slate-200 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{call.contactName}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({call.companyName})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {call.phone} • {call.duration}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          call.outcome === 'MEETING_BOOKED'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : call.outcome === 'HUMAN_HANDOFF'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : call.outcome === 'DND'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : call.outcome === 'INTERESTED'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {call.outcome.replace('_', ' ')}
                      </span>

                      {call.calendlyStatus && call.calendlyStatus !== 'NONE' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          📅 {call.calendlyStatus === 'BOOKED' ? 'Calendly: Booked' : 'Calendly: Sent'}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-white/[0.02] p-2 rounded-lg mb-2 border border-slate-100 dark:border-white/[0.03]">
                    &ldquo;{call.summary}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                    <span>{call.timestamp}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      Inspect Transcript &rarr;
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Call Dossier & Full Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCall && (
            <>
              {/* Audio Player Simulator Card */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Audio Recording • {selectedCall.contactName} ({selectedCall.companyName})</span>
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Recorded: <strong className="text-slate-700 dark:text-slate-200">{selectedCall.timestamp}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong className="text-slate-700 dark:text-slate-200">{selectedCall.duration}</strong></span>
                      <span>•</span>
                      <span>Turns: <strong className="text-slate-700 dark:text-slate-200">{selectedCall.transcript.length} turns</strong></span>
                      {isPlayingAudio && activeSpeechIdx !== null && selectedCall.transcript[activeSpeechIdx] && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono animate-pulse">
                          • Playing Turn {activeSpeechIdx + 1} ({selectedCall.transcript[activeSpeechIdx].time})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={togglePlayAudio}
                    className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Stop Audio
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Play Audio
                      </>
                    )}
                  </button>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#060a18] border border-slate-200 dark:border-white/[0.04] flex items-center gap-1.5 justify-between mb-4">
                  {Array.from({ length: 42 }).map((_, i) => {
                    const waveHeight = isPlayingAudio
                      ? Math.max(14, (Math.sin(i * 0.5 + Date.now() * 0.002) * 20 + 22))
                      : Math.max(8, (i * 4) % 24);
                    return (
                      <div
                        key={i}
                        style={{ height: `${waveHeight}px` }}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlayingAudio ? 'bg-indigo-500 dark:bg-indigo-400 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* AI Summary & Next Best Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04]">
                    <div className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" /> AI Call Summary
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCall.summary}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" /> Recommended Next Action
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed font-medium">
                      {selectedCall.nextBestAction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Interactive Transcript Log */}
              <div className="glass-card p-5 border-slate-200 dark:border-white/[0.06] shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Timestamped Voice Transcript
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedCall.transcript.length} turns recorded
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 text-xs">
                  {selectedCall.transcript.map((msg, idx) => {
                    const isAgent = msg.speaker.includes('Ava') || msg.speaker.includes('AI');
                    const isActiveSpokenTurn = activeSpeechIdx === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 transition-all ${
                          isAgent ? 'justify-start' : 'justify-end'
                        } ${isActiveSpokenTurn ? 'scale-[1.01] brightness-110' : ''}`}
                      >
                        {isAgent && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-[11px] shadow-sm">
                            AI
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] p-3 rounded-2xl leading-relaxed border transition-all ${
                            isAgent
                              ? 'bg-slate-100 dark:bg-[#0f1536] border-slate-200 dark:border-indigo-500/30 text-slate-900 dark:text-slate-100 rounded-tl-none'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border-transparent'
                          } ${isActiveSpokenTurn ? 'ring-2 ring-indigo-400 shadow-lg' : ''}`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-semibold gap-3">
                            <span>{msg.speaker}</span>
                            <span className="flex items-center gap-1.5 font-mono">
                              <Clock className="w-2.5 h-2.5 opacity-60" />
                              <span>{msg.time}</span>
                              {msg.timestamp && <span className="opacity-60 font-sans">• {msg.timestamp}</span>}
                            </span>
                          </div>
                          <p>{msg.text}</p>
                        </div>

                        {!isAgent && (
                          <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white shrink-0 text-[11px] font-bold">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
