export type HubsSupportedLanguage = 'English' | 'Español' | 'हिन्दी' | 'Français' | 'Deutsch' | 'العربية';

export interface HubsTranslationBundle {
  leads: {
    badge: string;
    title: string;
    subtitle: string;
    exportCsv: string;
    importLeads: string;
    searchPlaceholder: string;
    allLeads: string;
    hotSegment: string;
    warmSegment: string;
    nurtureSegment: string;
    bookedSegment: string;
    contactCol: string;
    companyCol: string;
    industryCol: string;
    intentScoreCol: string;
    statusCol: string;
    actionsCol: string;
    callLead: string;
    noLeads: string;
    importModalTitle: string;
    importModalDesc: string;
    importSubmit: string;
    cancel: string;
  };
  campaigns: {
    badge: string;
    title: string;
    subtitle: string;
    newCampaign: string;
    activeCampaigns: string;
    totalLeadsTargeted: string;
    callsConnected: string;
    meetingsBooked: string;
    running: string;
    paused: string;
    scheduled: string;
    completed: string;
    targetIndustry: string;
    targetLocation: string;
    progress: string;
    pauseBtn: string;
    resumeBtn: string;
  };
  voiceAgent: {
    badge: string;
    title: string;
    subtitle: string;
    launchCallBtn: string;
    personaLabel: string;
    personaName: string;
    personaStatus: string;
    latencyLabel: string;
    latencyValue: string;
    latencyDesc: string;
    languagesLabel: string;
    languagesList: string;
    languagesDesc: string;
  };
  conversations: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCalls: string;
    meetingBooked: string;
    interested: string;
    voicemail: string;
    retryScheduled: string;
    summaryLabel: string;
    nextActionLabel: string;
    transcriptLabel: string;
    durationLabel: string;
  };
  intelligence: {
    badge: string;
    title: string;
    subtitle: string;
    fundingLabel: string;
    hiringLabel: string;
    techStackLabel: string;
    competitorLabel: string;
    displacementLabel: string;
    openRoles: string;
  };
  integrations: {
    badge: string;
    title: string;
    subtitle: string;
    connectedBadge: string;
    connectBtn: string;
    configureBtn: string;
    webhookSettingsTitle: string;
    webhookSecretLabel: string;
    webhookEndpointLabel: string;
  };
  settings: {
    badge: string;
    title: string;
    subtitle: string;
    companyProfileStep: string;
    voicePersonaStep: string;
    catalogStep: string;
    crmStep: string;
    apiKeysStep: string;
    validationStep: string;
    saveBtn: string;
    validateBtn: string;
    validatingBtn: string;
  };
  admin: {
    badge: string;
    title: string;
    subtitle: string;
    exportLogsBtn: string;
    searchLogsPlaceholder: string;
    timestampCol: string;
    actorCol: string;
    actionCol: string;
    resourceCol: string;
    ipCol: string;
    statusCol: string;
  };
  footer: {
    discoveryTitle: string;
    discoveryDesc: string;
    voiceTitle: string;
    voiceDesc: string;
    enrichmentTitle: string;
    enrichmentDesc: string;
    analyticsTitle: string;
    analyticsDesc: string;
    integrationsTitle: string;
    integrationsDesc: string;
    securityTitle: string;
    securityDesc: string;
  };
  profile: {
    title: string;
    subtitle: string;
    fullName: string;
    workEmail: string;
    companyName: string;
    companySize: string;
    industry: string;
    newPassword: string;
    passwordHint: string;
    saveChanges: string;
    saving: string;
    cancel: string;
  };
  intentModal: {
    badge: string;
    title: string;
    subtitle: string;
    predictiveScore: string;
    outOf100: string;
    authorityFit: string;
    budgetSignal: string;
    urgencyLevel: string;
    pipelineFit: string;
    recommendedPitch: string;
    launchCallBtn: string;
  };
}

