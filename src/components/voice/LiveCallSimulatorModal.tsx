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
  Clock,
  Globe2,
  AlertCircle,
  Loader2,
  Lock,
  Timer,
  AlertTriangle,
  Mic,
  MicOff,
  Keyboard,
  Minimize2,
} from 'lucide-react';
import { LeadItem } from '../discovery/DiscoveredLeadCard';
import {
  getTranslation,
  getLocaleForVoice,
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
  onMinimize?: () => void;
  onMeetingBookedSuccess?: () => void;
  defaultLanguage?: string;
}

const CALL_LIMIT_SECONDS = 180; // 3 Minutes (180 seconds) telecom qualification limit

export default function LiveCallSimulatorModal({
  lead,
  isOpen,
  onClose,
  onMinimize,
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
  // Real Call Flow: Zero buttons. Ava asks by voice, user speaks, language is locked immediately.
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // 100% Hands-Free Microphone State
  const [isMicListening, setIsMicListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [inputMode, setInputMode] = useState<'mic' | 'keyboard'>('mic');

  const [callSummary, setCallSummary] = useState(
    'Evaluating requirement fit, timeline, and decision maker authority...'
  );
  const [nextBestAction, setNextBestAction] = useState(
    'Qualify company rollout scale and propose solutions demo.'
  );
  const [isTriggeringRealCall, setIsTriggeringRealCall] = useState(false);
  const [realCallNotice, setRealCallNotice] = useState<string | null>(null);

  // State synchronization refs for event listeners and timers
  const callStatusRef = useRef<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const isAiSpeakingRef = useRef<boolean>(false);
  const isAiThinkingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const inputModeRef = useRef<'mic' | 'keyboard'>('mic');
  const isLanguageSelectedRef = useRef<boolean>(false);
  const selectedLanguageRef = useRef<SupportedLanguage>((defaultLanguage as SupportedLanguage) || 'English');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const currentLeadIdRef = useRef<string | null>(null);
  const isOpenRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const durationRef = useRef<number>(0);
  const messagesRef = useRef<Message[]>([]);
  const leadRef = useRef(lead);

  // Turn-taking atomic lock: Prevents duplicate messages from being submitted
  const isSubmittingSpeechRef = useRef<boolean>(false);

  // 3-Minute Limit Guard: Strictly guarantees wrapup logic and audio trigger only once
  const isLimitHandledRef = useRef<boolean>(false);
  // Abort controller for in-flight /api/voice/call network requests
  const callAbortControllerRef = useRef<AbortController | null>(null);

  // Cross-reference handles to prevent stale closures across async timeouts and recognition callbacks
  const startListeningRef = useRef<() => void>(() => {});
  const stopListeningAndSendRef = useRef<(overrideText?: string) => void>(() => {});
  const handleSendProspectMessageRef = useRef<(text: string) => Promise<void>>(async () => {});
  const speakTextRef = useRef<(text: string, lang?: string, isWrapup?: boolean) => void>(() => {});

  // Immediate synchronous sync of refs in render
  callStatusRef.current = callStatus;
  isAiSpeakingRef.current = isAiSpeaking;
  isAiThinkingRef.current = isAiThinking;
  isMutedRef.current = isMuted;
  inputModeRef.current = inputMode;
  isLanguageSelectedRef.current = isLanguageSelected;
  selectedLanguageRef.current = selectedLanguage;
  durationRef.current = duration;
  messagesRef.current = messages;
  leadRef.current = lead;

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    isAiThinkingRef.current = isAiThinking;
  }, [isAiThinking]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    inputModeRef.current = inputMode;
  }, [inputMode]);

  useEffect(() => {
    isLanguageSelectedRef.current = isLanguageSelected;
  }, [isLanguageSelected]);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

  const t = getTranslation(selectedLanguage);
  const quickReplies = getQuickReplies(selectedLanguage);
  const remainingSeconds = Math.max(0, CALL_LIMIT_SECONDS - duration);
  const isApproachingLimit = callStatus === 'CONNECTED' && remainingSeconds > 0 && remainingSeconds <= 25;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // 1. Hands-Free Microphone Engine (Automatic Voice Activity Detection)
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (callStatusRef.current !== 'CONNECTED') return;
    if (isAiSpeakingRef.current || isAiThinkingRef.current) return;
    if (isSubmittingSpeechRef.current) return;
    if (isMutedRef.current) return;
    if (inputModeRef.current !== 'mic') return;

    const SpeechConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechConstructor) {
      console.warn('Web Speech Recognition API not available on this browser.');
      setInputMode('keyboard');
      return;
    }

    try {
      if (recognitionRef.current) {
        const existing = recognitionRef.current;
        recognitionRef.current = null;
        existing.onresult = null;
        existing.onend = null;
        existing.onerror = null;
        try {
          existing.abort();
        } catch (_) {}
      }

      const recognition = new SpeechConstructor();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;

      // Locale: If language already selected/locked, use that locale (e.g. hi-IN for Hindi).
      // If language not locked yet, use default en-US/en-IN to capture prospect's spoken preference.
      const currentLockedLang = selectedLanguageRef.current;
      recognition.lang = isLanguageSelectedRef.current
        ? getLocaleForVoice(currentLockedLang)
        : 'en-US';

      recognition.onstart = () => {
        setIsMicListening(true);
      };

      recognition.onresult = (event: any) => {
        // If already submitting turn, ignore subsequent recognition results
        if (isSubmittingSpeechRef.current) return;

        // Collect full transcript across all continuous parts to prevent dropped words
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        const currentText = fullTranscript.trim();
        if (currentText) {
          latestTranscriptRef.current = currentText;
          setSpeechTranscript(currentText);

          // Reset silence timer on each spoken word
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Real phone call silence detection: 1.8s of sustained pause allows the user
          // to finish their complete sentence and breathe without Ava cutting in prematurely.
          silenceTimeoutRef.current = setTimeout(() => {
            stopListeningAndSendRef.current(currentText);
          }, 1800);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser.');
          setIsMicListening(false);
        } else if (event.error === 'audio-capture') {
          setErrorMessage('No microphone detected. Please connect a microphone or use keyboard.');
          setIsMicListening(false);
        } else if (event.error !== 'no-speech') {
          console.warn('Speech recognition notice:', event.error);
        }
      };

      recognition.onend = () => {
        setIsMicListening(false);
        // Do not auto-restart if we are already submitting speech or Ava is speaking/thinking
        if (
          isSubmittingSpeechRef.current ||
          isAiSpeakingRef.current ||
          isAiThinkingRef.current ||
          callStatusRef.current !== 'CONNECTED' ||
          !isOpenRef.current
        ) {
          return;
        }

        // Keep phone line open continuously if prospect is still in their turn
        if (!isMutedRef.current && inputModeRef.current === 'mic') {
          setTimeout(() => {
            if (
              isOpenRef.current &&
              callStatusRef.current === 'CONNECTED' &&
              !isAiSpeakingRef.current &&
              !isAiThinkingRef.current &&
              !isSubmittingSpeechRef.current &&
              !isMutedRef.current &&
              inputModeRef.current === 'mic'
            ) {
              startListeningRef.current();
            }
          }, 250);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Microphone start error:', err);
      setIsMicListening(false);
    }
  }, []);

  startListeningRef.current = startListening;

  const stopListeningAndSend = useCallback((overrideText?: string) => {
    // 1. Guard against duplicate submissions
    if (isSubmittingSpeechRef.current || isAiSpeakingRef.current || isAiThinkingRef.current) {
      return;
    }

    // 2. Clear any pending silence timer
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // 3. Immediately disarm speech recognition so NO lingering events can fire
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch (_) {}
    }
    setIsMicListening(false);

    // 4. Resolve the text to send
    const toSend = (overrideText || latestTranscriptRef.current || speechTranscript).trim();
    latestTranscriptRef.current = '';
    setSpeechTranscript('');

    if (!toSend) {
      return;
    }

    // 5. ATOMIC LOCK: Mark as submitting so nothing else can trigger a send
    isSubmittingSpeechRef.current = true;
    handleSendProspectMessageRef.current(toSend);
  }, [speechTranscript]);

  stopListeningAndSendRef.current = stopListeningAndSend;

  const cancelListening = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch (_) {}
    }
    setIsMicListening(false);
    latestTranscriptRef.current = '';
    setSpeechTranscript('');
    isSubmittingSpeechRef.current = false;
  }, []);

  // Stop and cancel all ongoing speech and audio hardware/synthesis immediately
  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        const audio = audioRef.current;
        audioRef.current = null;
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      } catch (_) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
  }, []);

  // 2. Universal Speech Synthesis with Turn-Taking Transition
  const speakText = useCallback(
    (text: string, lang: string = selectedLanguageRef.current, isWrapup: boolean = false) => {
      // If call is already ENDED and this is not the wrapup speech or a deliberate user replay, do not play
      if (callStatusRef.current === 'ENDED' && !isWrapup) {
        return;
      }

      // Immediately silence any previous ongoing audio playback
      stopAllAudio();

      // Mute microphone while Ava speaks to prevent self-echo
      if (recognitionRef.current) {
        const rec = recognitionRef.current;
        recognitionRef.current = null;
        rec.onresult = null;
        rec.onend = null;
        rec.onerror = null;
        try {
          rec.abort();
        } catch (_) {}
      }
      setIsMicListening(false);
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;

      const handleSpeechEnded = () => {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        audioRef.current = null;

        // Release submit lock when Ava finishes her turn so prospect can speak
        isSubmittingSpeechRef.current = false;

        // Turn-Taking: Microphone automatically re-opens for prospect when Ava finishes speaking!
        if (
          isOpenRef.current &&
          callStatusRef.current === 'CONNECTED' &&
          !isLimitHandledRef.current &&
          !isMutedRef.current &&
          inputModeRef.current === 'mic'
        ) {
          setTimeout(() => {
            if (
              isOpenRef.current &&
              callStatusRef.current === 'CONNECTED' &&
              !isLimitHandledRef.current &&
              !isAiSpeakingRef.current &&
              !isAiThinkingRef.current &&
              !isMutedRef.current &&
              inputModeRef.current === 'mic'
            ) {
              startListeningRef.current();
            }
          }, 400);
        }
      };

      try {
        const audioUrl = `/api/voice/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = audioUrl;
        audioRef.current = audio;

        audio.onplay = () => {
          setIsAiSpeaking(true);
          isAiSpeakingRef.current = true;
        };
        audio.onended = () => {
          if (callStatusRef.current === 'ENDED' && !isWrapup) return;
          handleSpeechEnded();
        };
        audio.onerror = (err) => {
          // If audio src was cleared or call was ended without wrapup, do not trigger fallback
          if (!audio.src || audio.src === window.location.href || (callStatusRef.current === 'ENDED' && !isWrapup)) {
            return;
          }
          console.warn('Neural audio error, fallback to browser speech:', err);
          fallbackBrowserSpeak(text, lang, handleSpeechEnded, isWrapup);
        };

        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err: any) => {
            if (err?.name === 'AbortError' || !audio.src || (callStatusRef.current === 'ENDED' && !isWrapup)) {
              return;
            }
            console.warn('Autoplay blocked, fallback to browser speech:', err);
            fallbackBrowserSpeak(text, lang, handleSpeechEnded, isWrapup);
          });
        }
      } catch (err) {
        console.warn('Audio object error, fallback to browser speech:', err);
        fallbackBrowserSpeak(text, lang, handleSpeechEnded, isWrapup);
      }
    },
    [stopAllAudio]
  );

  speakTextRef.current = speakText;

  const fallbackBrowserSpeak = (
    text: string,
    lang: string,
    onEndCallback?: () => void,
    isWrapup: boolean = false
  ) => {
    if (callStatusRef.current === 'ENDED' && !isWrapup) {
      if (onEndCallback) onEndCallback();
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}

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

      utterance.onstart = () => {
        setIsAiSpeaking(true);
        isAiSpeakingRef.current = true;
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        isSubmittingSpeechRef.current = false;
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = (e: any) => {
        if (e?.error === 'canceled' || e?.error === 'interrupted') {
          return;
        }
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
        isSubmittingSpeechRef.current = false;
        if (onEndCallback) onEndCallback();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      isSubmittingSpeechRef.current = false;
      if (onEndCallback) onEndCallback();
    }
  };

  // 3-Minute Limit Wrapup: Cleanly terminates ongoing response and speaks only final wrapup message
  const triggerCallLimitWrapup = useCallback(() => {
    // Strictly execute only once per call session
    if (isLimitHandledRef.current) return;
    isLimitHandledRef.current = true;

    // 1. Terminate timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 2. Abort any in-flight /api/voice/call request
    if (callAbortControllerRef.current) {
      try {
        callAbortControllerRef.current.abort();
      } catch (_) {}
      callAbortControllerRef.current = null;
    }

    // 3. Immediately hard-stop and silence any ongoing agent voice (ElevenLabs or SpeechSynthesis)
    stopAllAudio();

    // 4. Cancel active microphone listening, clear silence timers, and lock submission
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch (_) {}
    }
    setIsMicListening(false);
    latestTranscriptRef.current = '';
    setSpeechTranscript('');
    isSubmittingSpeechRef.current = true; // Permanently prevent user mic auto-opening
    setIsAiThinking(false);
    isAiThinkingRef.current = false;

    // 5. Update call status and limit reached states
    setCallStatus('ENDED');
    callStatusRef.current = 'ENDED';
    setIsLimitReached(true);

    // 6. Append wrapup message EXACTLY ONCE to messages
    const currentLang = selectedLanguageRef.current;
    const wrapupText = getCallLimitWrapupSpeech(currentLang);
    const wrapupMsg: Message = {
      speaker: 'agent',
      text: wrapupText,
      timestamp: formatTime(CALL_LIMIT_SECONDS),
    };

    const updated = [...messagesRef.current, wrapupMsg];
    messagesRef.current = updated;
    setMessages(updated);

    // 7. Small buffer before speaking wrapup to ensure previous audio buffer is flushed
    setTimeout(() => {
      if (!isOpenRef.current) return;
      speakTextRef.current(wrapupText, currentLang, true);
    }, 60);
  }, [stopAllAudio]);

  // 3. Spoken Language Detection & Permanent Lock
  const handleSelectCallLanguage = useCallback((lang: SupportedLanguage, spokenText?: string) => {
    if (isLanguageSelectedRef.current || callStatusRef.current !== 'CONNECTED') {
      isSubmittingSpeechRef.current = false;
      return;
    }

    // Immediately lock language synchronously in refs and state
    isLanguageSelectedRef.current = true;
    selectedLanguageRef.current = lang;
    setIsLanguageSelected(true);
    setSelectedLanguage(lang);

    const currentLead = leadRef.current;
    if (!currentLead) return;

    const firstName = currentLead.name ? currentLead.name.split(' ')[0] : 'there';

    // Fully localized topic phrase so no English string gets spliced in
    let requirementTopic = 'your public requirement';
    if (currentLead.companyName) {
      switch (lang) {
        case 'हिन्दी':
          requirementTopic = `${currentLead.companyName} में आपकी सक्रिय व्यावसायिक आवश्यकता`;
          break;
        case 'Español':
          requirementTopic = `su requerimiento activo en ${currentLead.companyName}`;
          break;
        case 'Français':
          requirementTopic = `votre besoin chez ${currentLead.companyName}`;
          break;
        case 'Deutsch':
          requirementTopic = `Ihre geschäftliche Anforderung bei ${currentLead.companyName}`;
          break;
        case 'العربية':
          requirementTopic = `متطلباتكم في ${currentLead.companyName}`;
          break;
        case 'English':
        default:
          requirementTopic = `your active requirement at ${currentLead.companyName}`;
          break;
      }
    }

    // 1. Prospect's recognized response
    const userChoiceMessage: Message = {
      speaker: 'prospect',
      text: spokenText || (lang === 'हिन्दी'
        ? 'मैं हिन्दी में बात करना पसंद करूँगा।'
        : lang === 'Español'
        ? 'Prefiero hablar en español.'
        : lang === 'Français'
        ? 'Je préfère parler en français.'
        : lang === 'Deutsch'
        ? 'Ich spreche lieber auf Deutsch.'
        : lang === 'العربية'
        ? 'أفضل التحدث باللغة العربية.'
        : "I'd prefer to speak in English."),
      timestamp: formatTime(durationRef.current),
    };

    // 2. Ava confirms in selected language and transitions to sales pitch
    const confirmationSpeech = getLanguageConfirmationSpeech(
      lang,
      firstName,
      currentLead.companyName,
      requirementTopic
    );

    const agentConfirmMessage: Message = {
      speaker: 'agent',
      text: confirmationSpeech,
      timestamp: formatTime(durationRef.current + 1),
    };

    const updatedMessages = [...messagesRef.current, userChoiceMessage, agentConfirmMessage];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);

    // Keep submit lock active while Ava speaks the confirmation
    isSubmittingSpeechRef.current = true;
    speakTextRef.current(confirmationSpeech, lang);
  }, []);

  // 4. Send Message to AI Agent (Auto-called by voice or keyboard)
  const handleSendProspectMessage = useCallback(async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (
      !trimmed ||
      callStatusRef.current !== 'CONNECTED' ||
      isAiThinkingRef.current ||
      isLimitHandledRef.current
    ) {
      isSubmittingSpeechRef.current = false;
      return;
    }

    // Ensure submit lock is active
    isSubmittingSpeechRef.current = true;

    // STEP 1: If language has not been selected yet, detect from prospect's speech!
    if (!isLanguageSelectedRef.current) {
      const lower = trimmed.toLowerCase();
      let matchedLang: SupportedLanguage = 'English';

      if (
        /[\u0900-\u097F]/.test(trimmed) ||
        /\b(hindi|हिन्दी|हिंदी|hind|hnd|india|namaste|theek|haan)\b/i.test(lower) ||
        lower.includes('hindi') ||
        lower.includes('हिंदी') ||
        lower.includes('हिन्दी')
      ) {
        matchedLang = 'हिन्दी';
      } else if (
        /\b(spanish|español|espanol|hablo|hola|si)\b/i.test(lower) ||
        lower.includes('spanish') ||
        lower.includes('español')
      ) {
        matchedLang = 'Español';
      } else if (
        /\b(french|français|francais|bonjour|oui)\b/i.test(lower) ||
        lower.includes('french') ||
        lower.includes('français')
      ) {
        matchedLang = 'Français';
      } else if (
        /\b(german|deutsch|hallo|ja)\b/i.test(lower) ||
        lower.includes('german') ||
        lower.includes('deutsch')
      ) {
        matchedLang = 'Deutsch';
      } else if (
        /[\u0600-\u06FF]/.test(trimmed) ||
        /\b(arabic|arabi|marhaba|naam)\b/i.test(lower) ||
        lower.includes('arabic') ||
        lower.includes('عربي')
      ) {
        matchedLang = 'العربية';
      } else if (lower.includes('english') || lower.includes('angrezi')) {
        matchedLang = 'English';
      }

      handleSelectCallLanguage(matchedLang, trimmed);
      return;
    }

    const userMsg: Message = {
      speaker: 'prospect',
      text: trimmed,
      timestamp: formatTime(durationRef.current),
    };

    const newHistory = [...messagesRef.current, userMsg];
    messagesRef.current = newHistory;
    setMessages(newHistory);
    setInputText('');
    setIsAiThinking(true);
    isAiThinkingRef.current = true;
    setErrorMessage(null);

    // Track request via AbortController so it can be terminated immediately on 3-minute limit
    const abortController = new AbortController();
    callAbortControllerRef.current = abortController;

    try {
      const currentLead = leadRef.current;
      const res = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          leadId: currentLead?.id,
          messages: newHistory.map((m) => ({
            role: m.speaker === 'agent' ? 'assistant' : 'user',
            content: m.text,
          })),
          prospectSpeech: trimmed,
          language: selectedLanguageRef.current, // Locked language strictly enforced
        }),
      });

      // If call limit was reached or call ended while waiting for network, drop response immediately
      if (
        isLimitHandledRef.current ||
        callStatusRef.current !== 'CONNECTED' ||
        !isOpenRef.current
      ) {
        isSubmittingSpeechRef.current = false;
        return;
      }

      const data = await res.json();

      // Guard check again after JSON parsing
      if (
        isLimitHandledRef.current ||
        callStatusRef.current !== 'CONNECTED' ||
        !isOpenRef.current
      ) {
        isSubmittingSpeechRef.current = false;
        return;
      }

      if (res.ok && data.success && data.reply) {
        const agentReply: Message = {
          speaker: 'agent',
          text: data.reply,
          timestamp: formatTime(durationRef.current + 2),
        };
        const updatedWithAgent = [...messagesRef.current, agentReply];
        messagesRef.current = updatedWithAgent;
        setMessages(updatedWithAgent);
        speakTextRef.current(agentReply.text, selectedLanguageRef.current);

        if (data.meetingBooked) {
          setIsMeetingBooked(true);
          setCallSummary(
            data.summary ||
              `Qualified: requirement verified. Budget approved, ${currentLead?.jobTitle || 'Decision maker'} confirmed.`
          );
          setNextBestAction(data.nextBestAction || 'Send case study, confirm Thursday 3 PM demo.');
          onMeetingBookedSuccess?.();
        }
      } else {
        setErrorMessage(data?.error || 'Voice response could not be generated. Please retry.');
        isSubmittingSpeechRef.current = false;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Aborted intentionally when 3:00 limit was reached or user hung up
        return;
      }
      setErrorMessage(err?.message || 'Network error communicating with AI voice agent.');
      isSubmittingSpeechRef.current = false;
    } finally {
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
    }
  }, [handleSelectCallLanguage, onMeetingBookedSuccess]);

  handleSendProspectMessageRef.current = handleSendProspectMessage;

  // 5. Initial Call Lifecycle: Rings 1.8s then Ava asks for language by VOICE ONLY
  useEffect(() => {
    if (isOpen && lead) {
      if (!isOpenRef.current || currentLeadIdRef.current !== lead.id) {
        isOpenRef.current = true;
        currentLeadIdRef.current = lead.id;
        isLimitHandledRef.current = false;
        if (callAbortControllerRef.current) {
          try {
            callAbortControllerRef.current.abort();
          } catch (_) {}
          callAbortControllerRef.current = null;
        }
        stopAllAudio();
        const initialLang = (defaultLanguage as SupportedLanguage) || 'English';
        setSelectedLanguage(initialLang);
        setIsLanguageSelected(false);
        setIsLimitReached(false);
        setCallStatus('RINGING');
        setDuration(0);
        setIsMeetingBooked(false);
        setErrorMessage(null);
        setIsMuted(false);
        setInputMode('mic');
        setCallSummary('Evaluating requirement fit, timeline, and decision maker authority...');
        setNextBestAction('Qualify company rollout scale and propose solutions demo.');

        // Ring for 1.8 seconds then connect
        const ringTimer = setTimeout(() => {
          setCallStatus('CONNECTED');
          callStatusRef.current = 'CONNECTED';

          // REAL CALL: Ava asks by VOICE ONLY. No buttons shown to user.
          const chooseLangPrompt =
            "Hello! Before we begin our conversation, which language are you most comfortable with for today's call? You can say Hindi, English, Spanish, or whichever you prefer.";

          const initialAiQuestion: Message = {
            speaker: 'agent',
            text: chooseLangPrompt,
            timestamp: '00:02',
          };
          messagesRef.current = [initialAiQuestion];
          setMessages([initialAiQuestion]);
          speakTextRef.current(chooseLangPrompt, 'English');
        }, 1800);

        return () => clearTimeout(ringTimer);
      }
    } else if (!isOpen) {
      isOpenRef.current = false;
      currentLeadIdRef.current = null;
      isLimitHandledRef.current = false;
      if (callAbortControllerRef.current) {
        try {
          callAbortControllerRef.current.abort();
        } catch (_) {}
        callAbortControllerRef.current = null;
      }
      setMessages([]);
      messagesRef.current = [];
      setIsLanguageSelected(false);
      isLanguageSelectedRef.current = false;
      setIsLimitReached(false);
      setCallStatus('RINGING');
      callStatusRef.current = 'RINGING';
      setDuration(0);
      durationRef.current = 0;
      setErrorMessage(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      stopAllAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }
      setIsMicListening(false);
      latestTranscriptRef.current = '';
      setSpeechTranscript('');
      isSubmittingSpeechRef.current = false;
    }
  }, [isOpen, lead?.id, defaultLanguage, speakText, stopAllAudio]);

  // Duration Timer & Call Limit Enforcement (3:00 Max)
  useEffect(() => {
    if (callStatus === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        if (callStatusRef.current !== 'CONNECTED' || isLimitHandledRef.current) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        const next = durationRef.current + 1;
        durationRef.current = next;
        setDuration(next);

        if (next >= CALL_LIMIT_SECONDS) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          triggerCallLimitWrapup();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus, triggerCallLimitWrapup]);

  // Auto-scroll chat transcript
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiSpeaking, isAiThinking]);

  // End Call & Mute Handlers
  const handleEndCall = () => {
    isLimitHandledRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (callAbortControllerRef.current) {
      try {
        callAbortControllerRef.current.abort();
      } catch (_) {}
      callAbortControllerRef.current = null;
    }
    setCallStatus('ENDED');
    callStatusRef.current = 'ENDED';
    stopAllAudio();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsMicListening(false);
    latestTranscriptRef.current = '';
    setSpeechTranscript('');
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    isSubmittingSpeechRef.current = false;
  };

  const toggleMute = () => {
    if (!isMuted) {
      setIsMuted(true);
      isMutedRef.current = true;
      cancelListening();
    } else {
      setIsMuted(false);
      isMutedRef.current = false;
      if (!isAiSpeakingRef.current && !isAiThinkingRef.current && callStatusRef.current === 'CONNECTED') {
        startListeningRef.current();
      }
    }
  };

  const handleTriggerRealCall = async () => {
    if (!lead) return;
    setIsTriggeringRealCall(true);
    setRealCallNotice('Connecting Twilio telecom network to +91 97373 62307...');
    try {
      const res = await fetch('/api/telephony/outbound-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: lead.name,
          companyName: lead.companyName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRealCallNotice('📲 Phone call ringing right now on +91 97373 62307! Please answer your mobile phone.');
      } else {
        setRealCallNotice(`Twilio Notice: ${data.error || 'Check Twilio credentials'}`);
      }
    } catch (err: any) {
      setRealCallNotice('Network error dialing Twilio');
    } finally {
      setIsTriggeringRealCall(false);
      setTimeout(() => setRealCallNotice(null), 9000);
    }
  };

  if (!isOpen || !lead) return null;

  const progressPercent = Math.min(100, (duration / CALL_LIMIT_SECONDS) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl glass-card rounded-2xl border border-slate-200/90 dark:border-indigo-500/30 bg-white/95 dark:bg-[#090d22] text-slate-900 dark:text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Top Call Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-purple-50/70 dark:from-blue-950/70 dark:via-indigo-950/70 dark:to-purple-950/70 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                <Bot className="w-5 h-5 text-white" />
              </div>
              {callStatus === 'CONNECTED' && (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#090d22]"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                  {t.voiceSimulatorTitle}
                </h2>

                {callStatus === 'CONNECTED' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    {t.connectedStatus.toUpperCase()} • {formatTime(duration)}
                  </span>
                )}

                {callStatus === 'RINGING' && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                    {t.ringingStatus}
                  </span>
                )}

                {callStatus === 'ENDED' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      isLimitReached
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                        : 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/30'
                    }`}
                  >
                    {isLimitReached ? t.callLimitReached : 'CALL ENDED'}
                  </span>
                )}

                {/* Call Limit Display Badge */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                    isApproachingLimit
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
                      : isLimitReached
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>
                    {isLimitReached
                      ? 'Limit 3:00 Reached'
                      : `${t.timeLeftLabel}: ${formatTime(remainingSeconds)} / 03:00`}
                  </span>
                </div>

                {/* Locked Language Status */}
                {isLanguageSelected && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{selectedLanguage} (Locked)</span>
                  </span>
                )}
              </div>

              <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-0.5">
                {t.outboundCallTo} <span className="font-semibold text-slate-900 dark:text-white">{lead.name}</span> ({lead.jobTitle} at {lead.companyName}) • <span className="font-mono text-slate-700 dark:text-slate-300">{lead.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Real Telecom Calling Button via Twilio */}
            <button
              type="button"
              onClick={handleTriggerRealCall}
              disabled={isTriggeringRealCall}
              title="Ring Yash's verified phone number (+91 97373 62307) live over telecom"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isTriggeringRealCall ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{isTriggeringRealCall ? 'Dialing...' : 'Dial Real Phone 📲'}</span>
            </button>

            {callStatus === 'CONNECTED' && (
              <>
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isMuted
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30 cursor-pointer active:scale-95"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> {t.endCallBtn}
                </button>
              </>
            )}
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                aria-label="Minimize Call to Floating HUD"
                title="Minimize call to floating widget (keep browsing)"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close Live Call dialog"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Telecom Calling Status Banner */}
        {realCallNotice && (
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-950 border-b border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              <span className="font-semibold">{realCallNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setRealCallNotice(null)}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-900 dark:hover:text-white cursor-pointer font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Call Limit Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-white/[0.05] h-1.5 relative overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isLimitReached
                ? 'bg-rose-500'
                : isApproachingLimit
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Real-Time Phone Call Stream */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#070b1e]">
            {/* Live Call Header Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] mb-3 text-xs shadow-sm">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Live Call • {lead.companyName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1">
                  {isLanguageSelected && <Lock className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />}
                  {isLanguageSelected ? selectedLanguage : 'Detecting Language...'}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
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
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-sm shadow-indigo-600/30">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[84%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                        isAgent
                          ? 'bg-white dark:bg-[#141b3c] border border-slate-200 dark:border-indigo-500/30 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] opacity-75 mb-1.5 font-semibold">
                        <span>{isAgent ? t.aiSalesAgentLabel : lead.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span>{msg.timestamp}</span>
                          {isAgent && (
                            <button
                              type="button"
                              onClick={() => speakText(msg.text, selectedLanguage, true)}
                              title="Listen / Replay Voice (आवाज़ दोबारा सुनें)"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-white transition-all cursor-pointer flex items-center gap-0.5"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="font-normal">{msg.text}</p>
                    </div>
                    {!isAgent && (
                      <div className="w-7 h-7 rounded-lg bg-slate-600 dark:bg-slate-700 flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-sm">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Approaching Limit Notification in Transcript */}
              {isApproachingLimit && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-medium">{t.approachingLimitWarning} ({remainingSeconds}s remaining). Wrapping up qualification...</span>
                </div>
              )}

              {/* Call Limit Reached Notification */}
              {isLimitReached && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="font-medium">{t.callLimitReached}. Follow-up invitation emailed to prospect.</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-500/30 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/50">
                    Max 3:00
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-white underline cursor-pointer shrink-0 font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 100% Hands-Free Live Phone Call Status Console */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.06] mt-2 space-y-2.5">
              {/* Dynamic Conversational State Banner */}
              {isAiSpeaking ? (
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/40">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Ava is speaking...</div>
                      <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                        Listening in {selectedLanguage} (Microphone will automatically open when Ava finishes)
                      </div>
                    </div>
                  </div>
                  {/* Glowing Soundwave Bars */}
                  <div className="flex items-center gap-1 pr-2">
                    <span className="w-1 h-3.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-6 bg-indigo-600 dark:bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 h-7 bg-indigo-600 dark:bg-indigo-200 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                    <span className="w-1 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
                  </div>
                </div>
              ) : isAiThinking ? (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/40 flex items-center gap-3 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Ava is formulating response...</div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Analyzing requirement and preparing reply in {selectedLanguage}</div>
                  </div>
                </div>
              ) : callStatus === 'CONNECTED' ? (
                /* Prospect's Turn: Live Microphone is Open */
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/70 dark:via-[#0a1f18] dark:to-teal-950/70 border border-emerald-200 dark:border-emerald-500/40 space-y-2 animate-in fade-in shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>
                        {!isLanguageSelected
                          ? 'Microphone Live • Speak your preferred language (e.g. "Hindi", "English")'
                          : `Microphone Live • Speak naturally in ${selectedLanguage}`}
                      </span>
                    </div>

                    {/* Active Voice Waveform */}
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-2.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      <span className="w-1 h-3.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                    </div>
                  </div>

                  {/* Real-Time Live Speech Preview */}
                  <div className="bg-white dark:bg-[#060a17] p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs min-h-[46px] text-slate-900 dark:text-white flex items-center justify-between gap-3 shadow-inner">
                    <span className={speechTranscript ? 'text-emerald-700 dark:text-emerald-300 font-semibold text-xs tracking-wide' : 'text-slate-500 dark:text-slate-400 italic text-xs'}>
                      {speechTranscript
                        ? `"${speechTranscript}"`
                        : !isLanguageSelected
                        ? 'Ava is listening... Speak your preferred language (e.g. "Hindi", "English")'
                        : `Ava is listening... Speak your thought naturally (Ava waits for complete sentence)`}
                    </span>
                    {speechTranscript ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                          Listening...
                        </span>
                        <button
                          type="button"
                          onClick={() => stopListeningAndSend(speechTranscript)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          title="Send immediately without waiting for pause"
                        >
                          <span>Send Now</span>
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        Patient Listening Active
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Auxiliary Controls (Keyboard toggle & Quick Suggestions if needed) */}
              <div className="flex items-center justify-between pt-1">
                {isLanguageSelected && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSendProspectMessage(quickReplies.reply1)}
                      disabled={isAiThinking || callStatus !== 'CONNECTED'}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                      &quot;{quickReplies.reply1}&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendProspectMessage(quickReplies.reply2)}
                      disabled={isAiThinking || callStatus !== 'CONNECTED'}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                      &quot;{quickReplies.reply2}&quot;
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setInputMode(inputMode === 'mic' ? 'keyboard' : 'mic')}
                  className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{inputMode === 'mic' ? 'Keyboard' : 'Hands-free Voice'}</span>
                </button>
              </div>

              {/* Collapsed Keyboard Mode (Only shown if user clicked Keyboard) */}
              {inputMode === 'keyboard' && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendProspectMessage(inputText)}
                    placeholder={t.typeSpokenWords}
                    disabled={isAiThinking || callStatus !== 'CONNECTED'}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#090d1f] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 shadow-sm"
                  />
                  <button
                    onClick={() => handleSendProspectMessage(inputText)}
                    disabled={!inputText.trim() || isAiThinking || callStatus !== 'CONNECTED'}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shadow-md shadow-indigo-600/30"
                  >
                    {isAiThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Call Summary & Next Best Action */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-white dark:bg-[#0a0e28] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Call Limit Metric Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060918] border border-slate-200/80 dark:border-white/[0.08] space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-heading">
                    <Timer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {t.callLimitLabel}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      isApproachingLimit
                        ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                        : isLimitReached
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-indigo-600 dark:text-indigo-300'
                    }`}
                  >
                    {formatTime(remainingSeconds)} left
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isLimitReached
                        ? 'bg-rose-500'
                        : isApproachingLimit
                        ? 'bg-amber-400'
                        : 'bg-indigo-600 dark:bg-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Standard telecom limit enforced for initial autonomous outreach. Call cleanly wraps up at 3:00.
                </p>
              </div>

              {/* Call Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060918] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
                <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {t.callSummaryTitle}
                </div>
                <p className="text-[12px] sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed bg-white dark:bg-white/[0.02] p-3 rounded-lg border border-slate-200/80 dark:border-white/[0.04]">
                  {callSummary}
                </p>
              </div>

              {/* Next Best Action Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#060918] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
                <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {t.nextBestActionTitle}
                </div>
                <p className="text-[12px] sm:text-[13px] text-emerald-800 dark:text-emerald-300 leading-relaxed bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20 font-medium">
                  {nextBestAction}
                </p>
              </div>

              {/* Outcomes Handled Automatically Badges */}
              <div>
                <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  {t.outcomesHandledTitle}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      isMeetingBooked
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.05]'
                    }`}
                  >
                    {t.interestedBadge}
                  </span>

                  <span
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      isMeetingBooked
                        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500/50 shadow-md animate-pulse'
                        : 'bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.05]'
                    }`}
                  >
                    {t.meetingBookedBadge}
                  </span>

                  <span className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.05] text-center font-medium">
                    {t.voicemailBadge}
                  </span>

                  <span className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.05] text-center font-medium">
                    {t.retryBadge}
                  </span>
                </div>
              </div>
            </div>

            {/* Language Lock Strip (No buttons - purely status-driven) */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[11px] font-heading font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>{t.languageLockedBadge}:</span>
                </div>
                {isLanguageSelected ? (
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                ) : (
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/25 animate-pulse">
                    Spoken Detection...
                  </span>
                )}
              </div>

              {isLanguageSelected ? (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-amber-300/60 dark:border-amber-500/20 text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span>Session Language: <strong className="text-slate-900 dark:text-white font-bold">{selectedLanguage}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Locked for Call</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                    <span>Speak your language into the mic to lock it</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Zero buttons</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
