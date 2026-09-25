'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  PhoneOff,
  PhoneCall,
  Calendar,
  Sparkles,
  Bot,
  User,
  Clock,
  Globe2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  PhoneForwarded,
  Mic,
  MicOff,
  Send,
  Volume2,
  UserCheck,
  PhoneMissed,
  ShieldCheck,
  Radio,
  Zap,
  Minimize2,
  MessageSquare,
} from 'lucide-react';
import { CalendlyBookingModal } from './CalendlyBookingModal';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import {
  SupportedLanguage,
  getTranslation,
  getLocaleForVoice,
  getAiGreeting,
  getQuickReplies,
} from '@/lib/i18n/translations';

export const formatCallTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const remaining = secs % 60;
  return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
};

interface Message {
  speaker: 'agent' | 'prospect' | 'system';
  text: string;
  time?: string;
  timestamp: string;
  offsetSeconds?: number;
}

interface TwilioDiagnostics {
  isConfigured: boolean;
  account?: {
    sid: string;
    friendlyName: string;
    status: string;
    type: string;
    isTrial: boolean;
  };
  envPhoneNumber: string;
  isEnvPhoneOwned: boolean;
  ownedNumbers: { phoneNumber: string; sid: string; friendlyName: string }[];
  verifiedNumbers: { phoneNumber: string; friendlyName: string; sid: string }[];
  targetPhone: string;
  isTargetVerified: boolean;
  needsTwilioNumber: boolean;
  needsTargetVerification: boolean;
  isReady: boolean;
  publicWebhookUrl?: string | null;
  actionSteps?: { step: number; title: string; detail: string; link?: string; completed: boolean }[];
  error?: string;
}

interface LiveCallSimulatorModalProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onMeetingBookedSuccess?: () => void;
  defaultLanguage?: string;
}

