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
  Save,
  Sliders,
} from 'lucide-react';
import { CalendlyBookingModal } from './CalendlyBookingModal';
import { GoogleCalendarModal } from '../calendar/GoogleCalendarModal';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import {
  SupportedLanguage,
  getTranslation,
  getLocaleForVoice,
  getAiGreeting,
  getQuickReplies,
  getLanguageConfirmationSpeech,
} from '@/lib/i18n/translations';

export const DEMO_PRESENTATION_NUMBERS = [
  {
    id: 'yash-live',
    name: 'Yash Gohel (Verified Mobile)',
    phone: '+91 9737362307',
    badge: 'Live Physical Ring (Twilio)',
    isVerified: true,
  },
  {
    id: 'jury-line-1',
    name: 'Twilio Gateway (Jury Line 1)',
    phone: '+1 737-250-8034',
    badge: 'Austin TX Gateway',
    isVerified: false,
  },
  {
    id: 'jury-line-2',
    name: 'Enterprise VIP Mobile (Jury Line 2)',
    phone: '+91 98765 43210',
    badge: 'Mumbai VIP Line',
    isVerified: false,
  },
];

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
  initialTelephonyMode?: 'BROWSER_SIM' | 'TWILIO_PSTN';
}

export default function LiveCallSimulatorModal({
  lead,
  isOpen,
  onClose,
  onMinimize,
  onMeetingBookedSuccess,
  defaultLanguage = 'English',
  initialTelephonyMode,
}: LiveCallSimulatorModalProps) {
  // Mode Selection: Default to Browser Demo Web Call unless specified or Yash's verified phone
  const isDefaultYash = lead?.phone?.includes('9737362307') || lead?.name?.toLowerCase().includes('yash');
  const [telephonyMode, setTelephonyMode] = useState<'BROWSER_SIM' | 'TWILIO_PSTN'>(
    initialTelephonyMode || (isDefaultYash ? 'TWILIO_PSTN' : 'BROWSER_SIM')
  );

  useEffect(() => {
    if (initialTelephonyMode && isOpen) {
      setTelephonyMode(initialTelephonyMode);
    }
  }, [initialTelephonyMode, isOpen]);

  // Shared Core State - uses lead's own phone number!
  const [phoneNumber, setPhoneNumber] = useState(
    lead?.phone || (isDefaultYash ? '+91 9737362307' : '+1 415-890-2341')
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (defaultLanguage as SupportedLanguage) || 'English'
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Google Calendar Integration & Twilio Meeting Verification SMS State
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string | null>(null);
  const [meetingDisplayStr, setMeetingDisplayStr] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isSendingVerificationSms, setIsSendingVerificationSms] = useState(false);
  const [hasSentMeetingSms, setHasSentMeetingSms] = useState(false);
  const [meetingSmsSid, setMeetingSmsSid] = useState<string | null>(null);

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

  // Solution & Response Editing State
  const [showSolutionsEditor, setShowSolutionsEditor] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState('CloudScale Solutions');
  const [editProductsCatalog, setEditProductsCatalog] = useState(
    'Microsoft 365 Enterprise Migration, SharePoint Online Document Management, Zero-Downtime Cloud Cutover, Power Platform Automation'
  );
  const [editDescription, setEditDescription] = useState(
    'Enterprise Microsoft 365, SharePoint Migration & Cloud Solutions Provider'
  );
  const [isSavingSolutions, setIsSavingSolutions] = useState(false);
  const [solutionsSavedSuccess, setSolutionsSavedSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrgSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.companyName) setEditCompanyName(data.settings.companyName);
          if (data.settings.productsCatalog) setEditProductsCatalog(data.settings.productsCatalog);
          if (data.settings.description) setEditDescription(data.settings.description);
        }
      } catch (_) {}
    }
    fetchOrgSettings();
  }, []);

  const handleSaveSolutions = async () => {
    setIsSavingSolutions(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: editCompanyName,
          productsCatalog: editProductsCatalog,
          description: editDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSolutionsSavedSuccess(true);
        setTimeout(() => setSolutionsSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.warn('Failed to save solutions:', e);
    } finally {
      setIsSavingSolutions(false);
    }
  };

  // Refs for audio & speech recognition
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenRef = useRef<string>('');
  const lastTrackedTextRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const handleSendMessageRef = useRef<((text?: string) => Promise<void>) | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const callStatusRef = useRef(callStatus);
  const durationRef = useRef(duration);
  const isAiThinkingRef = useRef(isAiThinking);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  const hasTriggeredMeetingSuccessRef = useRef(false);
  const onMeetingBookedSuccessRef = useRef(onMeetingBookedSuccess);
  const telephonyModeRef = useRef(telephonyMode);
  const browserSimTimer1Ref = useRef<NodeJS.Timeout | null>(null);
  const browserSimTimer2Ref = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    telephonyModeRef.current = telephonyMode;
  }, [telephonyMode]);

  useEffect(() => {
    isAiThinkingRef.current = isAiThinking;
  }, [isAiThinking]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    onMeetingBookedSuccessRef.current = onMeetingBookedSuccess;
  }, [onMeetingBookedSuccess]);

  useEffect(() => {
    if (isOpen) {
      hasTriggeredMeetingSuccessRef.current = false;
    }
  }, [isOpen, twilioSid]);

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

  // Stop any ongoing SpeechSynthesis or Audio stream
  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch (_) {}
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
  }, []);

  // Fallback to Web Speech Synthesis API
  const fallbackWebSpeech = useCallback(
    (text: string, lang: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }
      if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        if (onEnd) onEnd();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLocale = getLocaleForVoice(lang);
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

        utterance.onstart = () => {
          if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') {
            try { window.speechSynthesis.cancel(); } catch (_) {}
            setIsAiSpeaking(false);
            isAiSpeakingRef.current = false;
            return;
          }
          setIsAiSpeaking(true);
          isAiSpeakingRef.current = true;
        };
        utterance.onend = () => {
          setIsAiSpeaking(false);
          isAiSpeakingRef.current = false;
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          setIsAiSpeaking(false);
          isAiSpeakingRef.current = false;
          if (onEnd) onEnd();
        };

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (_) {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        if (onEnd) onEnd();
      }
    },
    []
  );

  // Text-To-Speech function using high-fidelity /api/voice/tts audio engine with Web Speech API fallback
  const speakText = useCallback(
    (text: string, onEnd?: () => void, langOverride?: string) => {
      if (typeof window === 'undefined') {
        if (onEnd) onEnd();
        return;
      }

      // STRICT GUARD: Never play audio if call is ended or user is on Twilio physical phone call!
      if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        if (onEnd) onEnd();
        return;
      }

      stopSpeech();

      const activeLang = langOverride || selectedLanguage || 'English';

      try {
        // High-Fidelity Neural Audio via /api/voice/tts
        const cleanSpeech = text
          .replace(/[*_#`~]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!cleanSpeech) {
          if (onEnd) onEnd();
          return;
        }

        const audioUrl = `/api/voice/tts?lang=${encodeURIComponent(activeLang)}&text=${encodeURIComponent(cleanSpeech)}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') {
            try {
              audio.pause();
              audio.src = '';
            } catch (_) {}
            audioRef.current = null;
            setIsAiSpeaking(false);
            isAiSpeakingRef.current = false;
            return;
          }
          setIsAiSpeaking(true);
          isAiSpeakingRef.current = true;
        };

        audio.onended = () => {
          setIsAiSpeaking(false);
          isAiSpeakingRef.current = false;
          audioRef.current = null;
          if (onEnd) onEnd();
        };

        audio.onerror = (err) => {
          audioRef.current = null;
          if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') {
            setIsAiSpeaking(false);
            isAiSpeakingRef.current = false;
            return;
          }
          console.warn('Audio TTS stream error, falling back to Web Speech API:', err);
          fallbackWebSpeech(cleanSpeech, activeLang, onEnd);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((playErr) => {
            audioRef.current = null;
            if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') {
              setIsAiSpeaking(false);
              isAiSpeakingRef.current = false;
              return;
            }
            console.warn('Audio play auto-play policy block or error:', playErr);
            fallbackWebSpeech(cleanSpeech, activeLang, onEnd);
          });
        }
      } catch (err) {
        console.warn('TTS playback error, attempting fallback:', err);
        fallbackWebSpeech(text, activeLang, onEnd);
      }
    },
    [selectedLanguage, stopSpeech, fallbackWebSpeech]
  );

  // Handle explicit language change from dropdown
  const handleLanguageSelect = (newLang: SupportedLanguage) => {
    stopSpeech();
    setSelectedLanguage(newLang);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = getLocaleForVoice(newLang);
      } catch (_) {}
    }

    if (lead) {
      const firstName = (lead.name || 'Prospect').trim().split(' ')[0];
      const requirement = lead.originalPostSnippet
        ? lead.originalPostSnippet.substring(0, 45) + '...'
        : 'Microsoft 365 & SharePoint migration';

      const switchGreeting = getLanguageConfirmationSpeech(newLang, firstName, lead.companyName, requirement);

      setMessages((prev) => [
        ...prev,
        {
          speaker: 'system',
          text: `Language switched to ${newLang} • Two-Way Live Audio Active`,
          time: formatCallTime(durationRef.current),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          offsetSeconds: durationRef.current,
        },
        {
          speaker: 'agent',
          text: switchGreeting,
          time: formatCallTime(durationRef.current),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          offsetSeconds: durationRef.current,
        },
      ]);

      if (callStatus === 'CONNECTED' || callStatus === 'IDLE' || callStatus === 'DIALING' || callStatus === 'RINGING') {
        if (callStatus !== 'CONNECTED') setCallStatus('CONNECTED');
        speakText(switchGreeting, () => {
          if (recognitionRef.current && callStatusRef.current === 'CONNECTED') {
            try {
              recognitionRef.current.start();
            } catch (_) {}
          }
        }, newLang);
      }
    }
  };

  // Multilingual quick demo evaluation chips
  const getMultilingualChips = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'ગુજરાતી':
        return [
          {
            label: 'પૂછપરછ / કિંમત',
            text: 'હા, અમારે 150 યુઝર્સ માટે પાર્ટનરની જરૂર છે. તમારી કિંમત અને માઈગ્રેશન સમયમર્યાદા શું છે?',
            icon: Zap,
            color: 'bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border-blue-500/30',
          },
          {
            label: 'DND / ફોન ના કરતા',
            text: 'કૃપા કરીને મને કૉલ ના કરો! મારો નંબર હટાવી દો અને લિસ્ટમાંથી કાઢી નાખો.',
            icon: PhoneMissed,
            color: 'bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 border-rose-500/30',
          },
          {
            label: 'ટીમ વાત / SMS લિંક',
            text: 'શું હું તમારી ટીમ સાથે વાત કરી શકું? મને SMS દ્વારા કેલેન્ડલી લિંક મોકલો જેથી હું સમય બુક કરી શકું.',
            icon: UserCheck,
            color: 'bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border-purple-500/30',
          },
          {
            label: 'કૉલબેક શેડ્યૂલ',
            text: 'હું અત્યારે ક્લાયન્ટ મીટિંગમાં બીઝી છું, કૃપા કરીને મને કાલે સવારે 10:30 વાગ્યે ફોન કરશો.',
            icon: Clock,
            color: 'bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 border-amber-500/30',
          },
          {
            label: 'મીટિંગ નક્કી & SMS',
            text: 'ખૂબ સરસ! ગુરુવારે બપોરે 3 વાગ્યે ડેમો માટે મીટિંગ નક્કી કરો અને મને વેરિફિકેશન SMS મોકલો.',
            icon: Calendar,
            color: 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
          },
        ];
      case 'हिन्दी':
        return [
          {
            label: 'पूछताछ / कीमत',
            text: 'हाँ, हम 150 यूज़र्स के लिए पार्टनर तलाश रहे हैं। आपकी कीमत और रोलआउट टाइमलाइन क्या है?',
            icon: Zap,
            color: 'bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border-blue-500/30',
          },
          {
            label: 'DND / कॉल मत करो',
            text: 'कृपया मुझे कॉल करना बंद करें! मेरा नंबर अपनी लिस्ट से तुरंत हटा दें।',
            icon: PhoneMissed,
            color: 'bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 border-rose-500/30',
          },
          {
            label: 'टीम से बात / SMS लिंक',
            text: 'क्या मैं आपकी टीम से बात कर सकता हूँ? मुझे SMS से Calendly बुकिंग लिंक भेजें ताकि मैं समय चुन सकूँ।',
            icon: UserCheck,
            color: 'bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border-purple-500/30',
          },
          {
            label: 'कॉल-बैक शेड्यूल',
            text: 'मैं अभी क्लाइंट मीटिंग में व्यस्त हूँ, कृपया मुझे कल सुबह 10:30 बजे कॉल करें।',
            icon: Clock,
            color: 'bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 border-amber-500/30',
          },
          {
            label: 'मीटिंग तय & SMS',
            text: 'शानदार! गुरुवार दोपहर 3 बजे डेमो के लिए मीटिंग पक्की कर दीजिए और मुझे वेरिफिकेशन SMS भेजें।',
            icon: Calendar,
            color: 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
          },
        ];
      case 'Español':
        return [
          {
            label: 'Precios / Consulta',
            text: 'Sí, buscamos un socio para 150 usuarios. ¿Cuál es el precio y los plazos de implementación?',
            icon: Zap,
            color: 'bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border-blue-500/30',
          },
          {
            label: 'No llamar • DND',
            text: '¡Por favor no me llamen más! Eliminen mi número de su lista inmediatamente.',
            icon: PhoneMissed,
            color: 'bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 border-rose-500/30',
          },
          {
            label: 'Hablar con equipo • SMS',
            text: '¿Puedo hablar con un representante humano? Envíenme un SMS con su enlace de Calendly.',
            icon: UserCheck,
            color: 'bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border-purple-500/30',
          },
          {
            label: 'Devolver llamada',
            text: 'Estoy en una reunión importante ahora, por favor llámenme mañana a las 10:30 AM.',
            icon: Clock,
            color: 'bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 border-amber-500/30',
          },
          {
            label: 'Confirmar reunión & SMS',
            text: '¡Suena fantástico! Agendemos la demo para el jueves a las 3 PM y envíenme la verificación por SMS.',
            icon: Calendar,
            color: 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
          },
        ];
      default:
        return [
          {
            label: 'Pricing Inquiry',
            text: 'Yes, we are actively looking for a partner for 150 users. What is your pricing and implementation timeline?',
            icon: Zap,
            color: 'bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border-blue-500/30',
          },
          {
            label: 'DND Opt-Out',
            text: 'Please stop calling me! Remove my phone number and take me off your list right now.',
            icon: PhoneMissed,
            color: 'bg-rose-600/15 hover:bg-rose-600/30 text-rose-300 border-rose-500/30',
          },
          {
            label: 'Human Handoff / Link',
            text: 'Can I speak with a human or team member? Please send me a text message with a link so I can book a call directly from your timeslots.',
            icon: UserCheck,
            color: 'bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border-purple-500/30',
          },
          {
            label: 'Schedule Callback',
            text: "I'm in an important client meeting right now, please call me back tomorrow morning at 10:30 AM.",
            icon: Clock,
            color: 'bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 border-amber-500/30',
          },
          {
            label: 'Confirm Meeting & SMS',
            text: 'Sounds fantastic! Let us book the calendar demo for Thursday at 3 PM and send me a verification SMS to confirm.',
            icon: Calendar,
            color: 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
          },
        ];
    }
  };

  // Initialize Speech Recognition for Hands-Free Microphone
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLocaleForVoice(selectedLanguage);

      recognition.onstart = () => {
        if (telephonyModeRef.current !== 'BROWSER_SIM' || callStatusRef.current === 'ENDED') {
          try { recognition.abort(); } catch (_) {}
          setIsMicListening(false);
          return;
        }
        setIsMicListening(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        // Strictly prevent speech recognition in Twilio PSTN mode, when AI speaks, or when call ended
        if (telephonyModeRef.current !== 'BROWSER_SIM' || callStatusRef.current !== 'CONNECTED' || isAiThinkingRef.current || isAiSpeakingRef.current) return;

        let interim = '';
        let finalPhrase = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalPhrase += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const spoken = (finalPhrase || interim).trim();
        if (!spoken) return;

        setSpeechTranscript(spoken);
        setInputText(spoken);

        // 1. Immediate dispatch if Web Speech API engine marked final phrase
        if (finalPhrase.trim()) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          const toSend = finalPhrase.trim();
          lastSpokenRef.current = '';
          lastTrackedTextRef.current = '';
          setSpeechTranscript('');
          setInputText('');
          handleSendMessageRef.current?.(toSend);
          return;
        }

        // 2. Robust Silence VAD:
        // Only reset the debounce timer when speech is still actively changing.
        // If Chrome repeatedly sends identical interim results while the user is silent,
        // we DO NOT reset the timer, allowing the 750ms silence window to fire reliably!
        if (spoken !== lastTrackedTextRef.current) {
          lastTrackedTextRef.current = spoken;
          lastSpokenRef.current = spoken;
          lastSpeechTimeRef.current = Date.now();

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const pending = lastTrackedTextRef.current.trim();
            if (pending && !isAiThinkingRef.current && !isAiSpeakingRef.current) {
              lastTrackedTextRef.current = '';
              lastSpokenRef.current = '';
              setSpeechTranscript('');
              setInputText('');
              handleSendMessageRef.current?.(pending);
            }
          }, 750);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e?.error);
        if (e?.error === 'not-allowed') {
          setErrorMessage('Microphone access blocked. Please allow microphone permission in your browser address bar.');
          setIsMicListening(false);
        } else if (e?.error !== 'no-speech') {
          setIsMicListening(false);
        }
      };

      recognition.onend = () => {
        // Dispatch any pending speech remaining in buffer when microphone stops (ONLY for BROWSER_SIM)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const pending = (lastTrackedTextRef.current || lastSpokenRef.current).trim();
        if (telephonyModeRef.current === 'BROWSER_SIM' && callStatusRef.current === 'CONNECTED' && pending && !isAiThinkingRef.current && !isAiSpeakingRef.current) {
          lastTrackedTextRef.current = '';
          lastSpokenRef.current = '';
          setSpeechTranscript('');
          setInputText('');
          handleSendMessageRef.current?.(pending);
        }
        setIsMicListening(false);

        // Auto-restart recognition ONLY if browser demo call is connected, AI not speaking, and NOT Twilio mode
        if (telephonyModeRef.current === 'BROWSER_SIM' && callStatusRef.current === 'CONNECTED' && !isAiThinkingRef.current && !isAiSpeakingRef.current) {
          try {
            recognition.start();
            setIsMicListening(true);
          } catch (_) {}
        }
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

  const toggleMic = async () => {
    if (telephonyModeRef.current === 'TWILIO_PSTN') {
      alert('Physical Carrier Line Active: Speak directly into your mobile phone handset. Browser microphone is disabled during Twilio carrier calls.');
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition && !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message below.');
      return;
    }

    if (isMicListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsMicListening(false);
    } else {
      stopSpeech();
      // Prompt for microphone permission if needed
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.warn('Mic permission check warning:', err);
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = getLocaleForVoice(selectedLanguage);
          recognitionRef.current.start();
          setIsMicListening(true);
        }
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
        try {
          recognitionRef.current?.stop();
        } catch (_) {}
        setIsMicListening(false);
      }
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

  // Start Real Twilio PSTN Carrier Phone Call
  const handleStartRealCall = async (targetOverride?: string, langOverride?: SupportedLanguage) => {
    const rawTarget = targetOverride || phoneNumber || lead?.phone || '+91 9737362307';
    let cleanTarget = rawTarget.replace(/[^\d+]/g, '');
    if (!cleanTarget.startsWith('+')) {
      if (cleanTarget.length === 10) cleanTarget = `+91${cleanTarget}`;
      else cleanTarget = `+${cleanTarget}`;
    }

    const lang = langOverride || selectedLanguage || 'Gujarati';

    stopSpeech();
    setIsDialingTwilio(true);
    setCallStatus('DIALING');
    setErrorMessage(null);
    setTrialNotice(null);
    setTelephonyMode('TWILIO_PSTN');
    setPhoneNumber(cleanTarget);
    setMessages([
      {
        speaker: 'system',
        text: `Initiating direct physical PSTN carrier call to ${cleanTarget}...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const res = await fetch('/api/voice/twilio/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          phoneNumber: cleanTarget,
          language: lang,
        }),
      });

      const data = await res.json();
      if (data.success && data.call) {
        setTwilioSid(data.call.callSid);
        setCallStatus('RINGING');
        const greetingText =
          data.call.initialGreeting ||
          `Welcome to Techsolution! For Gujarati, press 1 or say Gujarati. हिन्दी के लिए 2 दबाएँ या हिन्दी बोलें। For English, press 3 or speak English.`;

        setMessages((prev) => [
          ...prev,
          {
            speaker: 'system',
            text: `Ringing physical phone on carrier line ${cleanTarget}. Please answer your phone to speak with Ava AI!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            speaker: 'agent',
            text: greetingText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Explicitly ensure browser microphone is disabled in Twilio PSTN mode
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (_) {}
        }
        setIsMicListening(false);
      } else {
        const isTrialPolicy =
          data.error?.includes('573002') ||
          data.error?.includes('21215') ||
          data.error?.includes('21216') ||
          data.error?.includes('verified') ||
          data.trialNotice;

        if (isTrialPolicy && !cleanTarget.includes('9737362307')) {
          setTrialNotice(
            `Twilio Free Sandbox Notice: Carrier dialing to ${cleanTarget} requires number verification in Twilio Console. Verified number +91 9737362307 is active and ready.`
          );
          setErrorMessage(data.error || 'Destination number not verified in Twilio trial account.');
          setCallStatus('ENDED');
        } else {
          setCallStatus('ENDED');
          setErrorMessage(data.error || 'Twilio rejected the call request.');
          setMessages((prev) => [
            ...prev,
            {
              speaker: 'system',
              text: `⚠️ Call could not connect: ${data.error || 'Twilio rejected the call request.'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          checkDiagnostics(cleanTarget);
        }
      }
    } catch (err: any) {
      setCallStatus('ENDED');
      setErrorMessage(err.message || 'Network error while contacting Twilio API.');
      setMessages((prev) => [
        ...prev,
        {
          speaker: 'system',
          text: `⚠️ Network error: ${err.message || 'Failed to contact Twilio API.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsDialingTwilio(false);
    }
  };

  // Reset & load on modal open
  useEffect(() => {
    if (isOpen && lead) {
      const isLeadYash = lead.phone?.includes('9737362307') || lead.name.toLowerCase().includes('yash');
      const initialTarget = lead.phone || (isLeadYash ? '+91 9737362307' : '+1 415-890-2341');
      setPhoneNumber(initialTarget);
      setDuration(0);
      setMessages([]);
      setErrorMessage(null);
      setTrialNotice(null);
      setIsMeetingBooked(false);
      setIsNegativeDnd(false);
      setIsHumanHandoff(false);
      setIsCallbackScheduled(false);
      setIsSendingVerificationSms(false);
      setHasSentMeetingSms(false);
      setMeetingSmsSid(null);
      setCallSummary('Evaluating requirement fit, timeline, and decision maker authority...');
      setNextBestAction('Qualify company rollout scale and propose solutions demo.');

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

      // Smart Mode Resolution:
      // If caller explicitly passed initialTelephonyMode, respect it.
      // Otherwise: ONLY Yash's verified phone number defaults to Twilio PSTN;
      // All other prospects default to Browser Demo Web Call!
      const isYashVerified = initialTarget.includes('9737362307');
      const resolvedMode = initialTelephonyMode
        ? initialTelephonyMode
        : (isYashVerified ? 'TWILIO_PSTN' : 'BROWSER_SIM');

      setTelephonyMode(resolvedMode);

      if (resolvedMode === 'TWILIO_PSTN') {
        // Place real physical carrier call to device
        handleStartRealCall(initialTarget, detectedLang);
      } else {
        // Run in-browser AI duplex voice call with real speech synthesis
        startBrowserCallSimulation(detectedLang, initialTarget);
      }

      // Check Twilio diagnostics in background
      checkDiagnostics(initialTarget);
    } else {
      if (browserSimTimer1Ref.current) clearTimeout(browserSimTimer1Ref.current);
      if (browserSimTimer2Ref.current) clearTimeout(browserSimTimer2Ref.current);
      stopSpeech();
      setCallStatus('IDLE');
    }
    return () => {
      if (browserSimTimer1Ref.current) clearTimeout(browserSimTimer1Ref.current);
      if (browserSimTimer2Ref.current) clearTimeout(browserSimTimer2Ref.current);
      stopSpeech();
    };
  }, [isOpen, lead?.id, initialTelephonyMode]);

  // Start in-browser simulated call
  const startBrowserCallSimulation = (lang: SupportedLanguage, targetOverride?: string) => {
    if (!lead) return;
    if (browserSimTimer1Ref.current) clearTimeout(browserSimTimer1Ref.current);
    if (browserSimTimer2Ref.current) clearTimeout(browserSimTimer2Ref.current);

    const targetDisplay = targetOverride || phoneNumber || lead.phone || '+1 415-890-2341';
    setCallStatus('DIALING');
    callStatusRef.current = 'DIALING';
    setMessages([
      {
        speaker: 'system',
        text: `Initiating autonomous AI outbound call to ${lead.name} (${lead.companyName}) at ${targetDisplay}...`,
        time: '00:00',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offsetSeconds: 0,
      },
    ]);

    browserSimTimer1Ref.current = setTimeout(() => {
      if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') return;
      setCallStatus('RINGING');
      callStatusRef.current = 'RINGING';
      setMessages((prev) => [
        ...prev,
        {
          speaker: 'system',
          text: `Ringing prospect line (${targetDisplay})...`,
          time: '00:00',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          offsetSeconds: 0,
        },
      ]);

      browserSimTimer2Ref.current = setTimeout(() => {
        if (callStatusRef.current === 'ENDED' || telephonyModeRef.current === 'TWILIO_PSTN') return;
        setCallStatus('CONNECTED');
        callStatusRef.current = 'CONNECTED';
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
          if (recognitionRef.current && callStatusRef.current === 'CONNECTED' && telephonyModeRef.current === 'BROWSER_SIM') {
            try {
              recognitionRef.current.lang = getLocaleForVoice(lang);
              recognitionRef.current.start();
              setIsMicListening(true);
            } catch (_) {}
          }
        }, lang);
      }, 1200);
    }, 800);
  };

  // Poll Twilio call status if using Twilio mode
  useEffect(() => {
    if (!isOpen || telephonyMode !== 'TWILIO_PSTN' || (!twilioSid && !lead?.id) || callStatus === 'IDLE') return;

    const pollInterval = setInterval(async () => {
      try {
        const query = twilioSid ? `callSid=${encodeURIComponent(twilioSid)}` : `leadId=${encodeURIComponent(lead?.id || '')}`;
        const res = await fetch(`/api/voice/twilio/status?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.status === 'in-progress' || data.status === 'answered' || data.status === 'CONNECTED') {
              setCallStatus('CONNECTED');
              callStatusRef.current = 'CONNECTED';
            } else if (data.status === 'ringing' || data.status === 'DIALING' || data.status === 'queued') {
              setCallStatus('RINGING');
              callStatusRef.current = 'RINGING';
            } else if (data.status === 'completed' || data.status === 'failed' || data.status === 'canceled' || data.status === 'COMPLETED') {
              setCallStatus('ENDED');
              callStatusRef.current = 'ENDED';
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('call-completed'));
              }
            }

            if (typeof data.durationSeconds === 'number' && data.durationSeconds > 0) {
              setDuration(data.durationSeconds);
            }

            if (data.sentiment) setCurrentSentiment(data.sentiment);
            if (data.callSummary) setCallSummary(data.callSummary);
            if (data.nextBestAction) setNextBestAction(data.nextBestAction);

            // Sync live dialogue transcript from database directly into modal chat without repeating messages
            if (data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
              setMessages(() => {
                const uniqueMsgs: Message[] = [];
                const seenKeys = new Set<string>();

                for (const t of data.transcript) {
                  const txt = (t.text || t.content || '').trim();
                  if (!txt) continue;
                  const key = `${t.speaker || 'system'}:${txt}`;
                  if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueMsgs.push({
                      speaker: t.speaker === 'agent' ? 'agent' : t.speaker === 'prospect' ? 'prospect' : 'system',
                      text: txt,
                      time: t.time || '00:00',
                      timestamp: t.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      offsetSeconds: t.offsetSeconds ?? 0,
                    });
                  }
                }
                return uniqueMsgs;
              });
            }

            if (data.outcome === 'MEETING_BOOKED') {
              setIsMeetingBooked(true);
              if (!hasTriggeredMeetingSuccessRef.current) {
                hasTriggeredMeetingSuccessRef.current = true;
                onMeetingBookedSuccessRef.current?.();
              }
            } else if (data.outcome === 'DO_NOT_CALL' || data.outcome === 'DND') {
              setIsNegativeDnd(true);
            }
          }
        }
      } catch (_) {}
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isOpen, telephonyMode, twilioSid, lead?.id]);

  // Handle Prospect Speech / User Message directly in console & live call
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isAiThinkingRef.current) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    lastSpokenRef.current = '';
    lastTrackedTextRef.current = '';

    // If on physical Twilio PSTN call, do NOT run browser audio or web calling simulation
    if (telephonyModeRef.current === 'TWILIO_PSTN') {
      const currentOffset = durationRef.current;
      const noteMsg: Message = {
        speaker: 'system',
        text: `Console Note: "${text}" (Physical call active on carrier phone line ${phoneNumber})`,
        time: formatCallTime(currentOffset),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offsetSeconds: currentOffset,
      };
      setMessages((prev) => [...prev, noteMsg]);
      setInputText('');
      return;
    }

    // Stop mic recognition while Ava is responding to prevent self-echo loopback
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    setCallStatus('CONNECTED');
    callStatusRef.current = 'CONNECTED';
    stopSpeech();
    setInputText('');
    setSpeechTranscript('');

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
    isAiThinkingRef.current = true;

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
          phoneNumber: phoneNumber,
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
        const updatedTurnMessages = [...nextMessages, agentMsg];
        setMessages(updatedTurnMessages);

        // Keep CallLog in SQLite synchronized when operating in Twilio mode
        if (telephonyMode === 'TWILIO_PSTN' && twilioSid) {
          fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadId: lead?.id,
              leadName: lead?.name || 'Yash Gohel',
              companyName: lead?.companyName || 'Gohel Infotech Solutions',
              phone: phoneNumber,
              durationSeconds: Math.max(5, durationRef.current),
              messages: updatedTurnMessages.filter((m) => m.speaker === 'agent' || m.speaker === 'prospect'),
              summary: data.summary || callSummary,
              nextBestAction: data.nextBestAction || nextBestAction,
              outcome: data.meetingBooked ? 'MEETING_BOOKED' : 'INTERESTED',
              telephonyProvider: 'TWILIO_VOICE',
              twilioCallSid: twilioSid,
              language: selectedLanguage,
            }),
          }).catch(() => {});
        }

        if (data.sentiment) setCurrentSentiment(data.sentiment);
        if (data.summary) setCallSummary(data.summary);
        if (data.nextBestAction) setNextBestAction(data.nextBestAction);

        if (data.meetingBooked) {
          setIsMeetingBooked(true);
          if (data.googleCalendarUrl) setGoogleCalendarUrl(data.googleCalendarUrl);
          if (data.meetingDisplayStr) setMeetingDisplayStr(data.meetingDisplayStr);
          if (!hasTriggeredMeetingSuccessRef.current) {
            hasTriggeredMeetingSuccessRef.current = true;
            onMeetingBookedSuccessRef.current?.();
          }
          const gcalOffset = durationRef.current;
          setMessages((prev) => [
            ...prev,
            {
              speaker: 'system',
              text: `📅 Google Calendar Event Synced: Meeting reserved for ${data.meetingDisplayStr || 'Thursday at 3:00 PM'}.`,
              time: formatCallTime(gcalOffset),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              offsetSeconds: gcalOffset,
            },
          ]);

          if (data.meetingSmsSent) {
            setHasSentMeetingSms(true);
            if (data.meetingSmsSid) setMeetingSmsSid(data.meetingSmsSid);
            const smsOffset = durationRef.current;
            setMessages((prev) => [
              ...prev,
              {
                speaker: 'system',
                text: `📱 Twilio Meeting Verification SMS Delivered to ${data.meetingSmsPhone || phoneNumber}: "Meeting confirmed at ${data.meetingDisplayStr || 'Thursday at 3:00 PM IST'}" (Twilio SID: ${data.meetingSmsSid || 'PSTN-Carrier'})`,
                time: formatCallTime(smsOffset),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                offsetSeconds: smsOffset,
              },
            ]);
          }
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
          isAiSpeakingRef.current = false;
          setIsAiSpeaking(false);
          if (recognitionRef.current && callStatusRef.current === 'CONNECTED') {
            try {
              recognitionRef.current.lang = getLocaleForVoice(selectedLanguage);
              recognitionRef.current.start();
              setIsMicListening(true);
            } catch (_) {}
          }
        }, selectedLanguage);
      }
    } catch (err) {
      console.error('Call dialogue turn error:', err);
    } finally {
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
    }
  };

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

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

  // Direct Twilio Meeting Verification SMS Dispatch
  const handleSendMeetingVerificationSms = async () => {
    setIsSendingVerificationSms(true);
    try {
      const res = await fetch('/api/voice/sms/verify-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          phone: phoneNumber,
          leadName: lead?.name || 'Carlos Mendez',
          meetingTime: meetingDisplayStr || 'Thursday at 3:00 PM IST',
          language: selectedLanguage,
          meetingUrl: googleCalendarUrl || 'https://meet.google.com/qrs-tuvw-xyz',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasSentMeetingSms(true);
        if (data.messageSid) setMeetingSmsSid(data.messageSid);
        const smsOffset = durationRef.current || duration || 0;
        setMessages((prev) => [
          ...prev,
          {
            speaker: 'system',
            text: `📱 Twilio Meeting Verification SMS Delivered to ${phoneNumber}: "Meeting scheduled for ${meetingDisplayStr || 'Thursday at 3:00 PM IST'}" (SID: ${data.messageSid || 'Twilio-PSTN'})`,
            time: formatCallTime(smsOffset),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            offsetSeconds: smsOffset,
          },
        ]);

        let voiceAnnounce = `I have sent a text message to ${phoneNumber} verifying your scheduled meeting.`;
        if (selectedLanguage === 'हिन्दी') {
          voiceAnnounce = `मैंने ${phoneNumber} पर वेरिफिकेशन SMS भेज दिया है ताकि आप तय की गई मीटिंग का समय देख सकें।`;
        } else if (selectedLanguage === 'ગુજરાતી') {
          voiceAnnounce = `મેં ${phoneNumber} પર વેરિફિકેશન SMS મોકલી દીધો છે જેથી આપ નક્કી કરેલી મીટિંગનો સમય ચકાસી શકો.`;
        }
        speakText(voiceAnnounce, undefined, selectedLanguage);
      }
    } catch (err) {
      console.warn('Manual meeting verification SMS error:', err);
    } finally {
      setIsSendingVerificationSms(false);
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
    // 1. Immediately update status and refs so nothing can speak or listen
    callStatusRef.current = 'ENDED';
    isAiThinkingRef.current = false;
    isAiSpeakingRef.current = false;
    setCallStatus('ENDED');
    setIsAiThinking(false);
    setIsAiSpeaking(false);
    setIsMicListening(false);

    // 2. Clear all browser timers and abort in-flight work
    if (browserSimTimer1Ref.current) clearTimeout(browserSimTimer1Ref.current);
    if (browserSimTimer2Ref.current) clearTimeout(browserSimTimer2Ref.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // 3. Immediately abort speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    // 4. Force stop any speech synthesis or audio streams
    stopSpeech();

    // 5. Hang up Twilio call if in Twilio mode
    if (telephonyMode === 'TWILIO_PSTN' && twilioSid) {
      try {
        await fetch('/api/voice/twilio/hangup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callSid: twilioSid }),
        });
      } catch (_) {}
    }

    const finalDuration = durationRef.current || duration || 0;
    const endMsg: Message = {
      speaker: 'system',
      text: `Call ended. Final duration: ${formatCallTime(finalDuration)}. Conversation saved to Live Call Intelligence & Transcripts.`,
      time: formatCallTime(finalDuration),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offsetSeconds: finalDuration,
    };

    setMessages((prev) => {
      if (prev.some((m) => m.text.startsWith('Call ended.'))) return prev;
      return [...prev, endMsg];
    });

    // Persist conversation to /api/conversations so it immediately appears in the Conversations tab!
    const dialogueTurns = messagesRef.current.filter((m) => m.speaker === 'agent' || m.speaker === 'prospect');
    if (dialogueTurns.length > 0 || (telephonyModeRef.current === 'TWILIO_PSTN' && twilioSid)) {
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
          twilioCallSid: telephonyModeRef.current === 'TWILIO_PSTN' ? (twilioSid || null) : null,
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

  // Re-start / Re-dial
  const handleRestartCall = () => {
    stopSpeech();
    setDuration(0);
    setMessages([]);
    setIsMeetingBooked(false);
    setIsNegativeDnd(false);
    setIsHumanHandoff(false);
    setIsCallbackScheduled(false);
    if (telephonyMode === 'TWILIO_PSTN') {
      handleStartRealCall(phoneNumber, selectedLanguage);
    } else {
      startBrowserCallSimulation(selectedLanguage);
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
                onClick={() => {
                  setTelephonyMode('BROWSER_SIM');
                  telephonyModeRef.current = 'BROWSER_SIM';
                  if (browserSimTimer1Ref.current) clearTimeout(browserSimTimer1Ref.current);
                  if (browserSimTimer2Ref.current) clearTimeout(browserSimTimer2Ref.current);
                  stopSpeech();
                  setDuration(0);
                  setMessages([]);
                  startBrowserCallSimulation(selectedLanguage, phoneNumber);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  telephonyMode === 'BROWSER_SIM'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Direct Website Live AI Voice Call with Duplex Mic & Speaker (Works on all numbers)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Website Live AI Call (Demo)</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-medium">Any Phone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTelephonyMode('TWILIO_PSTN');
                  telephonyModeRef.current = 'TWILIO_PSTN';
                  if (browserSimTimer1Ref.current) clearTimeout(browserSimTimer1Ref.current);
                  if (browserSimTimer2Ref.current) clearTimeout(browserSimTimer2Ref.current);
                  if (recognitionRef.current) {
                    try { recognitionRef.current.stop(); } catch (_) {}
                  }
                  setIsMicListening(false);
                  stopSpeech();
                  setDuration(0);
                  setMessages([]);
                  handleStartRealCall(phoneNumber, selectedLanguage);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  telephonyMode === 'TWILIO_PSTN'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Twilio Cloud Telephony Carrier Calling (75 Min Free Quota)"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Twilio Mobile PSTN</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-400/20 text-indigo-300 font-medium">Physical Call</span>
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

            {/* Quick Solutions Editor Toggle */}
            <button
              type="button"
              onClick={() => setShowSolutionsEditor((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showSolutionsEditor
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-md'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/10'
              }`}
              title="Customize Solutions, Enterprise Offerings & AI Responses"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Edit Solutions</span>
            </button>

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

        {/* Collapsible Solutions & AI Response Editor */}
        {showSolutionsEditor && (
          <div className="p-4 bg-[#0a0f26] border-b border-indigo-500/30 text-xs animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">Live AI Call Solutions &amp; Response Rules</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-semibold">
                  Active in Live Phone &amp; Web Calls
                </span>
              </div>
              <div className="flex items-center gap-2">
                {solutionsSavedSuccess && (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Deployed Live!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveSolutions}
                  disabled={isSavingSolutions}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingSolutions ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  <span>Save Solutions Live</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Company Name</label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#050814] border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs font-medium"
                  placeholder="e.g. CloudScale Solutions"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Company Overview &amp; Value Proposition
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#050814] border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  placeholder="e.g. Enterprise Microsoft 365, SharePoint Migration &amp; Cloud Solutions Provider"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1 text-[11px] flex items-center justify-between">
                  <span>Products, Solutions &amp; Pitch Script (Fed into Groq LLaMA 3.3 70B Live Generation)</span>
                  <span className="text-[10px] text-slate-400">Used for answers, objection handling &amp; qualifying questions</span>
                </label>
                <textarea
                  rows={2}
                  value={editProductsCatalog}
                  onChange={(e) => setEditProductsCatalog(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#050814] border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  placeholder="Enter verified solutions, technical features, pricing approach, or meeting offer..."
                />
              </div>
            </div>
          </div>
        )}

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
            {/* Sleek, Single-Row Utility Toolbar */}
            <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 mb-2.5 shadow-sm">
              {/* Left: Language Selection */}
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Lang:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageSelect(e.target.value as SupportedLanguage)}
                  className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-400 cursor-pointer font-medium"
                  title="Select AI speech & recognition language"
                >
                  <option value="English">🌐 English (US/UK)</option>
                  <option value="हिन्दी">🇮🇳 हिन्दी (Hindi)</option>
                  <option value="ગુજરાતી">🇮🇳 ગુજરાતી (Gujarati)</option>
                  <option value="Español">🇪🇸 Español</option>
                  <option value="Français">🇫🇷 Français</option>
                  <option value="Deutsch">🇩🇪 Deutsch</option>
                  <option value="العربية">🇸🇦 العربية</option>
                </select>
              </div>

              {/* Center: Direct Number Input & 1-Click Shuffle */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1">
                  <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9737362307"
                    disabled={callStatus === 'CONNECTED' || callStatus === 'RINGING' || isDialingTwilio}
                    className="bg-transparent border-none text-white font-mono text-xs focus:outline-none w-32 tracking-wide"
                    title="Enter any destination phone number"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextNum = phoneNumber.includes('9737362307')
                      ? (lead?.phone || '+1 (555) 718-4920')
                      : '+91 9737362307';
                    setPhoneNumber(nextNum);
                    if (telephonyMode === 'TWILIO_PSTN' && nextNum.includes('9737362307')) {
                      handleStartRealCall(nextNum, selectedLanguage);
                    } else if (telephonyMode === 'BROWSER_SIM') {
                      startBrowserCallSimulation(selectedLanguage, nextNum);
                    }
                  }}
                  disabled={callStatus === 'CONNECTED' || callStatus === 'RINGING' || isDialingTwilio}
                  className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                  title="Shuffle between Prospect Phone and Verified Line (+91 9737362307)"
                >
                  <RefreshCw className="w-3 h-3 text-indigo-400" />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* Right: Audio Waveform Equalizer & Direct Meeting Verification SMS Button */}
              <div className="flex items-center gap-2">
                {callStatus === 'CONNECTED' && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px]">
                    <div className="relative flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
                    </div>
                    <span className="text-slate-300 font-medium">
                      {telephonyMode === 'TWILIO_PSTN' ? 'Carrier Call Active' : isAiSpeaking ? 'Ava Speaking' : isMicListening ? 'Listening...' : 'Live Audio'}
                    </span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <span className={`w-0.5 rounded-full bg-emerald-400 transition-all ${isAiSpeaking || isMicListening ? 'h-3.5 animate-pulse' : 'h-1.5'}`} />
                      <span className={`w-0.5 rounded-full bg-indigo-400 transition-all ${isAiSpeaking || isMicListening ? 'h-4.5 animate-pulse' : 'h-2'}`} />
                      <span className={`w-0.5 rounded-full bg-teal-400 transition-all ${isAiSpeaking || isMicListening ? 'h-3 animate-pulse' : 'h-1'}`} />
                    </div>
                  </div>
                )}

                {/* Direct Meeting Verification SMS Button */}
                <button
                  type="button"
                  onClick={handleSendMeetingVerificationSms}
                  disabled={isSendingVerificationSms}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    hasSentMeetingSms
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
                  } disabled:opacity-50`}
                  title="Dispatch Twilio SMS to verify meeting appointment at given time (Free trial SMS)"
                >
                  <MessageSquare className="w-3 h-3 text-indigo-400" />
                  <span>
                    {isSendingVerificationSms
                      ? 'Sending...'
                      : hasSentMeetingSms
                      ? '✓ SMS Verified'
                      : 'Verify by SMS'}
                  </span>
                </button>
              </div>
            </div>

            {/* Google Calendar & Twilio Meeting Verification Synced Banner */}
            {(isMeetingBooked || hasSentMeetingSms) && (
              <div className="mb-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950/60 via-[#0a2318] to-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2 text-xs">
                      <span>Meeting Confirmed &amp; Verified</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {meetingDisplayStr || 'Thursday at 3:00 PM IST'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        📱 SMS Sent to {phoneNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Dispatched via Twilio Trial SMS &bull; Calendar reservation synchronized
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleSendMeetingVerificationSms}
                    disabled={isSendingVerificationSms}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{isSendingVerificationSms ? 'Sending...' : 'Resend SMS'}</span>
                  </button>
                  {googleCalendarUrl && (
                    <a
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Cal</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCalendarModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all border border-zinc-700"
                  >
                    <span>Schedule</span>
                  </button>
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
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-semibold px-1">
                <span>1-Click Evaluation Scenarios:</span>
                <span className="text-indigo-400 text-[10px]">Natural Voice &bull; Objection &bull; DND &bull; Calendar SMS</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {getMultilingualChips(selectedLanguage).map((chip, idx) => {
                  const ChipIcon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip.text)}
                      disabled={callStatus === 'ENDED' || isAiThinking}
                      className={`px-2 py-0.5 rounded-lg ${chip.color} text-[10.5px] sm:text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 hover:scale-[1.02] active:scale-95`}
                    >
                      <ChipIcon className="w-3 h-3" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Microphone Listening Indicator - ONLY in Browser Demo Mode */}
            {isMicListening && telephonyMode === 'BROWSER_SIM' && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between animate-in fade-in shadow-lg shadow-rose-900/20">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <span className="font-bold text-rose-300 shrink-0">Microphone Live:</span>
                  <span className="italic truncate text-white">{speechTranscript || 'Listening... Speak now and text appears live'}</span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono shrink-0 ml-2">Hands-Free Active</span>
              </div>
            )}

            {/* Twilio Carrier Line Active Banner */}
            {telephonyMode === 'TWILIO_PSTN' && callStatus === 'CONNECTED' && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/50 text-indigo-200 text-xs flex items-center justify-between animate-in fade-in shadow-lg shadow-indigo-900/20">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="font-bold text-indigo-300 shrink-0">Mobile Phone Connected:</span>
                  <span className="truncate text-white">Carrier audio active on {phoneNumber}. Speak into mobile handset — conversation syncs live below.</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-2">PSTN Live</span>
              </div>
            )}

            {/* Input Bar: Hands-Free Microphone + Text Typing */}
            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                disabled={callStatus === 'ENDED' || telephonyMode === 'TWILIO_PSTN'}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  telephonyMode === 'TWILIO_PSTN'
                    ? 'bg-white/[0.03] text-slate-500 border-white/5 opacity-40 cursor-not-allowed'
                    : isMicListening
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/10'
                } disabled:opacity-40`}
                title={
                  telephonyMode === 'TWILIO_PSTN'
                    ? 'Microphone is disabled during Twilio calls. Speak into your mobile phone.'
                    : isMicListening
                    ? 'Stop listening'
                    : 'Start speaking with microphone'
                }
              >
                {isMicListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    telephonyMode === 'TWILIO_PSTN'
                      ? callStatus === 'CONNECTED'
                        ? 'Phone call live. Speak into your mobile handset...'
                        : 'Twilio Carrier Mode active. Dial or answer physical call...'
                      : isMicListening
                      ? 'Listening to your speech...'
                      : callStatus === 'ENDED'
                      ? 'Call ended. Click Dial or Re-dial to call again.'
                      : 'Speak into mic or type prospect reply here (Enter to send)...'
                  }
                  disabled={callStatus === 'ENDED' || isAiThinking}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-400 disabled:opacity-50"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={callStatus === 'ENDED' || !inputText.trim() || isAiThinking}
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

              {/* Twilio Free SMS & Appointment Verification Card */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    Twilio Free SMS &amp; Verification
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      hasSentMeetingSms
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : calendlyLinkSent
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {hasSentMeetingSms ? '✓ SMS VERIFIED' : calendlyLinkSent ? 'LINK SENT' : '100 FREE SMS'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-black/40 p-2 rounded-lg border border-white/[0.06]">
                  {hasSentMeetingSms
                    ? `Appointment confirmation SMS delivered to ${phoneNumber}. Meeting time verified!`
                    : calendlyLinkSent
                    ? 'Calendly timeslot booking link delivered via Twilio SMS.'
                    : 'When you schedule or confirm a meeting, an instant verification SMS is automatically sent to the phone number to confirm the appointment.'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSendingVerificationSms}
                    onClick={handleSendMeetingVerificationSms}
                    className="py-1.5 px-2 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    title="Send instant appointment verification SMS via Twilio to confirm meeting"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{isSendingVerificationSms ? 'Sending...' : 'Verify by SMS'}</span>
                  </button>

                  {!calendlyLinkSent ? (
                    <button
                      type="button"
                      disabled={isSendingCalendlySms}
                      onClick={handleSendCalendlySmsManually}
                      className="py-1.5 px-2 rounded-lg bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      title="Send Calendly link SMS"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{isSendingCalendlySms ? 'Sending...' : 'Send Calendly'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCalendlyModal(true)}
                      className="py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Calendly View</span>
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
            if (!hasTriggeredMeetingSuccessRef.current) {
              hasTriggeredMeetingSuccessRef.current = true;
              onMeetingBookedSuccessRef.current?.();
            }
          }}
          onTriggerRedial={(script) => {
            handleTriggerRedial(script);
          }}
        />
      )}

      {/* Google Calendar Hub Modal */}
      <GoogleCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        initialLead={lead}
      />
    </div>
  );
}