export const HUBS_TRANSLATIONS: Record<HubsSupportedLanguage, HubsTranslationBundle> = {
  English: {
    leads: {
      badge: 'Lead Database & Pipeline',
      title: 'Lead Management & Enrichment',
      subtitle: 'Filter, segment, export, or initiate voice outreach to high-intent prospects.',
      exportCsv: 'Export CSV',
      importLeads: 'Import Leads',
      searchPlaceholder: 'Search leads by name, company, title, industry...',
      allLeads: 'All Leads',
      hotSegment: '🔥 Hot (Score 90+)',
      warmSegment: '⚡ Warm (Score 75-89)',
      nurtureSegment: '🌱 Nurture (<75)',
      bookedSegment: '📅 Booked',
      contactCol: 'Contact',
      companyCol: 'Company & Industry',
      industryCol: 'Industry',
      intentScoreCol: 'Intent Score',
      statusCol: 'Status',
      actionsCol: 'Action',
      callLead: 'Call Lead',
      noLeads: 'No leads found matching your criteria.',
      importModalTitle: 'Import Leads via CSV',
      importModalDesc: 'Paste CSV data or upload to batch ingest and score new leads.',
      importSubmit: 'Import & Score Leads',
      cancel: 'Cancel',
    },
    campaigns: {
      badge: 'Outreach Engine',
      title: 'Campaigns & Automation',
      subtitle: 'Schedule, monitor, and scale autonomous AI voice calling and multi-channel outreach.',
      newCampaign: '+ New Campaign',
      activeCampaigns: 'Active Campaigns',
      totalLeadsTargeted: 'Total Leads Targeted',
      callsConnected: 'Calls Connected',
      meetingsBooked: 'Meetings Booked',
      running: 'RUNNING',
      paused: 'PAUSED',
      scheduled: 'SCHEDULED',
      completed: 'COMPLETED',
      targetIndustry: 'Target Industry',
      targetLocation: 'Target Location',
      progress: 'Progress',
      pauseBtn: 'Pause',
      resumeBtn: 'Resume',
    },
    voiceAgent: {
      badge: 'Conversational Telephony',
      title: 'Multilingual AI Voice Calling Agent (Groq Llama 3.3 + Gemini)',
      subtitle: 'Sub-150ms voice conversational qualification, objection handling, voicemail detection, and calendar demo scheduling.',
      launchCallBtn: 'Launch Live Voice Call',
      personaLabel: 'AI Voice Persona',
      personaName: 'Ava (Enterprise Solutions Lead)',
      personaStatus: '✓ Active & Calibrated',
      latencyLabel: 'Inference Latency',
      latencyValue: '< 150 ms (Groq Hardware)',
      latencyDesc: 'Ultra-low latency streaming',
      languagesLabel: 'Languages Supported',
      languagesList: 'English, Hindi, Spanish, Arabic, French, German',
      languagesDesc: 'Autonomous language detection',
    },
    conversations: {
      badge: 'Conversations & Call Logs',
      title: 'Call Recordings & Transcripts',
      subtitle: 'Review conversational recordings, sentiment classification, qualification notes, and next actions.',
      searchPlaceholder: 'Search call records by contact or company...',
      allCalls: 'All Calls',
      meetingBooked: 'Meeting Booked',
      interested: 'Interested',
      voicemail: 'Voicemail Left',
      retryScheduled: 'Retry Scheduled',
      summaryLabel: 'AI Call Summary',
      nextActionLabel: 'Next Best Action',
      transcriptLabel: 'Live Transcript',
      durationLabel: 'Duration',
    },
    intelligence: {
      badge: 'Market Intelligence & Signals',
      title: 'Real-Time Organizational Intelligence',
      subtitle: 'Live organizational signals, tech stack detection, hiring velocity, and competitor displacement opportunities.',
      fundingLabel: 'Funding & Capital',
      hiringLabel: 'Hiring Velocity',
      techStackLabel: 'Detected Tech Stack',
      competitorLabel: 'Competitor Displacement Angle',
      displacementLabel: 'Strategic Angle',
      openRoles: 'open roles',
    },
    integrations: {
      badge: 'Ecosystem & Integrations',
      title: 'Connected Enterprise Tools',
      subtitle: 'Sync leads, trigger calendar bookings, and route telephony through your existing enterprise software.',
      connectedBadge: 'Connected',
      connectBtn: 'Connect',
      configureBtn: 'Configure',
      webhookSettingsTitle: 'Webhook & API Sync Settings',
      webhookSecretLabel: 'Webhook Signing Secret',
      webhookEndpointLabel: 'Inbound Webhook URL',
    },
    settings: {
      badge: 'Settings & Workspace Configuration',
      title: 'Platform Calibration & Onboarding',
      subtitle: 'Configure company profile, AI persona, telephony routing, and product catalogs.',
      companyProfileStep: 'Step 1: Company Profile & Value Proposition',
      voicePersonaStep: 'Step 2: AI Voice Persona & Telephony Mode',
      catalogStep: 'Step 3: Products Catalog & Knowledge Base',
      crmStep: 'Step 4: CRM & Calendar Sync',
      apiKeysStep: 'Step 5: Webhooks & API Keys',
      validationStep: 'Step 6: AI Catalog Validation & Health Check',
      saveBtn: 'Save Changes',
      validateBtn: 'Validate Products with AI',
      validatingBtn: 'Validating with AI...',
    },
    admin: {
      badge: 'Admin Security & Audit Trail',
      title: 'Audit Logs & Governance',
      subtitle: 'Immutable audit log of all automated actions, user logins, data exports, and telephony connections.',
      exportLogsBtn: 'Export Audit Logs',
      searchLogsPlaceholder: 'Filter logs by actor, action, or resource...',
      timestampCol: 'Timestamp',
      actorCol: 'Actor',
      actionCol: 'Action',
      resourceCol: 'Resource',
      ipCol: 'IP Address',
      statusCol: 'Status',
    },
    footer: {
      discoveryTitle: 'Multi-Source Lead Discovery',
      discoveryDesc: 'LinkedIn, X, Websites, Directories, CRM & Freelance Platforms.',
      voiceTitle: 'AI-Powered Voice Agents',
      voiceDesc: 'Multilingual conversations that qualify & engage prospects.',
      enrichmentTitle: 'Smart Lead Enrichment',
      enrichmentDesc: 'Verified emails, phones, company insights & intent scoring.',
      analyticsTitle: 'Real-time Analytics',
      analyticsDesc: 'Track performance, conversions & campaign ROI in real-time.',
      integrationsTitle: 'Seamless Integrations',
      integrationsDesc: 'CRM, Email, Calendar, WhatsApp, API & more.',
      securityTitle: 'Secure & Scalable',
      securityDesc: 'Enterprise-grade security, privacy & high availability.',
    },
    profile: {
      title: 'Update Profile Details',
      subtitle: 'Update your official profile, company information, and credentials.',
      fullName: 'Full Name',
      workEmail: 'Official Work Email',
      companyName: 'Company Name',
      companySize: 'Company Size',
      industry: 'Industry',
      newPassword: 'New Password (Optional)',
      passwordHint: 'Leave blank to keep your current password.',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
    },
    intentModal: {
      badge: 'AI Qualification & Prioritisation',
      title: 'Predictive Intent Score & Pipeline Fit',
      subtitle: 'Scored on requirement fit, buying intent, seniority, and company profile.',
      predictiveScore: 'Predictive Intent Score',
      outOf100: '/ 100',
      authorityFit: 'Authority Fit',
      budgetSignal: 'Budget Signal',
      urgencyLevel: 'Urgency Level',
      pipelineFit: 'Pipeline Fit',
      recommendedPitch: 'Recommended AI Pitch Angle',
      launchCallBtn: 'Launch Voice Call',
    },
  },
  Español: {
    leads: {
      badge: 'Base de Datos y Pipeline de Prospectos',
      title: 'Gestión y Enriquecimiento de Prospectos',
      subtitle: 'Filtre, segmente, exporte o inicie llamadas con IA a prospectos de alta intención.',
      exportCsv: 'Exportar CSV',
      importLeads: 'Importar Prospectos',
      searchPlaceholder: 'Buscar prospectos por nombre, empresa, cargo, industria...',
      allLeads: 'Todos los Prospectos',
      hotSegment: '🔥 Calientes (Puntuación 90+)',
      warmSegment: '⚡ Tibios (Puntuación 75-89)',
      nurtureSegment: '🌱 Nutrición (<75)',
      bookedSegment: '📅 Agendados',
      contactCol: 'Contacto',
      companyCol: 'Empresa e Industria',
      industryCol: 'Industria',
      intentScoreCol: 'Puntuación de Intención',
      statusCol: 'Estado',
      actionsCol: 'Acción',
      callLead: 'Llamar Prospecto',
      noLeads: 'No se encontraron prospectos que coincidan con sus criterios.',
      importModalTitle: 'Importar Prospectos mediante CSV',
      importModalDesc: 'Pegue datos CSV o cargue archivos para calificar nuevos prospectos por lote.',
      importSubmit: 'Importar y Calificar Prospectos',
      cancel: 'Cancelar',
    },
    campaigns: {
      badge: 'Motor de Alcance',
      title: 'Campañas y Automatización',
      subtitle: 'Programe, supervise y escale llamadas de voz con IA y alcance multicanal autónomo.',
      newCampaign: '+ Nueva Campaña',
      activeCampaigns: 'Campañas Activas',
      totalLeadsTargeted: 'Total de Prospectos',
      callsConnected: 'Llamadas Conectadas',
      meetingsBooked: 'Reuniones Agendadas',
      running: 'EN EJECUCIÓN',
      paused: 'PAUSADA',
      scheduled: 'PROGRAMADA',
      completed: 'COMPLETADA',
      targetIndustry: 'Industria Objetivo',
      targetLocation: 'Ubicación Objetivo',
      progress: 'Progreso',
      pauseBtn: 'Pausar',
      resumeBtn: 'Reanudar',
    },
    voiceAgent: {
      badge: 'Telefonía Conversacional',
      title: 'Agente de Voz con IA Multilingüe (Groq Llama 3.3 + Gemini)',
      subtitle: 'Calificación conversacional de voz en sub-150ms, manejo de objeciones, detección de buzón y agenda de demos.',
      launchCallBtn: 'Iniciar Llamada de Voz en Vivo',
      personaLabel: 'Persona de Voz de IA',
      personaName: 'Ava (Líder de Soluciones Empresariales)',
      personaStatus: '✓ Activa y Calibrada',
      latencyLabel: 'Latencia de Inferencia',
      latencyValue: '< 150 ms (Hardware Groq)',
      latencyDesc: 'Transmisión de latencia ultra baja',
      languagesLabel: 'Idiomas Compatibles',
      languagesList: 'Inglés, Hindi, Español, Árabe, Francés, Alemán',
      languagesDesc: 'Detección autónoma del idioma',
    },
    conversations: {
      badge: 'Conversaciones y Registros de Llamadas',
      title: 'Grabaciones y Transcripciones de Llamadas',
      subtitle: 'Revise grabaciones, clasificación de sentimiento, notas de calificación y próximas acciones.',
      searchPlaceholder: 'Buscar llamadas por contacto o empresa...',
      allCalls: 'Todas las Llamadas',
      meetingBooked: 'Reunión Agendada',
      interested: 'Interesado',
      voicemail: 'Buzón de Voz',
      retryScheduled: 'Reintento Programado',
      summaryLabel: 'Resumen de Llamada por IA',
      nextActionLabel: 'Siguiente Mejor Acción',
      transcriptLabel: 'Transcripción en Vivo',
      durationLabel: 'Duración',
    },
    intelligence: {
      badge: 'Inteligencia de Mercado y Señales',
      title: 'Inteligencia Organizacional en Tiempo Real',
      subtitle: 'Señales en vivo, detección de stack tecnológico, ritmo de contratación y oportunidades de desplazamiento de competidores.',
      fundingLabel: 'Financiamiento y Capital',
      hiringLabel: 'Ritmo de Contratación',
      techStackLabel: 'Stack Tecnológico Detectado',
      competitorLabel: 'Ángulo de Desplazamiento de Competidores',
      displacementLabel: 'Ángulo Estratégico',
      openRoles: 'vacantes abiertas',
    },
    integrations: {
      badge: 'Ecosistema e Integraciones',
      title: 'Herramientas Empresariales Conectadas',
      subtitle: 'Sincronice prospectos, agende reuniones y enrute telefonía a través de su software existente.',
      connectedBadge: 'Conectado',
      connectBtn: 'Conectar',
      configureBtn: 'Configurar',
      webhookSettingsTitle: 'Configuración de Webhooks y Sincronización API',
      webhookSecretLabel: 'Secreto de Firma de Webhook',
      webhookEndpointLabel: 'URL de Webhook Entrante',
    },
    settings: {
      badge: 'Configuración del Espacio de Trabajo',
      title: 'Calibración de Plataforma y Configuración',
      subtitle: 'Configure perfil de empresa, persona de IA, enrutamiento telefónico y catálogo de productos.',
      companyProfileStep: 'Paso 1: Perfil de Empresa y Propuesta de Valor',
      voicePersonaStep: 'Paso 2: Persona de Voz de IA y Modo Telefónico',
      catalogStep: 'Paso 3: Catálogo de Productos y Base de Conocimiento',
      crmStep: 'Paso 4: Sincronización de CRM y Calendario',
      apiKeysStep: 'Paso 5: Webhooks y Claves API',
      validationStep: 'Paso 6: Validación de Catálogo con IA',
      saveBtn: 'Guardar Cambios',
      validateBtn: 'Validar Productos con IA',
      validatingBtn: 'Validando con IA...',
    },
    admin: {
      badge: 'Seguridad de Administrador y Registro de Auditoría',
      title: 'Registros de Auditoría y Gobernanza',
      subtitle: 'Registro inmutable de todas las acciones automatizadas, inicios de sesión, exportaciones y telefonía.',
      exportLogsBtn: 'Exportar Registros de Auditoría',
      searchLogsPlaceholder: 'Filtrar registros por actor, acción o recurso...',
      timestampCol: 'Marca de Tiempo',
      actorCol: 'Actor',
      actionCol: 'Acción',
      resourceCol: 'Recurso',
      ipCol: 'Dirección IP',
      statusCol: 'Estado',
    },
    footer: {
      discoveryTitle: 'Descubrimiento Multifuente de Prospectos',
      discoveryDesc: 'LinkedIn, X, Sitios Web, Directorios, CRM y Plataformas Freelance.',
      voiceTitle: 'Agentes de Voz con IA',
      voiceDesc: 'Conversaciones multilingües que califican y comprometen a prospectos.',
      enrichmentTitle: 'Enriquecimiento Inteligente de Prospectos',
      enrichmentDesc: 'Correos verificados, teléfonos, análisis de empresa y puntuación de intención.',
      analyticsTitle: 'Analíticas en Tiempo Real',
      analyticsDesc: 'Supervise rendimiento, conversiones y ROI de campañas en tiempo real.',
      integrationsTitle: 'Integraciones Fluidas',
      integrationsDesc: 'CRM, Correo, Calendario, WhatsApp, API y más.',
      securityTitle: 'Seguro y Escalable',
      securityDesc: 'Seguridad de nivel empresarial, privacidad y alta disponibilidad.',
    },
    profile: {
      title: 'Actualizar Detalles de Perfil',
      subtitle: 'Actualice su perfil oficial, información de empresa y credenciales.',
      fullName: 'Nombre Completo',
      workEmail: 'Correo Corporativo Oficial',
      companyName: 'Nombre de la Empresa',
      companySize: 'Tamaño de la Empresa',
      industry: 'Industria',
      newPassword: 'Nueva Contraseña (Opcional)',
      passwordHint: 'Deje en blanco para conservar su contraseña actual.',
      saveChanges: 'Guardar Cambios',
      saving: 'Guardando...',
      cancel: 'Cancelar',
    },
    intentModal: {
      badge: 'Calificación y Priorización con IA',
      title: 'Puntuación Predictiva de Intención y Ajuste',
      subtitle: 'Calificado según requerimientos, intención de compra, antigüedad y perfil corporativo.',
      predictiveScore: 'Puntuación Predictiva de Intención',
      outOf100: '/ 100',
      authorityFit: 'Ajuste de Autoridad',
      budgetSignal: 'Señal de Presupuesto',
      urgencyLevel: 'Nivel de Urgencia',
      pipelineFit: 'Ajuste al Pipeline',
      recommendedPitch: 'Ángulo de Discurso Recomendado por IA',
      launchCallBtn: 'Iniciar Llamada de Voz',
    },
  },
  हिन्दी: {
    leads: {
      badge: 'लीड डेटाबेस और पाइपलाइन',
      title: 'लीड प्रबंधन और संवर्धन',
      subtitle: 'फ़िल्टर करें, खंडित करें, निर्यात करें या उच्च-इरादे वाले संभावित ग्राहकों को AI वॉयस कॉल करें।',
      exportCsv: 'CSV निर्यात करें',
      importLeads: 'लीड आयात करें',
      searchPlaceholder: 'नाम, कंपनी, पद, उद्योग द्वारा लीड खोजें...',
      allLeads: 'सभी लीड्स',
      hotSegment: '🔥 हॉट (स्कोर 90+)',
      warmSegment: '⚡ वार्म (स्कोर 75-89)',
      nurtureSegment: '🌱 नर्चर (<75)',
      bookedSegment: '📅 बुक किया गया',
      contactCol: 'संपर्क',
      companyCol: 'कंपनी और उद्योग',
      industryCol: 'उद्योग',
      intentScoreCol: 'इरादा स्कोर',
      statusCol: 'स्थिति',
      actionsCol: 'कार्रवाई',
      callLead: 'लीड को कॉल करें',
      noLeads: 'आपके मानदंडों से मेल खाने वाली कोई लीड नहीं मिली।',
      importModalTitle: 'CSV के माध्यम से लीड आयात करें',
      importModalDesc: 'नई लीड्स को बल्क में आयात और स्कोर करने के लिए CSV डेटा पेस्ट करें।',
      importSubmit: 'लीड आयात और स्कोर करें',
      cancel: 'रद्द करें',
    },
    campaigns: {
      badge: 'आउटरीच इंजन',
      title: 'अभियान और स्वचालन',
      subtitle: 'स्वायत्त AI वॉयस कॉलिंग और मल्टी-चैनल आउटरीच को शेड्यूल, मॉनिटर और स्केल करें।',
      newCampaign: '+ नया अभियान',
      activeCampaigns: 'सक्रिय अभियान',
      totalLeadsTargeted: 'कुल लक्षित लीड्स',
      callsConnected: 'कनेक्ट की गई कॉल्स',
      meetingsBooked: 'मीटिंग बुक की गईं',
      running: 'चालू है',
      paused: 'रोका गया',
      scheduled: 'शेड्यूल किया गया',
      completed: 'पूर्ण हुआ',
      targetIndustry: 'लक्षित उद्योग',
      targetLocation: 'लक्षित स्थान',
      progress: 'प्रगति',
      pauseBtn: 'रोकें',
      resumeBtn: 'फिर शुरू करें',
    },
    voiceAgent: {
      badge: 'संवादात्मक टेलीफोनी',
      title: 'बहुभाषी AI वॉयस कॉलिंग एजेंट (Groq Llama 3.3 + Gemini)',
      subtitle: '150 मिलीसेकंड से कम समय में वॉयस योग्यता, आपत्ति प्रबंधन, वॉयसमेल पहचान और कैलेंडर डेमो शेड्यूलिंग।',
      launchCallBtn: 'लाइव वॉयस कॉल शुरू करें',
      personaLabel: 'AI वॉयस पर्सोना',
      personaName: 'आवा (एंटरप्राइज सॉल्यूशंस लीड)',
      personaStatus: '✓ सक्रिय और कैलिब्रेटेड',
      latencyLabel: 'अनुमान विलंबता',
      latencyValue: '< 150 ms (Groq हार्डवेयर)',
      latencyDesc: 'अति-निम्न विलंबता स्ट्रीमिंग',
      languagesLabel: 'समर्थित भाषाएं',
      languagesList: 'अंग्रेजी, हिंदी, स्पेनिश, अरबी, फ्रेंच, जर्मन',
      languagesDesc: 'स्वायत्त भाषा पहचान',
    },
    conversations: {
      badge: 'बातचीत और कॉल लॉग्स',
      title: 'कॉल रिकॉर्डिंग और ट्रांसक्रिप्ट',
      subtitle: 'संवादात्मक रिकॉर्डिंग, भावना वर्गीकरण, योग्यता नोट्स और आगामी कार्रवाइयों की समीक्षा करें।',
      searchPlaceholder: 'संपर्क या कंपनी द्वारा कॉल रिकॉर्ड खोजें...',
      allCalls: 'सभी कॉल्स',
      meetingBooked: 'मीटिंग बुक हुई',
      interested: 'इच्छुक',
      voicemail: 'वॉयसमेल छोड़ा गया',
      retryScheduled: 'पुनः प्रयास शेड्यूल',
      summaryLabel: 'AI कॉल सारांश',
      nextActionLabel: 'अगली सर्वश्रेष्ठ कार्रवाई',
      transcriptLabel: 'लाइव ट्रांसक्रिप्ट',
      durationLabel: 'अवधि',
    },
    intelligence: {
      badge: 'बाजार खुफिया और संकेत',
      title: 'वास्तविक समय संगठनात्मक खुफिया',
      subtitle: 'लाइव संगठनात्मक संकेत, टेक स्टैक पहचान, भर्ती की गति और प्रतिस्पर्धी विस्थापन के अवसर।',
      fundingLabel: 'फंडिंग और पूंजी',
      hiringLabel: 'भर्ती की गति',
      techStackLabel: 'पहचाना गया टेक स्टैक',
      competitorLabel: 'प्रतिस्पर्धी विस्थापन दृष्टिकोण',
      displacementLabel: 'रणनीतिक दृष्टिकोण',
      openRoles: 'खुले पद',
    },
    integrations: {
      badge: 'पारिस्थितिकी तंत्र और एकीकरण',
      title: 'कनेक्टेड एंटरप्राइज टूल्स',
      subtitle: 'अपने मौजूदा एंटरप्राइज सॉफ़्टवेयर के माध्यम से लीड सिंक करें, कैलेंडर मीटिंग बुक करें और कॉल रूट करें।',
      connectedBadge: 'कनेक्टेड',
      connectBtn: 'कनेक्ट करें',
      configureBtn: 'कॉन्फ़िगर करें',
      webhookSettingsTitle: 'वेबहुक और API सिंक सेटिंग्स',
      webhookSecretLabel: 'वेबहुक साइनिंग सीक्रेट',
      webhookEndpointLabel: 'इनबाउंड वेबहुक URL',
    },
    settings: {
      badge: 'सेटिंग्स और वर्कस्पेस कॉन्फ़िगरेशन',
      title: 'प्लेटफ़ॉर्म कैलिब्रेशन और ऑनबोर्डिंग',
      subtitle: 'कंपनी प्रोफ़ाइल, AI पर्सोना, टेलीफोनी रूटिंग और उत्पाद कैटलॉग कॉन्फ़िगर करें।',
      companyProfileStep: 'चरण 1: कंपनी प्रोफ़ाइल और मूल्य प्रस्ताव',
      voicePersonaStep: 'चरण 2: AI वॉयस पर्सोना और टेलीफोनी मोड',
      catalogStep: 'चरण 3: उत्पाद कैटलॉग और ज्ञानकोष',
      crmStep: 'चरण 4: CRM और कैलेंडर सिंक',
      apiKeysStep: 'चरण 5: वेबहुक और API कुंजियां',
      validationStep: 'चरण 6: AI कैटलॉग सत्यापन और स्वास्थ्य जांच',
      saveBtn: 'परिवर्तन सहेजें',
      validateBtn: 'AI से उत्पादों को सत्यापित करें',
      validatingBtn: 'AI द्वारा सत्यापन जारी...',
    },
    admin: {
      badge: 'व्यवस्थापक सुरक्षा और ऑडिट ट्रेल',
      title: 'ऑडिट लॉग्स और शासन',
      subtitle: 'सभी स्वचालित कार्यों, उपयोगकर्ता लॉगिन, डेटा निर्यात और टेलीफोनी कनेक्शन का अपरिवर्तनीय ऑडिट लॉग।',
      exportLogsBtn: 'ऑडिट लॉग निर्यात करें',
      searchLogsPlaceholder: 'अभिनेता, कार्रवाई या संसाधन द्वारा लॉग फ़िल्टर करें...',
      timestampCol: 'समय टिकट',
      actorCol: 'अभिनेता',
      actionCol: 'कार्रवाई',
      resourceCol: 'संसाधन',
      ipCol: 'IP पता',
      statusCol: 'स्थिति',
    },
    footer: {
      discoveryTitle: 'बहु-स्रोत लीड खोज',
      discoveryDesc: 'लिंक्डइन, X, वेबसाइटें, निर्देशिकाएं, CRM और फ्रीलांस प्लेटफॉर्म।',
      voiceTitle: 'AI-संचालित वॉयस एजेंट्स',
      voiceDesc: 'बहुभाषी बातचीत जो संभावित ग्राहकों को योग्य और व्यस्त बनाती है।',
      enrichmentTitle: 'स्मार्ट लीड संवर्धन',
      enrichmentDesc: 'सत्यापित ईमेल, फोन, कंपनी अंतर्दृष्टि और इरादा स्कोरिंग।',
      analyticsTitle: 'वास्तविक समय एनालिटिक्स',
      analyticsDesc: 'वास्तविक समय में प्रदर्शन, रूपांतरण और अभियान ROI ट्रैक करें।',
      integrationsTitle: 'सहज एकीकरण',
      integrationsDesc: 'CRM, ईमेल, कैलेंडर, व्हाट्सएप, API और अधिक।',
      securityTitle: 'सुरक्षित और स्केलेबल',
      securityDesc: 'एंटरप्राइज-ग्रेड सुरक्षा, गोपनीयता और उच्च उपलब्धता।',
    },
    profile: {
      title: 'प्रोफ़ाइल विवरण अपडेट करें',
      subtitle: 'अपनी आधिकारिक प्रोफ़ाइल, कंपनी की जानकारी और क्रेडेंशियल्स अपडेट करें।',
      fullName: 'पूरा नाम',
      workEmail: 'आधिकारिक कार्य ईमेल',
      companyName: 'कंपनी का नाम',
      companySize: 'कंपनी का आकार',
      industry: 'उद्योग',
      newPassword: 'नया पासवर्ड (वैकल्पिक)',
      passwordHint: 'अपना वर्तमान पासवर्ड बनाए रखने के लिए खाली छोड़ें।',
      saveChanges: 'परिवर्तन सहेजें',
      saving: 'सहेजा जा रहा है...',
      cancel: 'रद्द करें',
    },
    intentModal: {
      badge: 'AI योग्यता और प्राथमिकता',
      title: 'अनुमानित इरादा स्कोर और पाइपलाइन फिट',
      subtitle: 'आवश्यकता फिट, खरीद इरादे, वरिष्ठता और कंपनी प्रोफ़ाइल पर स्कोर किया गया।',
      predictiveScore: 'अनुमानित इरादा स्कोर',
      outOf100: '/ 100',
      authorityFit: 'अधिकार फिट',
      budgetSignal: 'बजट संकेत',
      urgencyLevel: 'तात्कालिकता स्तर',
      pipelineFit: 'पाइपलाइन फिट',
      recommendedPitch: 'अनुशंसित AI पिच दृष्टिकोण',
      launchCallBtn: 'वॉयस कॉल शुरू करें',
    },
  },
  Français: {
    leads: {
      badge: 'Base de Données et Pipeline de Prospects',
      title: 'Gestion et Enrichissement des Prospects',
      subtitle: 'Filtrez, segmentez, exportez ou lancez des appels vocaux IA vers des prospects à forte intention.',
      exportCsv: 'Exporter CSV',
      importLeads: 'Importer Prospects',
      searchPlaceholder: 'Rechercher des prospects par nom, entreprise, poste, secteur...',
      allLeads: 'Tous les Prospects',
      hotSegment: '🔥 Chauds (Score 90+)',
      warmSegment: '⚡ Tièdes (Score 75-89)',
      nurtureSegment: '🌱 Nurturing (<75)',
      bookedSegment: '📅 Réservés',
      contactCol: 'Contact',
      companyCol: 'Entreprise & Secteur',
      industryCol: 'Secteur',
      intentScoreCol: "Score d'Intention",
      statusCol: 'Statut',
      actionsCol: 'Action',
      callLead: 'Appeler le Prospect',
      noLeads: 'Aucun prospect ne correspond à vos critères.',
      importModalTitle: 'Importer des Prospects via CSV',
      importModalDesc: 'Collez des données CSV ou téléchargez pour ingérer et noter de nouveaux prospects en masse.',
      importSubmit: 'Importer et Noter les Prospects',
      cancel: 'Annuler',
    },
    campaigns: {
      badge: 'Moteur de Prospection',
      title: 'Campagnes & Automatisation',
      subtitle: 'Planifiez, surveillez et faites évoluer les appels vocaux IA et la prospection multicanale autonome.',
      newCampaign: '+ Nouvelle Campagne',
      activeCampaigns: 'Campagnes Actives',
      totalLeadsTargeted: 'Total Prospects Ciblés',
      callsConnected: 'Appels Connectés',
      meetingsBooked: 'Rendez-vous Réservés',
      running: 'EN COURS',
      paused: 'EN PAUSE',
      scheduled: 'PROGRAMMÉ',
      completed: 'TERMINÉ',
      targetIndustry: 'Secteur Cible',
      targetLocation: 'Zone Géographique Cible',
      progress: 'Progression',
      pauseBtn: 'Pause',
      resumeBtn: 'Reprendre',
    },
    voiceAgent: {
      badge: 'Téléphonie Conversationnelle',
      title: 'Agent Vocal IA Multilingue (Groq Llama 3.3 + Gemini)',
      subtitle: 'Qualification vocale en moins de 150 ms, gestion des objections, détection de répondeur et planification de démo.',
      launchCallBtn: "Lancer l'Appel Vocal en Direct",
      personaLabel: 'Persona Vocal IA',
      personaName: 'Ava (Responsable Solutions Entreprise)',
      personaStatus: '✓ Actif et Calibré',
      latencyLabel: "Latence d'Inférence",
      latencyValue: '< 150 ms (Matériel Groq)',
      latencyDesc: 'Diffusion à très faible latence',
      languagesLabel: 'Langues Prises en Charge',
      languagesList: 'Anglais, Hindi, Espagnol, Arabe, Français, Allemand',
      languagesDesc: 'Détection autonome de la langue',
    },
    conversations: {
      badge: "Conversations & Journaux d'Appels",
      title: "Enregistrements d'Appels & Transcriptions",
      subtitle: 'Examinez les enregistrements, la classification des sentiments, les notes de qualification et les actions suivantes.',
      searchPlaceholder: "Rechercher des appels par contact ou entreprise...",
      allCalls: 'Tous les Appels',
      meetingBooked: 'Rendez-vous Réservé',
      interested: 'Intéressé',
      voicemail: 'Message Vocal Laissé',
      retryScheduled: 'Nouvelle Tentative Programmée',
      summaryLabel: "Résumé d'Appel IA",
      nextActionLabel: 'Meilleure Action Suivante',
      transcriptLabel: 'Transcription en Direct',
      durationLabel: 'Durée',
    },
    intelligence: {
      badge: 'Veille Marché & Signaux',
      title: 'Intelligence Organisationnelle en Temps Réel',
      subtitle: "Signaux organisationnels en direct, détection de stack technologique, vitesse de recrutement et opportunités d'éviction de concurrents.",
      fundingLabel: 'Financement & Capital',
      hiringLabel: 'Vitesse de Recrutement',
      techStackLabel: 'Stack Technologique Détecté',
      competitorLabel: 'Angle de Remplacement Concurrentiel',
      displacementLabel: 'Angle Stratégique',
      openRoles: 'postes ouverts',
    },
    integrations: {
      badge: 'Écosystème & Intégrations',
      title: 'Outils Entreprise Connectés',
      subtitle: 'Synchronisez les prospects, déclenchez des rendez-vous et routez la téléphonie via vos outils existants.',
      connectedBadge: 'Connecté',
      connectBtn: 'Connecter',
      configureBtn: 'Configurer',
      webhookSettingsTitle: 'Paramètres Webhooks & Synchronisation API',
      webhookSecretLabel: 'Secret de Signature Webhook',
      webhookEndpointLabel: 'URL Webhook Entrant',
    },
    settings: {
      badge: "Configuration de l'Espace de Travail",
      title: 'Calibration de la Plateforme & Intégration',
      subtitle: "Configurez le profil d'entreprise, le persona IA, le routage téléphonique et le catalogue de produits.",
      companyProfileStep: "Étape 1: Profil d'Entreprise & Proposition de Valeur",
      voicePersonaStep: 'Étape 2: Persona Vocal IA & Mode Téléphonique',
      catalogStep: 'Étape 3: Catalogue de Produits & Base de Connaissances',
      crmStep: 'Étape 4: Synchronisation CRM & Calendrier',
      apiKeysStep: 'Étape 5: Webhooks & Clés API',
      validationStep: 'Étape 6: Validation du Catalogue par IA',
      saveBtn: 'Enregistrer les Modifications',
      validateBtn: 'Valider les Produits avec IA',
      validatingBtn: 'Validation IA en cours...',
    },
    admin: {
      badge: "Sécurité Administrateur & Piste d'Audit",
      title: "Journaux d'Audit & Gouvernance",
      subtitle: 'Journal immuable de toutes les actions automatisées, connexions utilisateurs, exports et téléphonie.',
      exportLogsBtn: "Exporter les Journaux d'Audit",
      searchLogsPlaceholder: "Filtrer les journaux par acteur, action ou ressource...",
      timestampCol: 'Horodatage',
      actorCol: 'Acteur',
      actionCol: 'Action',
      resourceCol: 'Ressource',
      ipCol: 'Adresse IP',
      statusCol: 'Statut',
    },
    footer: {
      discoveryTitle: 'Découverte Multicanale de Prospects',
      discoveryDesc: 'LinkedIn, X, Sites Web, Annuaires, CRM & Plateformes Freelance.',
      voiceTitle: 'Agents Vocaux Propulsés par IA',
      voiceDesc: 'Conversations multilingues qui qualifient et engagent vos prospects.',
      enrichmentTitle: 'Enrichissement Intelligent des Prospects',
      enrichmentDesc: 'E-mails vérifiés, téléphones, analyses d’entreprise et scoring d’intention.',
      analyticsTitle: 'Analytique en Temps Réel',
      analyticsDesc: 'Suivez la performance, les conversions et le ROI des campagnes en direct.',
      integrationsTitle: 'Intégrations Fluides',
      integrationsDesc: 'CRM, E-mail, Calendrier, WhatsApp, API & plus.',
      securityTitle: 'Sécurisé & Évolutif',
      securityDesc: 'Sécurité de niveau entreprise, confidentialité et haute disponibilité.',
    },
    profile: {
      title: 'Mettre à Jour le Profil',
      subtitle: 'Mettez à jour votre profil officiel, informations entreprise et identifiants.',
      fullName: 'Nom Complet',
      workEmail: 'E-mail Professionnel Officiel',
      companyName: "Nom de l'Entreprise",
      companySize: "Taille de l'Entreprise",
      industry: 'Secteur d’Activité',
      newPassword: 'Nouveau Mot de Passe (Optionnel)',
      passwordHint: 'Laissez vide pour conserver votre mot de passe actuel.',
      saveChanges: 'Enregistrer les Modifications',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
    },
    intentModal: {
      badge: 'Qualification & Hiérarchisation IA',
      title: "Score d'Intention Prédictif & Adéquation Pipeline",
      subtitle: 'Noté sur l’adéquation du besoin, intention d’achat, ancienneté et profil entreprise.',
      predictiveScore: "Score d'Intention Prédictif",
      outOf100: '/ 100',
      authorityFit: "Adéquation d'Autorité",
      budgetSignal: 'Signal Budgétaire',
      urgencyLevel: "Niveau d'Urgence",
      pipelineFit: 'Adéquation Pipeline',
      recommendedPitch: 'Angle d’Argumentation IA Recommandé',
      launchCallBtn: "Lancer l'Appel Vocal",
    },
  },
  Deutsch: {
    leads: {
      badge: 'Lead-Datenbank & Pipeline',
      title: 'Lead-Management & Anreicherung',
      subtitle: 'Filtern, segmentieren, exportieren oder starten Sie KI-Sprachanrufe an kaufbereite Leads.',
      exportCsv: 'CSV exportieren',
      importLeads: 'Leads importieren',
      searchPlaceholder: 'Leads nach Name, Firma, Titel, Branche durchsuchen...',
      allLeads: 'Alle Leads',
      hotSegment: '🔥 Heiß (Score 90+)',
      warmSegment: '⚡ Warm (Score 75-89)',
      nurtureSegment: '🌱 Nurturing (<75)',
      bookedSegment: '📅 Gebucht',
      contactCol: 'Kontakt',
      companyCol: 'Firma & Branche',
      industryCol: 'Branche',
      intentScoreCol: 'Intent-Score',
      statusCol: 'Status',
      actionsCol: 'Aktion',
      callLead: 'Lead anrufen',
      noLeads: 'Keine Leads gefunden, die Ihren Kriterien entsprechen.',
      importModalTitle: 'Leads per CSV importieren',
      importModalDesc: 'Fügen Sie CSV-Daten ein oder laden Sie Dateien hoch, um neue Leads massenhaft zu bewerten.',
      importSubmit: 'Leads importieren & bewerten',
      cancel: 'Abbrechen',
    },
    campaigns: {
      badge: 'Outreach-Engine',
      title: 'Kampagnen & Automatisierung',
      subtitle: 'Planen, überwachen und skalieren Sie KI-Sprachanrufe und autonome Multi-Channel-Kampagnen.',
      newCampaign: '+ Neue Kampagne',
      activeCampaigns: 'Aktive Kampagnen',
      totalLeadsTargeted: 'Gezielte Leads insgesamt',
      callsConnected: 'Verbundene Anrufe',
      meetingsBooked: 'Gebuchte Meetings',
      running: 'LÄUFT',
      paused: 'PAUSIERT',
      scheduled: 'GEPLANT',
      completed: 'ABGESCHLOSSEN',
      targetIndustry: 'Zielbranche',
      targetLocation: 'Zielregion',
      progress: 'Fortschritt',
      pauseBtn: 'Pausieren',
      resumeBtn: 'Fortsetzen',
    },
    voiceAgent: {
      badge: 'Konversationelle Telefonie',
      title: 'Mehrsprachiger KI-Sprachanruf-Agent (Groq Llama 3.3 + Gemini)',
      subtitle: 'Sub-150ms Sprachqualifizierung, Einwandbehandlung, Mailbox-Erkennung und Kalenderterminierung.',
      launchCallBtn: 'Live-Sprachanruf starten',
      personaLabel: 'KI-Sprachpersona',
      personaName: 'Ava (Enterprise Solutions Lead)',
      personaStatus: '✓ Aktiv & Kalibriert',
      latencyLabel: 'Inferenz-Latenz',
      latencyValue: '< 150 ms (Groq-Hardware)',
      latencyDesc: 'Extrem latenzarmes Streaming',
      languagesLabel: 'Unterstützte Sprachen',
      languagesList: 'Englisch, Hindi, Spanisch, Arabisch, Französisch, Deutsch',
      languagesDesc: 'Autonome Spracherkennung',
    },
    conversations: {
      badge: 'Gespräche & Anrufprotokolle',
      title: 'Anrufaufzeichnungen & Transkripte',
      subtitle: 'Überprüfen Sie Aufzeichnungen, Stimmungsklassifizierung, Qualifizierungsnotizen und nächste Schritte.',
      searchPlaceholder: 'Anrufe nach Kontakt oder Firma durchsuchen...',
      allCalls: 'Alle Anrufe',
      meetingBooked: 'Meeting Gebucht',
      interested: 'Interessiert',
      voicemail: 'Mailbox Hinterlassen',
      retryScheduled: 'Wiederholung Geplant',
      summaryLabel: 'KI-Anrufzusammenfassung',
      nextActionLabel: 'Nächste beste Aktion',
      transcriptLabel: 'Live-Transkript',
      durationLabel: 'Dauer',
    },
    intelligence: {
      badge: 'Marktinformationen & Signale',
      title: 'Echtzeit-Unternehmensintelligenz',
      subtitle: 'Live-Organisationssignale, Tech-Stack-Erkennung, Einstellungsdynamik und Chancen zur Verdrängung von Mitbewerbern.',
      fundingLabel: 'Finanzierung & Kapital',
      hiringLabel: 'Einstellungstempo',
      techStackLabel: 'Erkannter Tech-Stack',
      competitorLabel: 'Wettbewerber-Verdrängungswinkel',
      displacementLabel: 'Strategischer Ansatz',
      openRoles: 'offene Stellen',
    },
    integrations: {
      badge: 'Ökosystem & Integrationen',
      title: 'Verbundene Unternehmenstools',
      subtitle: 'Synchronisieren Sie Leads, buchen Sie Termine und leiten Sie Anrufe über Ihre vorhandene Software.',
      connectedBadge: 'Verbunden',
      connectBtn: 'Verbinden',
      configureBtn: 'Konfigurieren',
      webhookSettingsTitle: 'Webhook- & API-Sync-Einstellungen',
      webhookSecretLabel: 'Webhook-Signiergeheimnis',
      webhookEndpointLabel: 'Eingehende Webhook-URL',
    },
    settings: {
      badge: 'Einstellungen & Workspace-Konfiguration',
      title: 'Plattform-Kalibrierung & Onboarding',
      subtitle: 'Konfigurieren Sie Firmenprofil, KI-Persona, Telefonie-Routing und Produktkataloge.',
      companyProfileStep: 'Schritt 1: Firmenprofil & Wertversprechen',
      voicePersonaStep: 'Schritt 2: KI-Sprachpersona & Telefonie-Modus',
      catalogStep: 'Schritt 3: Produktkatalog & Wissensdatenbank',
      crmStep: 'Schritt 4: CRM- & Kalender-Synchronisierung',
      apiKeysStep: 'Schritt 5: Webhooks & API-Schlüssel',
      validationStep: 'Schritt 6: KI-Katalogvalidierung & Funktionsprüfung',
      saveBtn: 'Änderungen speichern',
      validateBtn: 'Produkte mit KI validieren',
      validatingBtn: 'KI-Validierung läuft...',
    },
    admin: {
      badge: 'Admin-Sicherheit & Audit-Trail',
      title: 'Audit-Protokolle & Governance',
      subtitle: 'Unveränderliches Protokoll aller automatisierten Aktionen, Logins, Datenexporte und Telefonieverbindungen.',
      exportLogsBtn: 'Audit-Protokolle exportieren',
      searchLogsPlaceholder: 'Protokolle nach Akteur, Aktion oder Ressource filtern...',
      timestampCol: 'Zeitstempel',
      actorCol: 'Akteur',
      actionCol: 'Aktion',
      resourceCol: 'Ressource',
      ipCol: 'IP-Adresse',
      statusCol: 'Status',
    },
    footer: {
      discoveryTitle: 'Multi-Source Lead-Entdeckung',
      discoveryDesc: 'LinkedIn, X, Webseiten, Verzeichnisse, CRM & Freelance-Plattformen.',
      voiceTitle: 'KI-gestützte Sprach-Agenten',
      voiceDesc: 'Mehrsprachige Gespräche, die Interessenten qualifizieren und überzeugen.',
      enrichmentTitle: 'Smarte Lead-Anreicherung',
      enrichmentDesc: 'Verifizierte E-Mails, Telefonnummern, Unternehmensanalysen & Intent-Scoring.',
      analyticsTitle: 'Echtzeit-Analytik',
      analyticsDesc: 'Verfolgen Sie Leistung, Konversionen und Kampagnen-ROI in Echtzeit.',
      integrationsTitle: 'Nahtlose Integrationen',
      integrationsDesc: 'CRM, E-Mail, Kalender, WhatsApp, API & mehr.',
      securityTitle: 'Sicher & Skalierbar',
      securityDesc: 'Sicherheit auf Enterprise-Niveau, Datenschutz und Hochverfügbarkeit.',
    },
    profile: {
      title: 'Profildetails aktualisieren',
      subtitle: 'Aktualisieren Sie Ihr offizielles Profil, Firmendaten und Zugangsdaten.',
      fullName: 'Vollständiger Name',
      workEmail: 'Offizielle geschäftliche E-Mail',
      companyName: 'Firmenname',
      companySize: 'Unternehmensgröße',
      industry: 'Branche',
      newPassword: 'Neues Passwort (Optional)',
      passwordHint: 'Leer lassen, um Ihr aktuelles Passwort beizubehalten.',
      saveChanges: 'Änderungen speichern',
      saving: 'Wird gespeichert...',
      cancel: 'Abbrechen',
    },
    intentModal: {
      badge: 'KI-Qualifizierung & Priorisierung',
      title: 'Prädiktiver Intent-Score & Pipeline-Fit',
      subtitle: 'Bewertet nach Anforderungsübereinstimmung, Kaufabsicht, Seniorität und Firmenprofil.',
      predictiveScore: 'Prädiktiver Intent-Score',
      outOf100: '/ 100',
      authorityFit: 'Entscheider-Passung',
      budgetSignal: 'Budget-Signal',
      urgencyLevel: 'Dringlichkeitsstufe',
      pipelineFit: 'Pipeline-Passung',
      recommendedPitch: 'Empfohlener KI-Pitch-Ansatz',
      launchCallBtn: 'Sprachanruf starten',
    },
  },
  العربية: {
    leads: {
      badge: 'قاعدة بيانات العملاء المتوقعين',
      title: 'إدارة وإثراء العملاء المتوقعين',
      subtitle: 'قم بتصفية العملاء المحتملين ذوي النية العالية وتقسيمهم وتصديرهم وبدء المكالمات الذكية معهم.',
      exportCsv: 'تصدير CSV',
      importLeads: 'استيراد العملاء',
      searchPlaceholder: 'البحث عن عملاء بالاسم، الشركة، المسمى، المجال...',
      allLeads: 'جميع العملاء',
      hotSegment: '🔥 مؤكد (نقاط 90+)',
      warmSegment: '⚡ دافئ (نقاط 75-89)',
      nurtureSegment: '🌱 رعاية (<75)',
      bookedSegment: '📅 تم الحجز',
      contactCol: 'جهة الاتصال',
      companyCol: 'الشركة والقطاع',
      industryCol: 'القطاع',
      intentScoreCol: 'نقاط النية',
      statusCol: 'الحالة',
      actionsCol: 'الإجراء',
      callLead: 'الاتصال بالعميل',
      noLeads: 'لم يتم العثور على عملاء يطابقون معاييرك.',
      importModalTitle: 'استيراد العملاء عبر CSV',
      importModalDesc: 'الصق بيانات CSV أو قم بالتحميل لإدخال وتقييم عملاء جدد دفعة واحدة.',
      importSubmit: 'استيراد وتقييم العملاء',
      cancel: 'إلغاء',
    },
    campaigns: {
      badge: 'محرك التواصل الذكي',
      title: 'الحملات والأتمتة',
      subtitle: 'جدولة ومراقبة وتوسيع نطاق المكالمات الصوتية بالذكاء الاصطناعي والتواصل متعدد القنوات.',
      newCampaign: '+ حملة جديدة',
      activeCampaigns: 'الحملات النشطة',
      totalLeadsTargeted: 'إجمالي العملاء المستهدفين',
      callsConnected: 'المكالمات المتصلة',
      meetingsBooked: 'الاجتماعات المحجوزة',
      running: 'قيد التشغيل',
      paused: 'متوقف مؤقتاً',
      scheduled: 'مجدول',
      completed: 'مكتمل',
      targetIndustry: 'القطاع المستهدف',
      targetLocation: 'الموقع المستهدف',
      progress: 'التقدم',
      pauseBtn: 'إيقاف مؤقت',
      resumeBtn: 'استئناف',
    },
    voiceAgent: {
      badge: 'الاتصالات الهاتفية الحوارية',
      title: 'وكيل الاتصال الصوتي متعدد اللغات (Groq Llama 3.3 + Gemini)',
      subtitle: 'تأهيل صوتي فوري في أقل من 150 مللي ثانية، معالجة الاعتراضات، كشف البريد الصوتي، وحجز المواعيد.',
      launchCallBtn: 'بدء مكالمة صوتية حية',
      personaLabel: 'شخصية الذكاء الاصطناعي الصوتية',
      personaName: 'آفا (مسؤولة حلول المؤسسات)',
      personaStatus: '✓ نشطة ومعايرة',
      latencyLabel: 'زمن الاستجابة',
      latencyValue: '< 150 مللي ثانية (أجهزة Groq)',
      latencyDesc: 'بث فائق السرعة بزمن استجابة منخفض جداً',
      languagesLabel: 'اللغات المدعومة',
      languagesList: 'الإنجليزية، الهندية، الإسبانية، العربية، الفرنسية، الألمانية',
      languagesDesc: 'كشف اللغة الذاتي تلقائياً',
    },
    conversations: {
      badge: 'المحادثات وسجلات المكالمات',
      title: 'تسجيلات المكالمات والنصوص',
      subtitle: 'مراجعة التسجيلات وتصنيف المشاعر وملاحظات التأهيل والخطوات التالية.',
      searchPlaceholder: 'البحث في سجلات المكالمات بالاسم أو الشركة...',
      allCalls: 'جميع المكالمات',
      meetingBooked: 'تم حجز اجتماع',
      interested: 'مهتم',
      voicemail: 'تم ترك بريد صوتي',
      retryScheduled: 'إعادة محاولة مجدولة',
      summaryLabel: 'ملخص المكالمة الذكي',
      nextActionLabel: 'أفضل إجراء تالٍ',
      transcriptLabel: 'النص المباشر',
      durationLabel: 'المدة',
    },
    intelligence: {
      badge: 'ذكاء السوق والإشارات',
      title: 'معلومات الشركات الفورية',
      subtitle: 'إشارات حية، كشف الحزمة التقنية، وتيرة التوظيف، وفرص التفوق على المنافسين.',
      fundingLabel: 'التمويل ورأس المال',
      hiringLabel: 'سرعة التوظيف',
      techStackLabel: 'الحزمة التقنية المكتشفة',
      competitorLabel: 'زاوية استبدال المنافسين',
      displacementLabel: 'الزاوية الاستراتيجية',
      openRoles: 'وظائف شاغرة',
    },
    integrations: {
      badge: 'منظومة التكاملات',
      title: 'أدوات المؤسسات المتصلة',
      subtitle: 'مزامنة العملاء وحجز التقويم وتوجيه الاتصالات عبر برامجك المؤسسية الحالية.',
      connectedBadge: 'متصل',
      connectBtn: 'اتصال',
      configureBtn: 'تهيئة',
      webhookSettingsTitle: 'إعدادات Webhook ومزامنة API',
      webhookSecretLabel: 'مفتاح توقيع Webhook السري',
      webhookEndpointLabel: 'رابط Webhook الوارد',
    },
    settings: {
      badge: 'إعدادات مساحة العمل',
      title: 'معايرة المنصة والتهيئة',
      subtitle: 'تهيئة ملف تعريف الشركة، شخصية الذكاء الاصطناعي، توجيه الاتصالات، وكتالوج المنتجات.',
      companyProfileStep: 'الخطوة 1: ملف تعريف الشركة والقيمة المقترحة',
      voicePersonaStep: 'الخطوة 2: شخصية الذكاء الاصطناعي ووضع الاتصال',
      catalogStep: 'الخطوة 3: كتالوج المنتجات وقاعدة المعرفة',
      crmStep: 'الخطوة 4: مزامنة إدارة علاقات العملاء والتقويم',
      apiKeysStep: 'الخطوة 5: مفاتيح Webhooks و API',
      validationStep: 'الخطوة 6: التحقق من الكتالوج وفحص الكفاءة',
      saveBtn: 'حفظ التغييرات',
      validateBtn: 'التحقق من المنتجات بالذكاء الاصطناعي',
      validatingBtn: 'جاري التحقق بالذكاء الاصطناعي...',
    },
    admin: {
      badge: 'أمان المسؤول وسجل التدقيق',
      title: 'سجلات التدقيق والحوكمة',
      subtitle: 'سجل تدقيق غير قابل للتعديل لجميع العمليات الآلية وتسجيلات الدخول والتصدير.',
      exportLogsBtn: 'تصدير سجلات التدقيق',
      searchLogsPlaceholder: 'تصفية السجلات حسب الفاعل أو الإجراء أو المورد...',
      timestampCol: 'الطابع الزمني',
      actorCol: 'الفاعل',
      actionCol: 'الإجراء',
      resourceCol: 'المورد',
      ipCol: 'عنوان IP',
      statusCol: 'الحالة',
    },
    footer: {
      discoveryTitle: 'اكتشاف العملاء متعددي المصادر',
      discoveryDesc: 'لينكد إن، إكس، المواقع، الأدلة، CRM ومنصات العمل الحر.',
      voiceTitle: 'وكلاء صوتيون بالذكاء الاصطناعي',
      voiceDesc: 'محادثات متعددة اللغات تؤهل وتتفاعل مع العملاء المحتملين.',
      enrichmentTitle: 'إثراء ذكي للبيانات',
      enrichmentDesc: 'بريد إلكتروني موثق، هواتف، تحليلات الشركات ونقاط النية.',
      analyticsTitle: 'تحليلات فورية',
      analyticsDesc: 'تتبع الأداء والتحويلات وعائد الاستثمار في الوقت الفعلي.',
      integrationsTitle: 'تكامل سلس',
      integrationsDesc: 'إدارة علاقات العملاء، البريد، التقويم، واتساب، API والمزيد.',
      securityTitle: 'آمن وقابل للتوسع',
      securityDesc: 'أمان على مستوى المؤسسات، خصوصية وتوافر عالٍ.',
    },
    profile: {
      title: 'تحديث بيانات الملف الشخصي',
      subtitle: 'تحديث ملفك الشخصي الرسمي، معلومات الشركة، وبيانات الاعتماد.',
      fullName: 'الاسم الكامل',
      workEmail: 'البريد الإلكتروني المهني الرسمي',
      companyName: 'اسم الشركة',
      companySize: 'حجم الشركة',
      industry: 'مجال العمل',
      newPassword: 'كلمة المرور الجديدة (اختياري)',
      passwordHint: 'اتركه فارغاً للاحتفاظ بكلمة المرور الحالية.',
      saveChanges: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      cancel: 'إلغاء',
    },
    intentModal: {
      badge: 'التأهيل وترتيب الأولويات بالذكاء الاصطناعي',
      title: 'نقاط النية التنبؤية وملاءمة مسار المبيعات',
      subtitle: 'تقييم يعتمد على ملاءمة المتطلبات، نية الشراء، الأقدمية وملف الشركة.',
      predictiveScore: 'نقاط النية التنبؤية',
      outOf100: '/ 100',
      authorityFit: 'ملاءمة الصلاحية',
      budgetSignal: 'إشارة الميزانية',
      urgencyLevel: 'مستوى الاستعجال',
      pipelineFit: 'ملاءمة مسار المبيعات',
      recommendedPitch: 'زاوية الطرح الموصى بها',
      launchCallBtn: 'بدء مكالمة صوتية',
    },
  },
};

export function getHubsTranslation(language: string): HubsTranslationBundle {
  return HUBS_TRANSLATIONS[language as HubsSupportedLanguage] || HUBS_TRANSLATIONS.English;
}
