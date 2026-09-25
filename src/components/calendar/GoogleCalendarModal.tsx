'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  X,
  CheckCircle,
  Plus,
  RefreshCw,
  Building,
  User,
  Phone,
  Key,
  CalendarCheck,
  Sparkles,
  Download,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Info,
  CalendarDays,
} from 'lucide-react';
import { GOOGLE_CALENDAR_API_KEY, CalendarEventItem, generateGoogleCalendarUrl } from '@/lib/calendar/google-calendar';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: {
    id?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    companyName?: string;
  } | null;
}

export function GoogleCalendarModal({
  isOpen,
  onClose,
  initialLead,
}: GoogleCalendarModalProps) {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'GRID' | 'LIST' | 'EMBED'>('GRID');

  // Week offset for date navigation (0 = current week, 1 = next week, -1 = previous week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Person's Google Account / Calendar Owner Identifier
  const [calendarOwnerEmail, setCalendarOwnerEmail] = useState<string>('jayrajsinhbhatti9687@gmail.com');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Form state for creating a quick meeting by exact date and time
  const [leadName, setLeadName] = useState(initialLead?.name || 'Samantha Ross');
  const [companyName, setCompanyName] = useState(initialLead?.companyName || 'AeroPulse Global');
  
  // Default to today's date in YYYY-MM-DD
  const todayIso = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [meetingDate, setMeetingDate] = useState<string>(todayIso);
  const [meetingTime, setMeetingTime] = useState<string>('15:00');
  const [duration, setDuration] = useState<string>('30');
  const [topic, setTopic] = useState<string>('Enterprise SharePoint & Cloud Security Demo');

  useEffect(() => {
    if (initialLead) {
      if (initialLead.name) setLeadName(initialLead.name);
      if (initialLead.companyName) setCompanyName(initialLead.companyName);
    }
  }, [initialLead]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calendar/events');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  // Compute 7 days for the currently selected week by exact date
  const weekDays = useMemo(() => {
    const baseDate = new Date();
    // Monday as start of week
    const currentDay = baseDate.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === new Date().toDateString();
      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      return {
        date: d,
        isoDate,
        dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayLong: d.toLocaleDateString('en-US', { weekday: 'long' }),
        dateNumber: d.getDate(),
        monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        isToday,
      };
    });
  }, [weekOffset]);

  // Calculate week range display string: e.g. "Sep 21 – Sep 27, 2026"
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return '';
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.monthShort === end.monthShort) {
      return `${start.monthShort} ${start.dateNumber} – ${end.dateNumber}, ${end.year}`;
    }
    return `${start.monthShort} ${start.dateNumber} – ${end.monthShort} ${end.dateNumber}, ${end.year}`;
  }, [weekDays]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Build exact timestamp
      const exactTimeStr = `${meetingDate}T${meetingTime || '15:00'}:00`;
      const targetDate = new Date(exactTimeStr);

      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: initialLead?.id,
          leadName,
          companyName,
          meetingTime: targetDate.toISOString(),
          durationMinutes: parseInt(duration, 10) || 30,
          topic,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const formattedDisplay = targetDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        setNotice(
          `Meeting booked for ${formattedDisplay} at ${meetingTime}! Assigned to ${calendarOwnerEmail}'s Google Calendar.`
        );
        await fetchEvents();

        // If the booked date is outside current week view, auto-adjust weekOffset so it's immediately visible
        const today = new Date();
        const curMon = new Date(today);
        const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
        curMon.setDate(today.getDate() + diff);
        curMon.setHours(0, 0, 0, 0);

        const diffWeeks = Math.floor((targetDate.getTime() - curMon.getTime()) / (7 * 24 * 3600 * 1000));
        setWeekOffset(diffWeeks);

        setTimeout(() => setNotice(null), 6000);
      }
    } catch (err) {
      console.error('Failed to create meeting on Google Calendar:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Header with API Key & Account Owner */}
        <div className="p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-[#0d142c] to-zinc-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">Google Calendar of Key Owner</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  API Key Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-semibold">
                  Google Calendar v3
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-semibold">
                  Exact Date Mode
                </span>
              </div>

              {/* API Key & Calendar Account Target */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800">
                  <Key className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Key: {GOOGLE_CALENDAR_API_KEY.substring(0, 15)}...{GOOGLE_CALENDAR_API_KEY.slice(-6)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800">
                  <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Target Account:</span>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="email"
                        value={calendarOwnerEmail}
                        onChange={(e) => setCalendarOwnerEmail(e.target.value)}
                        className="bg-black border border-indigo-500/60 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(false)}
                        className="px-1.5 py-0.5 bg-indigo-600 rounded text-[10px] font-bold text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="font-semibold text-indigo-300 hover:text-white underline cursor-pointer"
                      title="Click to edit recipient Google account"
                    >
                      {calendarOwnerEmail}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchEvents}
              title="Refresh Calendar Events"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reassurance & Account Synchronization Banner */}
        <div className="px-5 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Calendar Account:</strong> Meetings are assigned to{' '}
              <span className="text-white underline font-semibold">{calendarOwnerEmail}</span> by exact date & time.
              Click &ldquo;Add to Jayrajsinh&apos;s Calendar&rdquo; on any event to immediately open in Google Calendar.
            </span>
          </div>

          <a
            href="https://calendar.google.com/calendar/u/0/r"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0 shadow-sm"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open Jayrajsinh&apos;s Google Calendar</span>
          </a>
        </div>

        {/* View Switcher Tabs Bar */}
        <div className="px-5 py-2 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveViewTab('GRID')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'GRID'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Exact Date Calendar Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('LIST')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'LIST'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>All Scheduled Meetings ({events.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab('EMBED')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'EMBED'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Calendar Live Web View</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Autonomous Booking Active &bull; Zero Human Clicks Needed</span>
          </div>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className="p-3 bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{notice}</span>
            </div>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: EXACT-DATE CALENDAR MATRIX */}
          {activeViewTab === 'GRID' && (
            <div className="space-y-4">
              {/* Week Navigation Controls */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((prev) => prev - 1)}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Previous Week"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev Week</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      weekOffset === 0
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    This Week (Today)
                  </button>

                  <button
                    type="button"
                    onClick={() => setWeekOffset((prev) => prev + 1)}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Next Week"
                  >
                    <span className="hidden sm:inline">Next Week</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-end gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{weekRangeLabel}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Events mapped strictly by calendar date &bull; No day ambiguity
                  </div>
                </div>
              </div>

              {/* 7-Day Exact Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5">
                {weekDays.map((day) => {
                  // Strictly match events by EXACT year, month, and date
                  const matchingEvents = events.filter((e) => {
                    const d = new Date(e.startTime);
                    return (
                      d.getFullYear() === day.year &&
                      d.getMonth() === day.date.getMonth() &&
                      d.getDate() === day.dateNumber
                    );
                  });

                  return (
                    <div
                      key={day.isoDate}
                      className={`p-3 rounded-2xl flex flex-col justify-between min-h-[240px] transition-all border ${
                        day.isToday
                          ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {/* Column Header with EXACT DATE */}
                      <div className="border-b border-zinc-800/80 pb-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-300">{day.dayShort}</span>
                          {day.isToday && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-base font-extrabold text-white">
                            {day.dateNumber}{' '}
                            <span className="text-xs font-medium text-zinc-400">{day.monthShort}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {matchingEvents.length > 0 ? `${matchingEvents.length} mtg` : '0'}
                          </span>
                        </div>
                      </div>

                      {/* Day's Event Slots */}
                      <div className="flex-1 space-y-2">
                        {matchingEvents.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-[10px] text-zinc-600 text-center italic py-6">
                            No meetings
                          </div>
                        ) : (
                          matchingEvents.map((evt) => {
                            const evtDate = new Date(evt.startTime);
                            const timeStr = evtDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            });

                            const directUrl = generateGoogleCalendarUrl({
                              title: evt.title,
                              description: evt.description,
                              startTime: new Date(evt.startTime),
                              endTime: new Date(evt.endTime),
                              targetEmail: calendarOwnerEmail,
                            });

                            return (
                              <div
                                key={evt.id}
                                className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-950/80 to-blue-950/80 border border-indigo-500/50 text-xs shadow-md space-y-1.5 group hover:border-indigo-400 transition-all"
                              >
                                <div className="font-bold text-[11px] text-white flex items-center justify-between">
                                  <span className="truncate">{evt.leadName}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                </div>
                                <div className="text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-indigo-400" />
                                  <span>{timeStr}</span>
                                  <span className="text-zinc-500 font-sans">({evt.durationMinutes || 30}m)</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate">
                                  {evt.companyName || 'Enterprise Lead'}
                                </div>

                                <div className="pt-1.5 border-t border-indigo-500/30 flex items-center gap-1">
                                  <a
                                    href={directUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center py-1 rounded bg-indigo-600/40 hover:bg-indigo-600 text-[10px] font-bold text-indigo-200 hover:text-white transition-all flex items-center justify-center gap-1"
                                    title={`Add directly to ${calendarOwnerEmail}'s Google Calendar`}
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Add
                                  </a>
                                  <a
                                    href={`/api/calendar/ics?id=${encodeURIComponent(evt.id)}`}
                                    download
                                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-all"
                                    title="Download .ics for Google Calendar"
                                  >
                                    <Download className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instant Meeting Booking Form on Grid Tab with EXACT DATE PICKER */}
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Instant Schedule by Exact Date &amp; Time
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Directly synced with Google Calendar of <strong className="text-zinc-200">{calendarOwnerEmail}</strong>
                  </span>
                </div>

                <form onSubmit={handleCreateMeeting} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-semibold">Lead Name</label>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Lead Name"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-semibold">Company</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* EXACT CALENDAR DATE PICKER */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-indigo-300 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Exact Date
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-indigo-500/50 text-xs text-white focus:outline-none focus:border-indigo-400"
                      required
                    />
                  </div>

                  {/* EXACT TIME PICKER */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-indigo-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-indigo-500/50 text-xs text-white focus:outline-none focus:border-indigo-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-semibold">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
                    >
                      {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Book on Calendar</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED MEETINGS LIST & 1-CLICK SYNC */}
          {activeViewTab === 'LIST' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Confirmed Meetings ({events.length}) &bull; Ready to Sync
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click &ldquo;Add to Jayrajsinh&apos;s Google Calendar&rdquo; on any meeting below to open Google Calendar with all details pre-filled.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {events.map((evt) => {
                  const startD = new Date(evt.startTime);
                  const exactDateStr = startD.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const timeStr = startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  const directUrl = generateGoogleCalendarUrl({
                    title: evt.title,
                    description: evt.description,
                    startTime: new Date(evt.startTime),
                    endTime: new Date(evt.endTime),
                    targetEmail: calendarOwnerEmail,
                  });

                  return (
                    <div
                      key={evt.id}
                      className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          <span>{evt.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Confirmed
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3">
                          <span className="text-indigo-400 font-bold flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                            <Calendar className="w-3.5 h-3.5" /> {exactDateStr}
                          </span>
                          <span className="text-cyan-300 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {timeStr} ({evt.durationMinutes || 30} min)
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-zinc-500" /> {evt.leadName}
                          </span>
                          {evt.companyName && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-zinc-500" /> {evt.companyName}
                              </span>
                            </>
                          )}
                          {evt.leadPhone && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-zinc-500" /> {evt.leadPhone}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-500 font-mono">
                          Assigned to: <strong className="text-zinc-300">{calendarOwnerEmail}</strong> &bull; API Key: {GOOGLE_CALENDAR_API_KEY.substring(0, 14)}...
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Add to Jayrajsinh&apos;s Google Calendar</span>
                        </a>

                        <a
                          href={`/api/calendar/ics?id=${encodeURIComponent(evt.id)}`}
                          download
                          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-all border border-zinc-700"
                          title="Download iCalendar (.ics) file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.ics</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE GOOGLE CALENDAR EMBED VIEW */}
          {activeViewTab === 'EMBED' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Google Calendar Live Web Interface
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Direct access to Google Calendar with your configured API key credentials.
                  </p>
                </div>

                <a
                  href={`https://calendar.google.com/calendar/u/0/r`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Google Calendar in New Tab</span>
                </a>
              </div>

              {/* Embedded Google Calendar Web Frame */}
              <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-zinc-800 bg-white">
                <iframe
                  src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
                    calendarOwnerEmail
                  )}&ctz=America%2FNew_York&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0`}
                  style={{ border: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="Google Calendar Embed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-center justify-between">
                <span>
                  Viewing calendar for <strong>{calendarOwnerEmail}</strong>. Google Calendar displays public or shared events directly in the frame above.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('GRID')}
                  className="underline font-bold text-white cursor-pointer ml-2"
                >
                  Back to Date Matrix
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Calendar &bull; Person&apos;s API Key: {GOOGLE_CALENDAR_API_KEY}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