export default function LiveCallSimulatorModal({
  lead,
  isOpen,
  onClose,
  onMinimize,
  onMeetingBookedSuccess,
  defaultLanguage = 'English',
}: LiveCallSimulatorModalProps) {
  // Mode Selection: Browser Live AI Call (Demo) vs Real Twilio Mobile Call
  const [telephonyMode, setTelephonyMode] = useState<'BROWSER_SIM' | 'TWILIO_PSTN'>('BROWSER_SIM');

  // Shared Core State
  const [phoneNumber, setPhoneNumber] = useState(lead?.phone || '+91 9737362307');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (defaultLanguage as SupportedLanguage) || 'English'
  );
  const [callStatus, setCallStatus] = useState<'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);

  // Browser Simulator Speech & Input State
  const [inputText, setInputText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  // Real-Time AI Intelligence State
  const [currentSentiment, setCurrentSentiment] = useState<'POSITIVE' | 'NEUTRAL' | 'HESITANT' | 'OBJECTION' | 'NEGATIVE'>('POSITIVE');
  const [callSummary, setCallSummary] = useState(
    'Awaiting phone call connection to evaluate requirement fit, timeline, and decision maker authority...'
  );
  const [nextBestAction, setNextBestAction] = useState(
    'Qualify enterprise rollout scale and propose solutions demo.'
  );
  const [isMeetingBooked, setIsMeetingBooked] = useState(false);
  const [isNegativeDnd, setIsNegativeDnd] = useState(false);
  const [isHumanHandoff, setIsHumanHandoff] = useState(false);
  const [isCallbackScheduled, setIsCallbackScheduled] = useState(false);

  // Calendly Tracking & Human Handoff SMS State
  const [calendlyLinkSent, setCalendlyLinkSent] = useState((lead as any)?.calendlyLinkSent || false);
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [calendlyStatus, setCalendlyStatus] = useState<'NONE' | 'LINK_SENT' | 'BOOKED' | 'NOT_BOOKED'>(
    (lead as any)?.calendlyStatus || 'NONE'
  );
  const [showCalendlyModal, setShowCalendlyModal] = useState(false);
  const [isSendingCalendlySms, setIsSendingCalendlySms] = useState(false);

  // Twilio Specific State
  const [twilioSid, setTwilioSid] = useState<string | null>(null);
  const [isDialingTwilio, setIsDialingTwilio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trialNotice, setTrialNotice] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<TwilioDiagnostics | null>(null);
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false);
  const [newTwilioNumberInput, setNewTwilioNumberInput] = useState('');
  const [isSavingTwilioNumber, setIsSavingTwilioNumber] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

  // Refs for audio & speech recognition
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesRef = useRef<Message[]>([]);
  const callStatusRef = useRef(callStatus);
  const durationRef = useRef(duration);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  // Auto-scroll transcript
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  // Duration timer when connected
  useEffect(() => {
    if (callStatus === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Stop any ongoing SpeechSynthesis
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setIsAiSpeaking(false);
  }, []);

  // Text-To-Speech function using Web Speech API with language locale
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLocale = getLocaleForVoice(selectedLanguage);
        utterance.lang = targetLocale;
        utterance.rate = 1.05;
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
        utterance.onend = () => {
          setIsAiSpeaking(false);
          if (onEnd) onEnd();
        };
        utterance.onerror = (e) => {
          if ((e as any)?.error !== 'canceled' && (e as any)?.error !== 'interrupted') {
            console.warn('SpeechSynthesis error event:', (e as any)?.error);
          }
          setIsAiSpeaking(false);
          if (onEnd) onEnd();
        };

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
        setIsAiSpeaking(false);
        if (onEnd) onEnd();
      }
    },
    [selectedLanguage]
  );

  // Initialize Speech Recognition for Hands-Free Microphone
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLocaleForVoice(selectedLanguage);

      recognition.onstart = () => {
        setIsMicListening(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult.isFinal) {
          handleSendMessage(transcript);
          setSpeechTranscript('');
        }
      };

      recognition.onerror = () => {
        setIsMicListening(false);
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [selectedLanguage]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type or use quick chips.');
      return;
    }
    if (isMicListening) {
      recognitionRef.current.stop();
      setIsMicListening(false);
    } else {
      stopSpeech();
      try {
        recognitionRef.current.lang = getLocaleForVoice(selectedLanguage);
        recognitionRef.current.start();
      } catch (_) {}
    }
  };

  // Check Twilio diagnostics
  const checkDiagnostics = async (target: string) => {
    setIsCheckingDiagnostics(true);
    try {
      const res = await fetch(`/api/voice/twilio/diagnostics?targetPhone=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
        if (data.ownedNumbers && data.ownedNumbers.length > 0 && !data.isEnvPhoneOwned) {
          setNewTwilioNumberInput(data.ownedNumbers[0].phoneNumber);
        }
      }
    } catch (err) {
      console.warn('Diagnostics check error:', err);
    } finally {
      setIsCheckingDiagnostics(false);
    }
  };

  // Reset & load on modal open
  useEffect(() => {
    if (isOpen && lead) {
      const initialTarget = lead.phone || '+91 9737362307';
      setPhoneNumber(initialTarget);
      setDuration(0);
      setMessages([]);
      setErrorMessage(null);
      setTrialNotice(null);
      setIsMeetingBooked(false);
      setIsNegativeDnd(false);
      setIsHumanHandoff(false);
      setIsCallbackScheduled(false);
      setCallSummary('Evaluating requirement fit, timeline, and decision maker authority...');
      setNextBestAction('Qualify company rollout scale and propose solutions demo.');
      setTelephonyMode('BROWSER_SIM');

      // Detect language from lead
      let detectedLang: SupportedLanguage = 'English';
      if (lead.preferredLanguage) {
        const p = lead.preferredLanguage.toLowerCase();
        if (p.includes('deutsch') || p.includes('german')) detectedLang = 'Deutsch';
        else if (p.includes('español') || p.includes('spanish')) detectedLang = 'Español';
        else if (p.includes('français') || p.includes('french')) detectedLang = 'Français';
        else if (p.includes('हिन्दी') || p.includes('hindi')) detectedLang = 'हिन्दी';
        else if (p.includes('ગુજરાતી') || p.includes('gujarati')) detectedLang = 'ગુજરાતી';
        else if (p.includes('العربية') || p.includes('arabic')) detectedLang = 'العربية';
      }
      setSelectedLanguage(detectedLang);

      // Start Browser Call Simulation immediately
      startBrowserCallSimulation(detectedLang);

      // Check Twilio diagnostics in background
      checkDiagnostics(initialTarget);
    } else {
      stopSpeech();
      setCallStatus('IDLE');
    }
    return () => {
      stopSpeech();
    };
  }, [isOpen, lead?.id]);

  // Start in-browser simulated call
  const startBrowserCallSimulation = (lang: SupportedLanguage) => {
    if (!lead) return;
    setCallStatus('DIALING');
    setMessages([
      {
        speaker: 'system',
        text: `Initiating autonomous AI outbound call to ${lead.name} (${lead.companyName})...`,
        time: '00:00',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offsetSeconds: 0,
      },
    ]);

    setTimeout(() => {
      setCallStatus('RINGING');
      setMessages((prev) => [
        ...prev,
        {
          speaker: 'system',
          text: `Ringing prospect line (${lead.phone || '+91 9737362307'})...`,
          time: '00:00',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          offsetSeconds: 0,
        },
      ]);

      setTimeout(() => {
        setCallStatus('CONNECTED');
        const firstName = lead.name.split(' ')[0] || 'there';
        const requirement = lead.originalPostSnippet
          ? lead.originalPostSnippet.substring(0, 45) + '...'
          : 'your Microsoft 365 & SharePoint requirements';

        const greeting = getAiGreeting(lang, firstName, lead.companyName, requirement);

        setMessages((prev) => [
          ...prev,
          {
            speaker: 'system',
            text: `Call Connected • Two-Way Live Audio Active (${lang})`,
            time: '00:00',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            offsetSeconds: 0,
          },
          {
            speaker: 'agent',
            text: greeting,
            time: '00:02',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            offsetSeconds: 2,
          },
        ]);

        speakText(greeting, () => {
          if (recognitionRef.current && callStatusRef.current === 'CONNECTED') {
            try {
              recognitionRef.current.lang = getLocaleForVoice(lang);
              recognitionRef.current.start();
            } catch (_) {}
          }
        });
      }, 1200);
    }, 800);
  };

  // Poll Twilio call status if using Twilio mode
  useEffect(() => {
    if (!isOpen || telephonyMode !== 'TWILIO_PSTN' || !twilioSid || callStatus === 'ENDED') return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/voice/twilio/status?callSid=${encodeURIComponent(twilioSid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.status === 'in-progress' || data.status === 'answered' || data.status === 'CONNECTED') {
              setCallStatus('CONNECTED');
            } else if (data.status === 'ringing') {
              setCallStatus('RINGING');
            } else if (data.status === 'completed' || data.status === 'failed' || data.status === 'canceled') {
              setCallStatus('ENDED');
            }

            if (typeof data.durationSeconds === 'number' && data.durationSeconds > 0) {
              setDuration(data.durationSeconds);
            }

            if (data.sentiment) setCurrentSentiment(data.sentiment);
            if (data.callSummary) setCallSummary(data.callSummary);
            if (data.nextBestAction) setNextBestAction(data.nextBestAction);

            if (data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
              setMessages(data.transcript);
            }

            if (data.outcome === 'MEETING_BOOKED') {
              setIsMeetingBooked(true);
              onMeetingBookedSuccess?.();
            } else if (data.outcome === 'DO_NOT_CALL') {
              setIsNegativeDnd(true);
            }
          }
        }
      } catch (_) {}
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [isOpen, telephonyMode, twilioSid, callStatus, onMeetingBookedSuccess]);

  // Handle Prospect Speech / User Message in Browser Simulator
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isAiThinking) return;

    stopSpeech();
    setInputText('');

    const currentOffset = durationRef.current;
    const prospectMsg: Message = {
      speaker: 'prospect',
      text,
      time: formatCallTime(currentOffset),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offsetSeconds: currentOffset,
    };

    const nextMessages = [...messagesRef.current, prospectMsg];
    setMessages(nextMessages);
    setIsAiThinking(true);

    try {
      const historyPayload = nextMessages
        .filter((m) => m.speaker === 'agent' || m.speaker === 'prospect')
        .map((m) => ({
          role: m.speaker === 'agent' ? 'assistant' : 'user',
          content: m.text,
        }));

      const res = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          prospectSpeech: text,
          messages: historyPayload,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const agentOffset = durationRef.current;
        const agentMsg: Message = {
          speaker: 'agent',
          text: data.reply,
          time: formatCallTime(agentOffset),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          offsetSeconds: agentOffset,
        };
        setMessages((prev) => [...prev, agentMsg]);

        if (data.sentiment) setCurrentSentiment(data.sentiment);
        if (data.summary) setCallSummary(data.summary);
        if (data.nextBestAction) setNextBestAction(data.nextBestAction);

        if (data.meetingBooked) {
          setIsMeetingBooked(true);
          onMeetingBookedSuccess?.();
        }
        if (data.isNegativeDnd) {
          setIsNegativeDnd(true);
        }
        if (data.isHumanHandoff || data.calendlyLinkSent) {
          setIsHumanHandoff(true);
          setCalendlyLinkSent(true);
          if (data.calendlyUrl) setCalendlyUrl(data.calendlyUrl);
          setCalendlyStatus('LINK_SENT');
          const smsOffset = durationRef.current;
          setMessages((prev) => [
            ...prev,
            {
              speaker: 'system',
              text: `📱 SMS Dispatched: Calendly direct booking link sent to ${lead?.phone || phoneNumber}. Tracking appointment status...`,
              time: formatCallTime(smsOffset),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              offsetSeconds: smsOffset,
            },
          ]);
        }
        if (data.isCallbackRequested) {
          setIsCallbackScheduled(true);
        }

        speakText(data.reply, () => {
          if (recognitionRef.current && callStatusRef.current === 'CONNECTED') {
            try {
              recognitionRef.current.lang = getLocaleForVoice(selectedLanguage);
              recognitionRef.current.start();
            } catch (_) {}
          }
        });
      }
    } catch (err) {
      console.error('Call dialogue turn error:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Manual Dispatch of Calendly SMS
  const handleSendCalendlySmsManually = async () => {
    if (!lead) return;
    setIsSendingCalendlySms(true);
    try {
      const res = await fetch('/api/calendly/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_SMS',
          leadId: lead.id,
          phone: phoneNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCalendlyLinkSent(true);
        setCalendlyUrl(data.calendlyUrl);
        setCalendlyStatus('LINK_SENT');
        const manualSmsOffset = durationRef.current;
        setMessages((prev) => [
          ...prev,
          {
            speaker: 'system',
            text: `📱 SMS Sent: Calendly meeting booking link dispatched to ${phoneNumber}. Tracking appointment status...`,
            time: formatCallTime(manualSmsOffset),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            offsetSeconds: manualSmsOffset,
          },
        ]);
        speakText('I have just sent a text message with our Calendly booking link to your phone.');
      }
    } catch (e) {
      console.error('Manual Calendly SMS failed:', e);
    } finally {
      setIsSendingCalendlySms(false);
    }
  };

  // Trigger AI Re-Dial when Lead Has Not Booked via Calendly
  const handleTriggerRedial = (script: string) => {
    setCallStatus('CONNECTED');
    setCalendlyStatus('NOT_BOOKED');
    setMessages((prev) => [
      ...prev,
      {
        speaker: 'system',
        text: `🔄 Automated AI Re-Dial Initiated • Lead had not completed Calendly booking`,
        time: '00:00',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offsetSeconds: 0,
      },
      {
        speaker: 'agent',
        text: script,
        time: '00:02',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offsetSeconds: 2,
      },
    ]);
    speakText(script);
  };

  // Handle Hanging Up and Persisting Completed Conversation
  const handleHangup = async () => {
    stopSpeech();
    if (telephonyMode === 'TWILIO_PSTN' && twilioSid) {
      try {
        await fetch('/api/voice/twilio/hangup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callSid: twilioSid }),
        });
      } catch (_) {}
    }

    setCallStatus('ENDED');
    const finalDuration = durationRef.current || duration || 0;
    const endMsg: Message = {
      speaker: 'system',
      text: `Call ended. Final duration: ${formatCallTime(finalDuration)}. Conversation saved to Live Call Intelligence & Transcripts.`,
      time: formatCallTime(finalDuration),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offsetSeconds: finalDuration,
    };

    setMessages((prev) => [...prev, endMsg]);

    // Persist conversation to /api/conversations so it immediately appears in the Conversations tab!
    const dialogueTurns = messagesRef.current.filter((m) => m.speaker === 'agent' || m.speaker === 'prospect');
    if (dialogueTurns.length > 0) {
      try {
        const payload = {
          leadId: lead?.id,
          leadName: lead?.name || 'Prospect',
          companyName: lead?.companyName || 'Enterprise Partner',
          phone: lead?.phone || phoneNumber,
          durationSeconds: Math.max(15, finalDuration),
          messages: dialogueTurns,
          summary: callSummary,
          nextBestAction: nextBestAction,
          outcome: isMeetingBooked
            ? 'MEETING_BOOKED'
            : isNegativeDnd
            ? 'DND'
            : isHumanHandoff
            ? 'HUMAN_HANDOFF'
            : isCallbackScheduled
            ? 'RETRY_SCHEDULED'
            : 'INTERESTED',
          sentiment: currentSentiment,
          language: selectedLanguage,
          calendlyLinkSent,
          calendlyUrl,
        };

        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('call-completed', { detail: data.call }));
          }
        }
      } catch (saveErr) {
        console.warn('Failed to save finalized conversation:', saveErr);
      }
    }
  };

  // Re-start / Re-dial in Browser
  const handleRestartCall = () => {
    stopSpeech();
    setDuration(0);
    setMessages([]);
    setIsMeetingBooked(false);
    setIsNegativeDnd(false);
    setIsHumanHandoff(false);
    setIsCallbackScheduled(false);
    startBrowserCallSimulation(selectedLanguage);
  };

  // Start Real Twilio PSTN Phone Call
  const handleStartRealCall = async () => {
    if (!phoneNumber.trim()) return;
    stopSpeech();
    setIsDialingTwilio(true);
    setCallStatus('DIALING');
    setErrorMessage(null);
    setTrialNotice(null);
    setMessages([
      {
        speaker: 'system',
        text: `Initiating real Twilio PSTN carrier call to ${phoneNumber}...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const res = await fetch('/api/voice/twilio/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          phoneNumber,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (data.success && data.call) {
        setTwilioSid(data.call.callSid);
        setCallStatus('RINGING');
        setMessages((prev) => [
          ...prev,
          {
            speaker: 'system',
            text: `Ringing on dedicated carrier line ${phoneNumber}. Pick up your physical phone to speak with Ava AI!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        const isTrialPolicy =
          data.error?.includes('573002') ||
          data.error?.includes('21215') ||
          data.error?.includes('21216') ||
          data.error?.includes('verified') ||
          data.error?.includes('trial') ||
          data.trialNotice;

        if (isTrialPolicy) {
          setTrialNotice(
            `Twilio Carrier Note: Carrier dialing to ${phoneNumber} requires Twilio account upgrade. Seamlessly connecting via Direct Live AI Voice Channel...`
          );
          setTelephonyMode('BROWSER_SIM');
          startBrowserCallSimulation(selectedLanguage);
        } else {
          setCallStatus('ENDED');
          setErrorMessage(data.error || 'Twilio rejected the call request.');
          checkDiagnostics(phoneNumber);
        }
      }
    } catch (err: any) {
      setCallStatus('ENDED');
      setErrorMessage(err.message || 'Network error while contacting Twilio API.');
    } finally {
      setIsDialingTwilio(false);
    }
  };

  const handleSaveTwilioNumber = async () => {
    if (!newTwilioNumberInput.trim()) return;
    setIsSavingTwilioNumber(true);
    try {
      const res = await fetch('/api/voice/twilio/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateTwilioPhone: newTwilioNumberInput.trim(),
          targetPhone: phoneNumber,
        }),
      });
      if (res.ok) {
        await checkDiagnostics(phoneNumber);
      }
    } catch (_) {}
    finally {
      setIsSavingTwilioNumber(false);
    }
  };

  // Trigger 1-click Twilio phone verification call
  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    setErrorMessage(null);
    setVerificationCode(null);
    try {
      const res = await fetch('/api/voice/twilio/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_VERIFICATION',
          phoneNumber,
          name: lead?.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.validationCode) {
        setVerificationCode(data.validationCode);
      } else {
        setErrorMessage(data.error || 'Failed to request Twilio phone verification.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error requesting verification.');
    } finally {
      setIsRequestingVerification(false);
    }
  };

  if (!isOpen || !lead) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl glass-card border-indigo-500/30 bg-[#070b1e] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header & Telephony Mode Switcher */}
        <div className="p-4 border-b border-white/[0.08] bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {callStatus === 'CONNECTED' && (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#070b1e]"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AI Voice Calling Agent</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Groq LLaMA 3.3 70B &bull; &lt;150ms
                  </span>
                </h2>

                {callStatus === 'CONNECTED' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE CALL &bull; {formatTime(duration)}
                  </span>
                )}

                {callStatus === 'RINGING' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    RINGING...
                  </span>
                )}

                {callStatus === 'DIALING' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    DIALING...
                  </span>
                )}

                {callStatus === 'ENDED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                    CALL ENDED
                  </span>
                )}

                {/* Sentiment Badge */}
                <span
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    currentSentiment === 'POSITIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : currentSentiment === 'HESITANT'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : currentSentiment === 'OBJECTION'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : currentSentiment === 'NEGATIVE'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  <span>Sentiment:</span>
                  <span>
                    {currentSentiment === 'POSITIVE' && '😊 High Intent'}
                    {currentSentiment === 'NEUTRAL' && '😐 Inquiring'}
                    {currentSentiment === 'HESITANT' && '🤔 Hesitant / Busy'}
                    {currentSentiment === 'OBJECTION' && '⚠️ Objection Handled'}
                    {currentSentiment === 'NEGATIVE' && '🛑 DND Opt-Out'}
                  </span>
                </span>
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span>
                  Calling <span className="font-semibold text-white">{lead.name}</span> ({lead.jobTitle} at {lead.companyName})
                </span>
                <span className="text-slate-400">&bull; {lead.location || lead.country || 'Global'}</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs + Close */}
          <div className="flex items-center gap-2">
            <div className="p-0.5 rounded-xl bg-black/60 border border-white/10 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setTelephonyMode('BROWSER_SIM')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  telephonyMode === 'BROWSER_SIM'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Direct Website Live AI Voice Call with Duplex Mic & Speaker (Works on all numbers)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Website Live AI Call</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-medium">100% Numbers</span>
              </button>

              <button
                type="button"
                onClick={() => setTelephonyMode('TWILIO_PSTN')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  telephonyMode === 'TWILIO_PSTN'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Twilio Cloud Telephony Carrier Calling (75 Min Free Quota)"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Twilio Mobile PSTN</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-400/20 text-indigo-300 font-medium">75m Quota</span>
              </button>
            </div>

            {callStatus === 'CONNECTED' || callStatus === 'RINGING' ? (
              <button
                type="button"
                onClick={handleHangup}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            ) : callStatus === 'ENDED' ? (
              <button
                type="button"
                onClick={handleRestartCall}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-dial</span>
              </button>
            ) : null}

            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                aria-label="Minimize Call to Floating HUD"
                title="Minimize call to floating widget (keep browsing)"
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.06] transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={async () => {
                stopSpeech();
                if (callStatus === 'CONNECTED' && messages.length > 0) {
                  await handleHangup();
                }
                onClose();
              }}
              aria-label="Close dialog"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Twilio Diagnostic & Carrier Status Banner */}
        {telephonyMode === 'TWILIO_PSTN' && diagnostics && (
          <div className="p-3 bg-gradient-to-r from-slate-950 via-[#101736] to-slate-950 border-b border-indigo-500/30 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {diagnostics.isTargetVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  {diagnostics.isTargetVerified ? (
                    <span className="text-emerald-300 font-semibold">
                      ✓ Twilio 75m Quota Active: {phoneNumber} is verified. Ready to ring physical mobile phone!
                    </span>
                  ) : (
                    <span className="text-amber-200">
                      Twilio 75m Trial Quota: Carrier dialing requires verification or account upgrade. Or use{' '}
                      <button
                        onClick={() => setTelephonyMode('BROWSER_SIM')}
                        className="font-bold underline text-emerald-300 hover:text-white"
                      >
                        Website Live AI Call
                      </button>{' '}
                      to call any number directly through the website!
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!diagnostics.isTargetVerified && (
                  <button
                    type="button"
                    onClick={handleRequestVerification}
                    disabled={isRequestingVerification}
                    className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{isRequestingVerification ? 'Calling...' : 'Verify on Twilio (OTP Call)'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => checkDiagnostics(phoneNumber)}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingDiagnostics ? 'animate-spin' : ''}`} />
                  <span>Check PSTN</span>
                </button>
              </div>
            </div>

            {verificationCode && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Twilio is calling {phoneNumber} right now!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Answer your phone and enter this 6-digit code on the dialpad:</p>
                </div>
                <div className="text-lg font-mono font-bold tracking-widest text-emerald-300 bg-black/80 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {verificationCode}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Panel: Call Controls, Waveforms & Live Transcript */}
          <div className="lg:col-span-8 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#050818] overflow-y-auto">
            {/* Top Dialing & Language Selection Bar */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0d1633] via-[#09112a] to-[#0d1633] border border-indigo-500/30 shadow-lg mb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-slate-300">Call Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                    className="bg-black/70 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-400 cursor-pointer font-semibold"
                  >
                    <option value="English">English (US/UK/Global)</option>
                    <option value="हिन्दी">हिन्दी (Hindi - India)</option>
                    <option value="ગુજરાતી">ગુજરાતી (Gujarati - Regional)</option>
                    <option value="Español">Español (Spanish)</option>
                    <option value="Français">Français (French)</option>
                    <option value="Deutsch">Deutsch (German)</option>
                    <option value="العربية">العربية (Arabic)</option>
                  </select>
                </div>

                {telephonyMode === 'TWILIO_PSTN' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 9737362307"
                      disabled={callStatus === 'CONNECTED' || callStatus === 'RINGING' || isDialingTwilio}
                      className="px-2.5 py-1 rounded-lg bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={handleStartRealCall}
                      disabled={isDialingTwilio || callStatus === 'CONNECTED' || callStatus === 'RINGING'}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Dial</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Website Voice Channel Active (Duplex AI)
                    </span>

                    {callStatus === 'CONNECTED' ? (
                      <button
                        type="button"
                        onClick={handleHangup}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30 transition-all animate-pulse"
                        title="End call and store conversation log"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>End Call</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRestartCall}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restart Call</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live Audio Waveform Animation Banner */}
            {callStatus === 'CONNECTED' && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{isAiSpeaking ? 'Ava AI is speaking...' : isMicListening ? 'Listening to your voice...' : 'Live Audio Active'}</span>
                      <span className="text-[10px] font-mono text-emerald-400">({formatTime(duration)})</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {isAiSpeaking ? 'Audio output playing through speakers' : 'Speak into microphone or select an evaluation chip below'}
                    </div>
                  </div>
                </div>

                {/* Animated Audio Equalizer Bars */}
                <div className="flex items-center gap-1 pr-2">
                  <span className={`w-1 rounded-full bg-emerald-400 transition-all ${isAiSpeaking || isMicListening ? 'h-5 animate-pulse' : 'h-2'}`} style={{ animationDelay: '0ms' }} />
                  <span className={`w-1 rounded-full bg-indigo-400 transition-all ${isAiSpeaking || isMicListening ? 'h-7 animate-pulse' : 'h-3'}`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-1 rounded-full bg-teal-400 transition-all ${isAiSpeaking || isMicListening ? 'h-4 animate-pulse' : 'h-2'}`} style={{ animationDelay: '300ms' }} />
                  <span className={`w-1 rounded-full bg-emerald-300 transition-all ${isAiSpeaking || isMicListening ? 'h-6 animate-pulse' : 'h-3'}`} style={{ animationDelay: '450ms' }} />
                  <span className={`w-1 rounded-full bg-indigo-300 transition-all ${isAiSpeaking || isMicListening ? 'h-3 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '200ms' }} />
                </div>
              </div>
            )}

            {/* Calendly SMS Sent Banner (Triggered during human handoff / text link request) */}
            {calendlyLinkSent && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-blue-950/70 border border-blue-500/40 text-blue-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in shadow-lg shadow-blue-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>SMS Sent with Calendly Link</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        calendlyStatus === 'BOOKED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : calendlyStatus === 'NOT_BOOKED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {calendlyStatus === 'BOOKED' ? '✓ Booked' : calendlyStatus === 'NOT_BOOKED' ? '⚠️ Not Booked (Re-Dial Due)' : 'Pending Booking'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      Dispatched to {lead.phone || phoneNumber} &bull; Timeslots pre-loaded
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCalendlyModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-blue-500/20"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Open Calendly View</span>
                  </button>

                  {calendlyStatus === 'NOT_BOOKED' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerRedial(
                          `Hi ${lead.name}, this is Ava from TechNova Solutions! I noticed you hadn't had a chance to pick a time slot on the Calendly booking link we sent earlier. I wanted to follow up directly to see if we can find a quick 10-minute window for a discussion or answer any questions?`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all animate-pulse"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Again Now</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Live Call Transcript Scroll Area */}
            <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-[#030612] border border-white/[0.06]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Bot className="w-8 h-8 text-indigo-400/50 mb-1" />
                  <div className="text-sm font-semibold text-slate-300">Connecting Call Console...</div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Ava AI is initiating the multilingual voice qualification call. The live transcript will stream here in real time.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAgent = msg.speaker === 'agent';
                  const isSystem = msg.speaker === 'system';

                  if (isSystem) {
                    return (
                      <div key={idx} className="flex justify-center my-1.5">
                        <span className="text-[11px] text-slate-400 bg-white/[0.05] border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {msg.time && <span className="text-emerald-400 font-bold">[{msg.time}]</span>}
                          <span>{msg.text}</span>
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAgent && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-md shadow-indigo-600/30">
                          AI
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-[#121838] border border-indigo-500/30 text-slate-100 rounded-tl-none shadow-md'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-semibold">
                          <span>{isAgent ? 'Ava (AI Sales Executive)' : `${lead.name} (Prospect)`}</span>
                          <span className="flex items-center gap-1.5 font-mono">
                            <Clock className="w-2.5 h-2.5 opacity-70" />
                            <span>{msg.time || formatCallTime(msg.offsetSeconds ?? 0)}</span>
                            <span className="opacity-60 font-sans">• {msg.timestamp}</span>
                          </span>
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
                })
              )}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Ava is analyzing requirement &amp; synthesizing spoken response (&lt;150ms)...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Demo Scenario Evaluation Chips (Essential for Presentations!) */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span>1-Click Test Scenarios for Evaluation:</span>
                <span className="text-indigo-400 text-[10px]">Natural Voice &bull; Objection &bull; Negative Call &bull; Handoff</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Yes, we are actively looking for a partner for 150 users. What is your pricing and implementation timeline?')}
                  disabled={callStatus !== 'CONNECTED' || isAiThinking}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>Inquire / Objection (Pricing)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Please stop calling me! Remove my phone number and take me off your list right now.')}
                  disabled={callStatus !== 'CONNECTED' || isAiThinking}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                >
                  <PhoneMissed className="w-3 h-3 text-rose-400" />
                  <span>Negative Call &bull; DND Opt-Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Can I speak with a human or team member? Please send me a text message with a link so I can book a call directly from your timeslots.')}
                  disabled={callStatus !== 'CONNECTED' || isAiThinking}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                >
                  <UserCheck className="w-3 h-3 text-purple-400" />
                  <span>Human Handoff &bull; Send Calendly Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage("I'm in an important client meeting right now, please call me back tomorrow morning at 10:30 AM.")}
                  disabled={callStatus !== 'CONNECTED' || isAiThinking}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Busy &bull; Callback Retry</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage('Sounds fantastic! Let us book the calendar demo for Thursday at 3 PM.')}
                  disabled={callStatus !== 'CONNECTED' || isAiThinking}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                >
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>Confirm Meeting Booking</span>
                </button>
              </div>
            </div>

            {/* Input Bar: Hands-Free Microphone + Text Typing */}
            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                disabled={callStatus !== 'CONNECTED'}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isMicListening
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/10'
                } disabled:opacity-40`}
                title={isMicListening ? 'Stop listening' : 'Start speaking with microphone'}
              >
                {isMicListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    isMicListening
                      ? 'Listening to your speech...'
                      : callStatus === 'CONNECTED'
                      ? 'Speak into mic or type prospect reply here (Enter to send)...'
                      : 'Call must be connected to speak...'
                  }
                  disabled={callStatus !== 'CONNECTED' || isAiThinking}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400 disabled:opacity-50"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={callStatus !== 'CONNECTED' || !inputText.trim() || isAiThinking}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer disabled:opacity-40 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Panel: CRM Dossier, Sentiment & Real-Time Intelligence */}
          <div className="lg:col-span-4 p-4 bg-[#080d24] flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Lead Intelligence Card */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Prospect Profile</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Intent: {lead.intentScore}%
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-white text-sm">{lead.name}</div>
                  <div className="text-slate-300">{lead.jobTitle} &bull; {lead.companyName}</div>
                  <div className="text-slate-400 text-[11px]">{lead.location || lead.country || 'Global'}</div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-slate-300">
                  <span className="text-indigo-400 font-semibold block mb-0.5">Detected Public RFP / Requirement:</span>
                  <p className="line-clamp-3">{lead.originalPostSnippet || 'Cloud migration & Microsoft 365 license optimization.'}</p>
                </div>
              </div>

              {/* Real-Time Call Summary */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Live Qualification Summary
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/[0.06]">
                  {callSummary}
                </p>
              </div>

              {/* Next Best Action */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  Next Best Action
                </span>
                <p className="text-xs text-emerald-200/90 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
                  {nextBestAction}
                </p>
              </div>

              {/* Automated Outcomes Handled */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outcomes Handled Automatically</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border text-center font-semibold transition-all ${isMeetingBooked ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'}`}>
                    {isMeetingBooked ? '✓ Meeting Booked' : 'Meeting Booking'}
                  </div>
                  <div className={`p-2 rounded-lg border text-center font-semibold transition-all ${isNegativeDnd ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'}`}>
                    {isNegativeDnd ? '🛑 DND Opt-Out' : 'DND Compliance'}
                  </div>
                  <div className={`p-2 rounded-lg border text-center font-semibold transition-all ${isHumanHandoff ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'}`}>
                    {isHumanHandoff ? '✓ Human Handoff' : 'Human Handoff'}
                  </div>
                  <div className={`p-2 rounded-lg border text-center font-semibold transition-all ${isCallbackScheduled ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'}`}>
                    {isCallbackScheduled ? '✓ Retry Scheduled' : 'Retry / Callback'}
                  </div>
                </div>
              </div>

              {/* Calendly Booking & Re-Dial Tracker Card */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Calendly SMS &amp; Re-Dial Tracker
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      calendlyStatus === 'BOOKED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : calendlyStatus === 'NOT_BOOKED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : calendlyLinkSent
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {calendlyStatus === 'BOOKED'
                      ? 'BOOKED'
                      : calendlyStatus === 'NOT_BOOKED'
                      ? 'RE-DIAL DUE'
                      : calendlyLinkSent
                      ? 'LINK SENT'
                      : 'STANDBY'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-black/40 p-2 rounded-lg border border-white/[0.06]">
                  {calendlyStatus === 'BOOKED'
                    ? 'Prospect booked a meeting via Calendly link. Auto-redial cancelled.'
                    : calendlyStatus === 'NOT_BOOKED'
                    ? 'Prospect did not book within timeframe. Automated re-dial queued.'
                    : calendlyLinkSent
                    ? 'SMS delivered with timeslot selector. Waiting for prospect booking.'
                    : 'If prospect requests human handoff, AI sends an SMS with direct Calendly booking link.'}
                </p>

                <div className="flex flex-wrap gap-2">
                  {!calendlyLinkSent ? (
                    <button
                      type="button"
                      disabled={isSendingCalendlySms}
                      onClick={handleSendCalendlySmsManually}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSendingCalendlySms ? 'Dispatching SMS...' : 'Send Calendly SMS Now'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCalendlyModal(true)}
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-500/20"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Open Calendly Simulation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">SQLite CallLog Active</span>
                <span className="text-[10px] text-emerald-400 font-mono">• Sub-150ms Groq</span>
              </div>
              <div className="flex items-center gap-2">
                {onMinimize && (
                  <button
                    type="button"
                    onClick={onMinimize}
                    className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Minimize call to floating widget"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Minimize</span>
                  </button>
                )}
                {callStatus === 'CONNECTED' ? (
                  <button
                    type="button"
                    onClick={handleHangup}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/30 animate-pulse"
                    title="End active call and store conversation in Conversations tab"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Call</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      stopSpeech();
                      if (messages.length > 0 && callStatus !== 'ENDED') {
                        await handleHangup();
                      }
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close Console
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendly Booking Simulation Drawer / Modal */}
      {lead && (
        <CalendlyBookingModal
          isOpen={showCalendlyModal}
          onClose={() => setShowCalendlyModal(false)}
          lead={lead}
          calendlyUrl={calendlyUrl}
          onBookingConfirmed={() => {
            setCalendlyStatus('BOOKED');
            setIsMeetingBooked(true);
            onMeetingBookedSuccess?.();
          }}
          onTriggerRedial={(script) => {
            handleTriggerRedial(script);
          }}
        />
      )}
    </div>
  );
}
