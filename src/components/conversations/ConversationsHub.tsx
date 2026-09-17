'use client';

import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';

interface CallRecord {
  id: string;
  contactName: string;
  companyName: string;
  phone: string;
  duration: string;
  status: 'CONNECTED' | 'VOICEMAIL' | 'RETRY_SCHEDULED';
  outcome: 'INTERESTED' | 'MEETING_BOOKED' | 'VOICEMAIL_LEFT' | 'RETRY_SCHEDULED';
  timestamp: string;
  summary: string;
  nextBestAction: string;
  transcript: { speaker: string; text: string; time: string }[];
}

const SAMPLE_CALL_RECORDS: CallRecord[] = [
  {
    id: 'call-1',
    contactName: 'John Smith',
    companyName: 'TechNova Solutions',
    phone: '+1 (555) 123-4567',
    duration: '2m 45s',
    status: 'CONNECTED',
    outcome: 'MEETING_BOOKED',
    timestamp: 'Today, 2:15 PM',
    summary: 'Qualified: 150-user Microsoft 365 & SharePoint rollout planned for next quarter. Budget approved, John is the CTO and decision maker.',
    nextBestAction: 'Send SharePoint case study, confirm Thursday 3 PM demo with solutions lead.',
    transcript: [
      { speaker: 'Ava (AI)', text: "Hello John, I'm Ava from TechNova Solutions. I'm calling about your public Microsoft 365 & SharePoint automation requirement.", time: '00:02' },
      { speaker: 'John Smith', text: "Yes – we need a partner for SharePoint and workflow automation. What's your experience?", time: '00:14' },
      { speaker: 'Ava (AI)', text: "We specialize in enterprise SharePoint migrations and workflow automation. What timeline and team size are you planning for?", time: '00:26' },
      { speaker: 'John Smith', text: "Next quarter, around 150 users. Can we set up a call with your solutions team?", time: '00:41' },
      { speaker: 'Ava (AI)', text: "Absolutely! I have booked Thursday at 3 PM with our solutions lead. A confirmation email and calendar invite has been sent to your inbox.", time: '00:58' }
    ]
  },
  {
    id: 'call-2',
    contactName: 'Priya Nair',
    companyName: 'CloudTech Inc.',
    phone: '+1 (555) 872-9012',
    duration: '0m 48s',
    status: 'VOICEMAIL',
    outcome: 'VOICEMAIL_LEFT',
    timestamp: 'Today, 1:40 PM',
    summary: 'Reached voicemail greeting after 4 rings. Delivered customized AI audio message highlighting CRM migration tool consolidation.',
    nextBestAction: 'Automated follow-up email dispatched; scheduled 2nd call retry for tomorrow at 10:30 AM EST.',
    transcript: [
      { speaker: 'Ava (AI)', text: "Hi Priya, this is Ava following up on your CRM workflow inquiry. I have dropped a quick overview to your email. Look forward to connecting!", time: '00:08' }
    ]
  },
  {
    id: 'call-3',
    contactName: 'Marc Weber',
    companyName: 'DataSystems GmbH',
    phone: '+49 30 9182345',
    duration: '1m 55s',
    status: 'CONNECTED',
    outcome: 'INTERESTED',
    timestamp: 'Yesterday, 4:10 PM',
    summary: 'Confirmed active public RFP for Snowflake and cloud data warehouse modernization. Requested pricing and references.',
    nextBestAction: 'Share data engineering whitepaper and coordinate with EMEA account executive.',
    transcript: [
      { speaker: 'Ava (AI)', text: "Guten Tag Herr Weber, Ava here regarding your Snowflake modernization RFP. Are you accepting vendor submissions?", time: '00:05' },
      { speaker: 'Marc Weber', text: "Yes, we are reviewing proposals until the 15th. Please send your documentation over.", time: '00:22' },
      { speaker: 'Ava (AI)', text: "Wonderful, sending our certified partner credentials and case studies right away.", time: '00:35' }
    ]
  }
];

export default function ConversationsHub() {
  const [selectedCall, setSelectedCall] = useState<CallRecord>(SAMPLE_CALL_RECORDS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = SAMPLE_CALL_RECORDS.filter(c => {
    const matchesFilter = outcomeFilter === 'ALL' || c.outcome === outcomeFilter;
    const matchesSearch = !searchQuery ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="glass-card p-6 border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> AI Voice Conversations &amp; Transcripts
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Live Call Intelligence, Audio Audits &amp; Transcripts
            </h2>
            <p className="text-xs text-slate-400">
              Review conversational qualification logs, voicemail drops, retry schedules, and next-best actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search call logs..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#090d1f] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Outcome Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06] text-xs">
          {[
            { id: 'ALL', label: 'All Call Records' },
            { id: 'MEETING_BOOKED', label: 'Meetings Booked' },
            { id: 'INTERESTED', label: 'Interested Leads' },
            { id: 'VOICEMAIL_LEFT', label: 'Voicemails Left' },
            { id: 'RETRY_SCHEDULED', label: 'Retry Queue' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setOutcomeFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                outcomeFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/[0.04]'
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
        <div className="lg:col-span-5 space-y-3">
          {filteredCalls.map((call) => {
            const isSelected = call.id === selectedCall.id;
            return (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-[#090d20] border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {call.contactName}
                      <span className="text-[10px] text-slate-400 font-normal">({call.companyName})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{call.phone} • {call.duration}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      call.outcome === 'MEETING_BOOKED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : call.outcome === 'INTERESTED'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}
                  >
                    {call.outcome.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 bg-white/[0.02] p-2 rounded-lg mb-2">
                  &quot;{call.summary}&quot;
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/[0.04]">
                  <span>{call.timestamp}</span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    Inspect Transcript &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Call Dossier & Full Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audio Player Simulator Card */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Audio Recording • {selectedCall.contactName} ({selectedCall.companyName})
                </h3>
                <div className="text-[11px] text-slate-400">Recorded: {selectedCall.timestamp} • Duration: {selectedCall.duration}</div>
              </div>

              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Audio
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Play Audio
                  </>
                )}
              </button>
            </div>

            {/* Fake Waveform Visualizer */}
            <div className="p-3 rounded-xl bg-[#060a18] border border-white/[0.04] flex items-center gap-1.5 justify-between mb-4">
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: isPlayingAudio ? `${Math.max(15, (i * 7) % 36)}px` : `${Math.max(8, (i * 4) % 24)}px`
                  }}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'bg-indigo-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* AI Summary & Next Best Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[10px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> AI Call Summary
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedCall.summary}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="text-[10px] font-bold uppercase text-emerald-400 mb-1 flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3" /> Recommended Next Action
                </div>
                <p className="text-emerald-300 leading-relaxed font-medium">{selectedCall.nextBestAction}</p>
              </div>
            </div>
          </div>

          {/* Full Interactive Transcript Log */}
          <div className="glass-card p-5 border-white/[0.06] shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 pb-2 border-b border-white/[0.06]">
              Timestamped Voice Transcript
            </h3>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 text-xs">
              {selectedCall.transcript.map((msg, idx) => {
                const isAgent = msg.speaker.includes('Ava') || msg.speaker.includes('AI');
                return (
                  <div key={idx} className={`flex items-start gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}>
                    {isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-[11px]">
                        AI
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                        isAgent
                          ? 'bg-[#0f1536] border border-indigo-500/30 text-slate-100 rounded-tl-none'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-semibold">
                        <span>{msg.speaker}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>

                    {!isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 text-[11px] font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
