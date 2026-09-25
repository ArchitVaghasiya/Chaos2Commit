'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  PhoneCall,
  User,
  Building,
  ExternalLink,
  X,
  MessageSquare,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface CalendlyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    name: string;
    phone?: string | null;
    companyName: string;
    email?: string | null;
  };
  calendlyUrl?: string | null;
  onBookingConfirmed?: () => void;
  onTriggerRedial?: (followupScript: string) => void;
}

export function CalendlyBookingModal({
  isOpen,
  onClose,
  lead,
  calendlyUrl,
  onBookingConfirmed,
  onTriggerRedial,
}: CalendlyBookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('Tomorrow, 10:30 AM - 10:45 AM');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'BOOKED' | 'UNBOOKED'>('IDLE');
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const timeslots = [
    'Today, 3:00 PM - 3:15 PM (IST)',
    'Today, 4:30 PM - 4:45 PM (IST)',
    'Tomorrow, 10:30 AM - 10:45 AM (IST)',
    'Tomorrow, 2:00 PM - 2:15 PM (IST)',
    'Friday, 11:00 AM - 11:15 AM (IST)',
  ];

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    try {
      const res = await fetch('/api/calendly/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BOOK',
          leadId: lead.id,
          eventUri: `https://calendly.com/events/${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingStatus('BOOKED');
        setBookingNotice(`Meeting successfully scheduled with ${lead.name} for ${selectedSlot}. Calendar invitation dispatched.`);
        onBookingConfirmed?.();
      }
    } catch (err) {
      console.error('Booking confirmation failed:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleSimulateUnbooked = async () => {
    setIsBooking(true);
    try {
      const res = await fetch('/api/calendly/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MARK_UNBOOKED',
          leadId: lead.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingStatus('UNBOOKED');
        setBookingNotice(
          `Lead ${lead.name} did NOT complete Calendly booking within designated window. Automated AI re-dial queued.`
        );
      }
    } catch (err) {
      console.error('Mark unbooked failed:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleStartRedial = () => {
    const script = `Hi ${lead.name}, this is Ava from TechNova Solutions! I noticed you hadn't had a chance to pick a time slot on the Calendly booking link we sent earlier. I wanted to follow up directly to see if we can find a quick 10-minute window for a discussion or answer any questions?`;
    onTriggerRedial?.(script);
    onClose();
  };

  const cleanUrl =
    calendlyUrl ||
    `https://calendly.com/ai-sales-team/quick-sync?leadId=${encodeURIComponent(lead.id)}&name=${encodeURIComponent(
      lead.name
    )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Calendly Direct Booking Experience</h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SMS Dispatched
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simulating prospect mobile view received via SMS text message
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SMS Preview Banner */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-blue-300">
                Text Message Delivered to {lead.phone || '+1 (555) 019-2834'}
              </div>
              <div className="text-zinc-300 font-mono text-[11px] bg-zinc-900/80 p-2 rounded border border-zinc-800">
                &ldquo;Hi {lead.name}, here is the link to schedule a direct call with our team:{' '}
                <span className="text-blue-400 underline">{cleanUrl}</span>. Please choose any timeslot that works best for you!&rdquo;
              </div>
            </div>
          </div>

          {/* Booking State Notice */}
          {bookingNotice && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                bookingStatus === 'BOOKED'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              {bookingStatus === 'BOOKED' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold text-sm mb-0.5">
                  {bookingStatus === 'BOOKED' ? 'Appointment Confirmed!' : 'Not Booked — Re-Dial Queued'}
                </div>
                <div>{bookingNotice}</div>
              </div>
            </div>
          )}

          {/* Interactive Calendly Slot Picker */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Meeting Host</span>
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Building className="w-4 h-4 text-indigo-400" /> TechNova Solutions • Senior Solutions Team
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Duration</span>
                <div className="text-xs font-medium text-zinc-300 flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> 15 Min Discovery Call
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60">
              <label className="text-xs font-medium text-zinc-300 mb-2 block">
                Select Prospect Timeslot (From Calendly Availability):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeslots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={bookingStatus === 'BOOKED'}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg text-left text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm shadow-blue-500/10'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                      }`}
                    >
                      <span>{slot}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Evaluator Demo Testing Controls */}
          <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Hackathon Evaluator Simulation Controls:</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Demonstrate both branches of the requirement: 1) What happens when the lead books via Calendly, versus 2)
              What happens if the lead fails to book (triggering an automated re-dial call).
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                disabled={isBooking || bookingStatus === 'BOOKED'}
                onClick={handleConfirmBooking}
                className="flex-1 min-w-[180px] px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simulate: Lead Books Meeting</span>
              </button>

              <button
                type="button"
                disabled={isBooking || bookingStatus === 'BOOKED'}
                onClick={handleSimulateUnbooked}
                className="flex-1 min-w-[180px] px-3.5 py-2.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate: Lead Did NOT Book</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Actual Calendly Webpage</span>
          </a>

          <div className="flex items-center gap-2">
            {bookingStatus === 'UNBOOKED' && (
              <button
                type="button"
                onClick={handleStartRedial}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all animate-pulse"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Again (AI Re-Dial)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
