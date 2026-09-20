export type SupportedLanguage = 'English' | 'Español' | 'हिन्दी' | 'Français' | 'Deutsch' | 'العربية';

export interface TranslationDictionary {
  // Brand & Header
  platformTitle: string;
  autonomousBadge: string;
  tagline: string;
  onePlatformSubtitle: string;
  moreConversations: string;
  closeDeals: string;
  newCampaign: string;
  importCsv: string;

  // Value Pillars
  discoveryPillar: string;
  discoveryDesc: string;
  voicePillar: string;
  voiceDesc: string;
  enrichmentPillar: string;
  enrichmentDesc: string;
  insightsPillar: string;
  insightsDesc: string;

  // Sidebar
  navDashboard: string;
  navLeadDiscovery: string;
  navLeads: string;
  navCampaigns: string;
  navVoiceAgent: string;
  navConversations: string;
  navAnalytics: string;
  navMarketIntelligence: string;
  navIntegrations: string;
  navBilling: string;
  navSettings: string;
  navAdmin: string;
  voiceQuota: string;
  voiceMinutesUsed: string;

  // Overview KPIs
  kpiOverviewTitle: string;
  kpiLeadsDiscovered: string;
  kpiLeadsEnriched: string;
  kpiCallsMade: string;
  kpiMeetingsBooked: string;

  // Search & Filter
  searchPlaceholder: string;
  searchBtn: string;
  discoveringBtn: string;
  allSources: string;
  allIndustries: string;
  benchmarkBadge: string;
  benchmarkDesc: string;
  typeCustomQuery: string;

  // Discovered Card
  highIntentOpp: string;
  intentScoreLabel: string;
  launchAiCall: string;
  connectOnPlatform: string;
  leadEnrichedDetails: string;
  discoveredOn: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyLabel: string;
  websiteLabel: string;
  jobTitleLabel: string;
  industrySizeLabel: string;
  originalPostUrlLabel: string;
  verifiedBadge: string;
  notDisclosedBadge: string;
  activeRequirementBadge: string;
  aiLogicTitle: string;
  showLogicDetails: string;
  hideLogicDetails: string;
  fitScoreLabel: string;
  semanticMatchTitle: string;
  matchedTags: string;
  authorityCol: string;
  budgetCol: string;
  urgencyCol: string;
  fitCol: string;
  recommendedPitchTitle: string;

  // Voice Modal
  voiceSimulatorTitle: string;
  outboundCallTo: string;
  connectedStatus: string;
  ringingStatus: string;
  endCallBtn: string;
  aiSalesAgentLabel: string;
  typeSpokenWords: string;
  callSummaryTitle: string;
  nextBestActionTitle: string;
  outcomesHandledTitle: string;
  interestedBadge: string;
  meetingBookedBadge: string;
  voicemailBadge: string;
  retryBadge: string;
  multilingualTitle: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  English: {
    platformTitle: 'AI Sales Agent Platform',
    autonomousBadge: 'Autonomous v2.4',
    tagline: 'Discover. Qualify. Engage. Convert — All with AI.',
    onePlatformSubtitle: 'One Platform. End-to-End Autonomous Sales Workflow.',
    moreConversations: 'More Conversations. More Meetings.',
    closeDeals: 'Let AI do the prospecting while you close deals.',
    newCampaign: 'New Campaign',
    importCsv: 'Import CSV',

    discoveryPillar: 'AI Lead Discovery',
    discoveryDesc: 'Find high-intent leads across public channels',
    voicePillar: 'AI Voice Agents',
    voiceDesc: 'Multilingual calls that qualify & book meetings',
    enrichmentPillar: 'Smart Enrichment',
    enrichmentDesc: 'Verified contacts & company intelligence',
    insightsPillar: 'Actionable Insights',
    insightsDesc: 'Real-time pipeline ROI & conversation metrics',

    navDashboard: 'Dashboard',
    navLeadDiscovery: 'Lead Discovery',
    navLeads: 'Leads',
    navCampaigns: 'Campaigns',
    navVoiceAgent: 'AI Voice Agent',
    navConversations: 'Conversations',
    navAnalytics: 'Analytics',
    navMarketIntelligence: 'Market Intelligence',
    navIntegrations: 'Integrations',
    navBilling: 'Billing & Plans',
    navSettings: 'Settings',
    navAdmin: 'Admin & Audit',
    voiceQuota: 'Voice Minutes Quota',
    voiceMinutesUsed: 'mins used',

    kpiOverviewTitle: 'Dashboard Overview',
    kpiLeadsDiscovered: 'Leads Discovered',
    kpiLeadsEnriched: 'Leads Enriched',
    kpiCallsMade: 'AI Calls Made',
    kpiMeetingsBooked: 'Meetings Booked',

    searchPlaceholder: 'Search requirements e.g. SharePoint, Cloud Migration, CRM...',
    searchBtn: 'Search',
    discoveringBtn: 'Discovering...',
    allSources: 'All Sources',
    allIndustries: 'All Industries',
    benchmarkBadge: 'Benchmark Example',
    benchmarkDesc: 'Showing pre-loaded demonstration data for "SharePoint Implementation Partner".',
    typeCustomQuery: 'Type any business query above to run live discovery →',

    highIntentOpp: 'High Intent Opportunity',
    intentScoreLabel: 'Intent Score',
    launchAiCall: 'Launch AI Call',
    connectOnPlatform: 'Connect on',
    leadEnrichedDetails: 'Lead Enriched Details',
    discoveredOn: 'Discovered',
    contactName: 'Name',
    contactEmail: 'Email',
    contactPhone: 'Phone',
    companyLabel: 'Company',
    websiteLabel: 'Website',
    jobTitleLabel: 'Job Title',
    industrySizeLabel: 'Industry & Size',
    originalPostUrlLabel: 'Original Post URL',
    verifiedBadge: 'Verified',
    notDisclosedBadge: 'Not publicly disclosed',
    activeRequirementBadge: 'Active Requirement',
    aiLogicTitle: 'AI Discovery & Qualification Logic',
    showLogicDetails: 'Show Logic Details',
    hideLogicDetails: 'Hide Logic Details',
    fitScoreLabel: 'Fit Score',
    semanticMatchTitle: 'Semantic Match & Buying Intent Rationale',
    matchedTags: 'Matched Tags',
    authorityCol: 'Authority',
    budgetCol: 'Budget Signal',
    urgencyCol: 'Urgency & Timeline',
    fitCol: 'Requirement Fit',
    recommendedPitchTitle: 'Recommended AI Voice Consultation Angle',

    voiceSimulatorTitle: 'AI Voice Call Simulator',
    outboundCallTo: 'Outbound call to',
    connectedStatus: 'Connected',
    ringingStatus: 'Ringing...',
    endCallBtn: 'End Call',
    aiSalesAgentLabel: 'AI Sales Agent (Ava)',
    typeSpokenWords: "Type spoken response or click suggestions above...",
    callSummaryTitle: 'Call Summary',
    nextBestActionTitle: 'Next Best Action',
    outcomesHandledTitle: 'Outcomes Handled Automatically',
    interestedBadge: '✓ Interested',
    meetingBookedBadge: '📅 Meeting Booked',
    voicemailBadge: 'Voicemail Left',
    retryBadge: 'Retry Scheduled',
    multilingualTitle: 'Multilingual AI Voice Calling',
  },

  Español: {
    platformTitle: 'Plataforma de Agentes de Ventas IA',
    autonomousBadge: 'Autónomo v2.4',
    tagline: 'Descubrir. Calificar. Contactar. Convertir — Todo con IA.',
    onePlatformSubtitle: 'Una plataforma. Flujo de ventas autónomo de extremo a extremo.',
    moreConversations: 'Más Conversaciones. Más Reuniones.',
    closeDeals: 'Deja que la IA prospeccione mientras cierras acuerdos.',
    newCampaign: 'Nueva Campaña',
    importCsv: 'Importar CSV',

    discoveryPillar: 'Descubrimiento IA',
    discoveryDesc: 'Encuentra prospectos de alta intención en canales públicos',
    voicePillar: 'Agentes de Voz IA',
    voiceDesc: 'Llamadas multilingües que califican y agendan reuniones',
    enrichmentPillar: 'Enriquecimiento Inteligente',
    enrichmentDesc: 'Contactos verificados e inteligencia empresarial',
    insightsPillar: 'Métricas Clave',
    insightsDesc: 'ROI del embudo en tiempo real y métricas de llamadas',

    navDashboard: 'Panel de Control',
    navLeadDiscovery: 'Descubrimiento de Prospectos',
    navLeads: 'Prospectos',
    navCampaigns: 'Campañas',
    navVoiceAgent: 'Agente de Voz IA',
    navConversations: 'Conversaciones',
    navAnalytics: 'Analíticas',
    navMarketIntelligence: 'Inteligencia de Mercado',
    navIntegrations: 'Integraciones',
    navBilling: 'Facturación y Planes',
    navSettings: 'Configuración',
    navAdmin: 'Administración y Auditoría',
    voiceQuota: 'Cuota de Minutos de Voz',
    voiceMinutesUsed: 'mins usados',

    kpiOverviewTitle: 'Resumen del Panel',
    kpiLeadsDiscovered: 'Prospectos Descubiertos',
    kpiLeadsEnriched: 'Prospectos Enriquecidos',
    kpiCallsMade: 'Llamadas IA Realizadas',
    kpiMeetingsBooked: 'Reuniones Agendadas',

    searchPlaceholder: 'Buscar requisitos ej. SharePoint, Migración Cloud, CRM...',
    searchBtn: 'Buscar',
    discoveringBtn: 'Descubriendo...',
    allSources: 'Todas las Fuentes',
    allIndustries: 'Todas las Industrias',
    benchmarkBadge: 'Ejemplo Demostrativo',
    benchmarkDesc: 'Mostrando datos de referencia para "Socio de Implementación de SharePoint".',
    typeCustomQuery: 'Escribe cualquier consulta arriba para ejecutar descubrimiento en vivo →',

    highIntentOpp: 'Oportunidad de Alta Intención',
    intentScoreLabel: 'Puntaje de Intención',
    launchAiCall: 'Iniciar Llamada IA',
    connectOnPlatform: 'Conectar en',
    leadEnrichedDetails: 'Detalles Enriquecidos del Prospecto',
    discoveredOn: 'Descubierto',
    contactName: 'Nombre',
    contactEmail: 'Correo Electrónico',
    contactPhone: 'Teléfono',
    companyLabel: 'Empresa',
    websiteLabel: 'Sitio Web',
    jobTitleLabel: 'Cargo',
    industrySizeLabel: 'Industria y Tamaño',
    originalPostUrlLabel: 'URL de Publicación Original',
    verifiedBadge: 'Verificado',
    notDisclosedBadge: 'No divulgado públicamente',
    activeRequirementBadge: 'Requisito Activo',
    aiLogicTitle: 'Lógica IA de Descubrimiento y Calificación',
    showLogicDetails: 'Mostrar Detalles de Lógica',
    hideLogicDetails: 'Ocultar Detalles de Lógica',
    fitScoreLabel: 'Puntaje de Ajuste',
    semanticMatchTitle: 'Coincidencia Semántica y Razón de Intención',
    matchedTags: 'Etiquetas Coincidentes',
    authorityCol: 'Autoridad',
    budgetCol: 'Presupuesto',
    urgencyCol: 'Urgencia y Tiempo',
    fitCol: 'Ajuste del Requisito',
    recommendedPitchTitle: 'Propuesta de Consulta de Voz IA Recomendada',

    voiceSimulatorTitle: 'Simulador de Llamadas de Voz IA',
    outboundCallTo: 'Llamada saliente a',
    connectedStatus: 'Conectado',
    ringingStatus: 'Llamando...',
    endCallBtn: 'Finalizar Llamada',
    aiSalesAgentLabel: 'Agente de Ventas IA (Ava)',
    typeSpokenWords: 'Escribe la respuesta o haz clic en las sugerencias...',
    callSummaryTitle: 'Resumen de Llamada',
    nextBestActionTitle: 'Siguiente Mejor Acción',
    outcomesHandledTitle: 'Resultados Gestionados Automáticamente',
    interestedBadge: '✓ Interesado',
    meetingBookedBadge: '📅 Reunión Agendada',
    voicemailBadge: 'Mensaje de Voz Dejado',
    retryBadge: 'Reintento Programado',
    multilingualTitle: 'Llamadas de Voz IA Multilingües',
  },

  'हिन्दी': {
    platformTitle: 'एआई सेल्स एजेंट प्लेटफॉर्म',
    autonomousBadge: 'ऑटोनॉमस v2.4',
    tagline: 'खोजें. योग्य बनाएं. संपर्क करें. परिवर्तित करें — सब कुछ AI से।',
    onePlatformSubtitle: 'एक प्लेटफॉर्म। संपूर्ण स्वचालित बिक्री प्रक्रिया।',
    moreConversations: 'अधिक बातचीत। अधिक बैठकें।',
    closeDeals: 'AI को संभावित ग्राहक खोजने दें, आप डील क्लोज़ करने पर ध्यान दें।',
    newCampaign: 'नया अभियान',
    importCsv: 'CSV आयात करें',

    discoveryPillar: 'AI लीड खोज',
    discoveryDesc: 'सार्वजनिक चैनलों पर उच्च-इरादे वाले ग्राहक खोजें',
    voicePillar: 'AI वॉयस एजेंट्स',
    voiceDesc: 'बहुभाषी कॉल्स जो योग्य बनाती हैं और मीटिंग्स बुक करती हैं',
    enrichmentPillar: 'स्मार्ट संवर्धन',
    enrichmentDesc: 'सत्यापित संपर्क और कंपनी इंटेलिजेंस',
    insightsPillar: 'व्यावहारिक अंतर्दृष्टि',
    insightsDesc: 'रीयल-टाइम पाइपलाइन ROI और कॉल मेट्रिक्स',

    navDashboard: 'डैशबोर्ड',
    navLeadDiscovery: 'लीड खोज',
    navLeads: 'लीड्स',
    navCampaigns: 'अभियान',
    navVoiceAgent: 'AI वॉयस एजेंट',
    navConversations: 'बातचीत',
    navAnalytics: 'एनालिटिक्स',
    navMarketIntelligence: 'मार्केट इंटेलिजेंस',
    navIntegrations: 'इंटीग्रेशन्स',
    navBilling: 'बिलिंग और प्लान्स',
    navSettings: 'सेटिंग्स',
    navAdmin: 'एडमिन और ऑडिट',
    voiceQuota: 'वॉयस मिनट्स कोटा',
    voiceMinutesUsed: 'मिनट उपयोग किए गए',

    kpiOverviewTitle: 'डैशबोर्ड अवलोकन',
    kpiLeadsDiscovered: 'खोजे गए लीड्स',
    kpiLeadsEnriched: 'संवर्धित लीड्स',
    kpiCallsMade: 'AI द्वारा की गई कॉल्स',
    kpiMeetingsBooked: 'बुक की गई बैठकें',

    searchPlaceholder: 'आवश्यकता खोजें जैसे SharePoint, Cloud Migration, CRM...',
    searchBtn: 'खोजें',
    discoveringBtn: 'खोज जारी है...',
    allSources: 'सभी स्रोत',
    allIndustries: 'सभी उद्योग',
    benchmarkBadge: 'बेंचमार्क उदाहरण',
    benchmarkDesc: '"SharePoint Implementation Partner" के लिए नमूना डेटा दिखाया जा रहा है।',
    typeCustomQuery: 'लाइव खोज करने के लिए ऊपर कोई भी व्यापारिक क्वेरी दर्ज करें →',

    highIntentOpp: 'उच्च इरादा अवसर',
    intentScoreLabel: 'इंटेंट स्कोर',
    launchAiCall: 'AI कॉल शुरू करें',
    connectOnPlatform: 'पर कनेक्ट करें',
    leadEnrichedDetails: 'लीड संवर्धित विवरण',
    discoveredOn: 'खोजा गया',
    contactName: 'नाम',
    contactEmail: 'ईमेल',
    contactPhone: 'फ़ोन',
    companyLabel: 'कंपनी',
    websiteLabel: 'वेबसाइट',
    jobTitleLabel: 'पद',
    industrySizeLabel: 'उद्योग और आकार',
    originalPostUrlLabel: 'मूल पोस्ट लिंक',
    verifiedBadge: 'सत्यापित',
    notDisclosedBadge: 'सार्वजनिक रूप से उपलब्ध नहीं',
    activeRequirementBadge: 'सक्रिय आवश्यकता',
    aiLogicTitle: 'AI खोज और योग्यता तर्क',
    showLogicDetails: 'तर्क विवरण देखें',
    hideLogicDetails: 'तर्क विवरण छुपाएं',
    fitScoreLabel: 'फिट स्कोर',
    semanticMatchTitle: 'सिमेंटिक मिलान और खरीद इरादा तर्क',
    matchedTags: 'मेल खाने वाले टैग',
    authorityCol: 'अधिकार',
    budgetCol: 'बजट संकेत',
    urgencyCol: 'अत्यावश्यकता',
    fitCol: 'आवश्यकता उपयुक्तता',
    recommendedPitchTitle: 'अनुशंसित AI वॉयस परामर्श दृष्टिकोण',

    voiceSimulatorTitle: 'AI वॉयस कॉल सिम्युलेटर',
    outboundCallTo: 'आउटबाउंड कॉल',
    connectedStatus: 'कनेक्टेड',
    ringingStatus: 'घंटी बज रही है...',
    endCallBtn: 'कॉल समाप्त करें',
    aiSalesAgentLabel: 'AI सेल्स एजेंट (Ava)',
    typeSpokenWords: 'बोली जाने वाली प्रतिक्रिया टाइप करें या सुझाव चुनें...',
    callSummaryTitle: 'कॉल सारांश',
    nextBestActionTitle: 'अगली सर्वोत्तम कार्रवाई',
    outcomesHandledTitle: 'स्वचालित रूप से संभाले गए परिणाम',
    interestedBadge: '✓ रुचि रखते हैं',
    meetingBookedBadge: '📅 बैठक बुक हो गई',
    voicemailBadge: 'वॉयसमेल छोड़ा',
    retryBadge: 'पुनः प्रयास निर्धारित',
    multilingualTitle: 'बहुभाषी AI वॉयस कॉलिंग',
  },

  Français: {
    platformTitle: "Plateforme d'Agents Commerciaux IA",
    autonomousBadge: 'Autonome v2.4',
    tagline: 'Découvrir. Qualifier. Engager. Convertir — Tout avec l’IA.',
    onePlatformSubtitle: 'Une seule plateforme. Flux de vente autonome de bout en bout.',
    moreConversations: 'Plus de Conversations. Plus de Réunions.',
    closeDeals: 'Laissez l’IA prospecter pendant que vous concluez des affaires.',
    newCampaign: 'Nouvelle Campagne',
    importCsv: 'Importer CSV',

    discoveryPillar: 'Découverte IA',
    discoveryDesc: 'Trouvez des prospects à forte intention sur les canaux publics',
    voicePillar: 'Agents Vocaux IA',
    voiceDesc: 'Appels multilingues qui qualifient et réservent des réunions',
    enrichmentPillar: 'Enrichissement Intelligent',
    enrichmentDesc: 'Contacts vérifiés et veille d’entreprise',
    insightsPillar: 'Analyses Clés',
    insightsDesc: 'ROI du pipeline en temps réel et métriques de conversation',

    navDashboard: 'Tableau de bord',
    navLeadDiscovery: 'Découverte de Prospects',
    navLeads: 'Prospects',
    navCampaigns: 'Campagnes',
    navVoiceAgent: 'Agent Vocal IA',
    navConversations: 'Conversations',
    navAnalytics: 'Analytique',
    navMarketIntelligence: 'Intelligence de Marché',
    navIntegrations: 'Intégrations',
    navBilling: 'Facturation et Forfaits',
    navSettings: 'Paramètres',
    navAdmin: 'Administration et Audit',
    voiceQuota: 'Quota de Minutes Vocales',
    voiceMinutesUsed: 'mins utilisées',

    kpiOverviewTitle: 'Aperçu du Tableau de Bord',
    kpiLeadsDiscovered: 'Prospects Découverts',
    kpiLeadsEnriched: 'Prospects Enrichis',
    kpiCallsMade: 'Appels IA Effectués',
    kpiMeetingsBooked: 'Réunions Réservées',

    searchPlaceholder: 'Rechercher des besoins ex. SharePoint, Migration Cloud, CRM...',
    searchBtn: 'Rechercher',
    discoveringBtn: 'Découverte en cours...',
    allSources: 'Toutes les Sources',
    allIndustries: 'Toutes les Industries',
    benchmarkBadge: 'Exemple de Référence',
    benchmarkDesc: 'Affichage des données de test pour "Partenaire d’implémentation SharePoint".',
    typeCustomQuery: 'Tapez une requête ci-dessus pour lancer la recherche en direct →',

    highIntentOpp: 'Opportunité à Forte Intention',
    intentScoreLabel: 'Score d’Intention',
    launchAiCall: 'Lancer l’Appel IA',
    connectOnPlatform: 'Se connecter sur',
    leadEnrichedDetails: 'Détails Enrichis du Prospect',
    discoveredOn: 'Découvert',
    contactName: 'Nom',
    contactEmail: 'E-mail',
    contactPhone: 'Téléphone',
    companyLabel: 'Entreprise',
    websiteLabel: 'Site Web',
    jobTitleLabel: 'Titre du Poste',
    industrySizeLabel: 'Secteur et Taille',
    originalPostUrlLabel: 'URL de la Publication Originale',
    verifiedBadge: 'Vérifié',
    notDisclosedBadge: 'Non divulgué publiquement',
    activeRequirementBadge: 'Besoin Actif',
    aiLogicTitle: 'Logique IA de Découverte et Qualification',
    showLogicDetails: 'Afficher les Détails de la Logique',
    hideLogicDetails: 'Masquer les Détails de la Logique',
    fitScoreLabel: 'Score d’Adéquation',
    semanticMatchTitle: 'Correspondance Sémantique et Justification d’Achat',
    matchedTags: 'Mots-clés Correspondants',
    authorityCol: 'Autorité',
    budgetCol: 'Signal Budgétaire',
    urgencyCol: 'Urgence et Délai',
    fitCol: 'Adéquation au Besoin',
    recommendedPitchTitle: 'Angle de Consultation Vocale IA Recommandé',

    voiceSimulatorTitle: 'Simulateur d’Appel Vocal IA',
    outboundCallTo: 'Appel sortant vers',
    connectedStatus: 'Connecté',
    ringingStatus: 'Sonnerie...',
    endCallBtn: 'Terminer l’Appel',
    aiSalesAgentLabel: 'Agent Commercial IA (Ava)',
    typeSpokenWords: 'Tapez la réponse ou cliquez sur les suggestions...',
    callSummaryTitle: 'Résumé de l’Appel',
    nextBestActionTitle: 'Prochaine Meilleure Action',
    outcomesHandledTitle: 'Résultats Gérés Automatiquement',
    interestedBadge: '✓ Intéressé',
    meetingBookedBadge: '📅 Réunion Réservée',
    voicemailBadge: 'Message Vocal Laissé',
    retryBadge: 'Rappel Planifié',
    multilingualTitle: 'Appels Vocaux IA Multilingues',
  },

  Deutsch: {
    platformTitle: 'KI-Vertriebsagenten-Plattform',
    autonomousBadge: 'Autonom v2.4',
    tagline: 'Entdecken. Qualifizieren. Kontaktieren. Konvertieren — Alles mit KI.',
    onePlatformSubtitle: 'Eine Plattform. Durchgängiger autonomer Vertriebs-Workflow.',
    moreConversations: 'Mehr Gespräche. Mehr Meetings.',
    closeDeals: 'Überlassen Sie der KI die Akquise, während Sie Abschlüsse erzielen.',
    newCampaign: 'Neue Kampagne',
    importCsv: 'CSV Importieren',

    discoveryPillar: 'KI-Lead-Entdeckung',
    discoveryDesc: 'Finden Sie kaufbereite Leads in öffentlichen Kanälen',
    voicePillar: 'KI-Sprachagenten',
    voiceDesc: 'Mehrsprachige Anrufe zur Qualifizierung & Terminbuchung',
    enrichmentPillar: 'Intelligente Anreicherung',
    enrichmentDesc: 'Verifizierte Kontakte und Unternehmensdaten',
    insightsPillar: 'Verwertbare Erkenntnisse',
    insightsDesc: 'Echtzeit-Pipeline-ROI und Konversationsmetriken',

    navDashboard: 'Dashboard',
    navLeadDiscovery: 'Lead-Entdeckung',
    navLeads: 'Leads',
    navCampaigns: 'Kampagnen',
    navVoiceAgent: 'KI-Sprachagent',
    navConversations: 'Gespräche',
    navAnalytics: 'Analysen',
    navMarketIntelligence: 'Markt-Intelligence',
    navIntegrations: 'Integrationen',
    navBilling: 'Abrechnung & Pläne',
    navSettings: 'Einstellungen',
    navAdmin: 'Administration & Audit',
    voiceQuota: 'Sprachminuten-Kontingent',
    voiceMinutesUsed: 'Min. verbraucht',

    kpiOverviewTitle: 'Dashboard-Übersicht',
    kpiLeadsDiscovered: 'Leads Entdeckt',
    kpiLeadsEnriched: 'Leads Angereichert',
    kpiCallsMade: 'KI-Anrufe Getätigt',
    kpiMeetingsBooked: 'Meetings Gebucht',

    searchPlaceholder: 'Bedarf suchen z.B. SharePoint, Cloud Migration, CRM...',
    searchBtn: 'Suchen',
    discoveringBtn: 'Suche läuft...',
    allSources: 'Alle Quellen',
    allIndustries: 'Alle Branchen',
    benchmarkBadge: 'Benchmark-Beispiel',
    benchmarkDesc: 'Zeigt Beispieldaten für "SharePoint Implementierungspartner".',
    typeCustomQuery: 'Geben Sie oben eine Suchanfrage ein, um Live-Ergebnisse zu erhalten →',

    highIntentOpp: 'Hochqualifizierte Verkaufschance',
    intentScoreLabel: 'Absichts-Score',
    launchAiCall: 'KI-Anruf Starten',
    connectOnPlatform: 'Vernetzen auf',
    leadEnrichedDetails: 'Angereicherte Lead-Details',
    discoveredOn: 'Entdeckt am',
    contactName: 'Name',
    contactEmail: 'E-Mail',
    contactPhone: 'Telefon',
    companyLabel: 'Unternehmen',
    websiteLabel: 'Webseite',
    jobTitleLabel: 'Position',
    industrySizeLabel: 'Branche & Größe',
    originalPostUrlLabel: 'Original-Beitrags-URL',
    verifiedBadge: 'Verifiziert',
    notDisclosedBadge: 'Nicht öffentlich angegeben',
    activeRequirementBadge: 'Aktiver Bedarf',
    aiLogicTitle: 'KI-Entdeckungs- & Qualifizierungslogik',
    showLogicDetails: 'Logik-Details Anzeigen',
    hideLogicDetails: 'Logik-Details Ausblenden',
    fitScoreLabel: 'Passgenauigkeits-Score',
    semanticMatchTitle: 'Semantische Übereinstimmung & Kaufabsicht',
    matchedTags: 'Übereinstimmende Tags',
    authorityCol: 'Entscheidungskraft',
    budgetCol: 'Budgetsignal',
    urgencyCol: 'Dringlichkeit & Zeitrahmen',
    fitCol: 'Anforderungspassung',
    recommendedPitchTitle: 'Empfohlener KI-Beratungsansatz',

    voiceSimulatorTitle: 'KI-Sprachanruf-Simulator',
    outboundCallTo: 'Ausgehender Anruf an',
    connectedStatus: 'Verbunden',
    ringingStatus: 'Klingelt...',
    endCallBtn: 'Anruf Beenden',
    aiSalesAgentLabel: 'KI-Vertriebsagent (Ava)',
    typeSpokenWords: 'Gesprochene Antwort tippen oder Vorschläge anklicken...',
    callSummaryTitle: 'Anruf-Zusammenfassung',
    nextBestActionTitle: 'Nächste Beste Aktion',
    outcomesHandledTitle: 'Automatisch Behandelte Ergebnisse',
    interestedBadge: '✓ Interessiert',
    meetingBookedBadge: '📅 Termin Gebucht',
    voicemailBadge: 'Mailbox Hinterlassen',
    retryBadge: 'Wiedervorlage Geplant',
    multilingualTitle: 'Mehrsprachige KI-Sprachanrufe',
  },

  'العربية': {
    platformTitle: 'منصة وكلاء المبيعات بالذكاء الاصطناعي',
    autonomousBadge: 'ذاتي التشغيل v2.4',
    tagline: 'اكتشف. أهّل. تواصل. حوّل — كل ذلك بالذكاء الاصطناعي.',
    onePlatformSubtitle: 'منصة واحدة. تدفق مبيعات ذاتي التشغيل بالكامل من البداية حتى الإغلاق.',
    moreConversations: 'محادثات أكثر. اجتماعات أكثر.',
    closeDeals: 'دع الذكاء الاصطناعي يتولى استكشاف العملاء بينما تركز على إتمام الصفقات.',
    newCampaign: 'حملة جديدة',
    importCsv: 'استيراد CSV',

    discoveryPillar: 'اكتشاف العملاء بالذكاء الاصطناعي',
    discoveryDesc: 'ابحث عن عملاء محتملين ذوي نية عالية عبر القنوات العامة',
    voicePillar: 'وكلاء صوتيون ذكيون',
    voiceDesc: 'مكالمات متعددة اللغات لتأهيل العملاء وحجز الاجتماعات',
    enrichmentPillar: 'إثراء ذكي للبيانات',
    enrichmentDesc: 'بيانات اتصال موثقة ومعلومات تجارية دقيقة',
    insightsPillar: 'رؤى قابلة للتنفيذ',
    insightsDesc: 'عائد خط المبيعات الفوري وإحصائيات المحادثات',

    navDashboard: 'لوحة التحكم',
    navLeadDiscovery: 'اكتشاف العملاء',
    navLeads: 'العملاء المحتملون',
    navCampaigns: 'الحملات',
    navVoiceAgent: 'الوكيل الصوتي الذكي',
    navConversations: 'المحادثات',
    navAnalytics: 'التحليلات',
    navMarketIntelligence: 'ذكاء السوق',
    navIntegrations: 'التكاملات',
    navBilling: 'الفواتير والخطط',
    navSettings: 'الإعدادات',
    navAdmin: 'الإدارة والتدقيق',
    voiceQuota: 'رصيد دقائق المكالمات',
    voiceMinutesUsed: 'دقيقة مستخدمة',

    kpiOverviewTitle: 'نظرة عامة على لوحة التحكم',
    kpiLeadsDiscovered: 'العملاء المكتشفون',
    kpiLeadsEnriched: 'العملاء الذين تم إثراؤهم',
    kpiCallsMade: 'مكالمات الذكاء الاصطناعي',
    kpiMeetingsBooked: 'الاجتماعات المحجوزة',

    searchPlaceholder: 'ابحث عن متطلبات مثل SharePoint, Cloud Migration, CRM...',
    searchBtn: 'بحث',
    discoveringBtn: 'جارٍ البحث...',
    allSources: 'جميع المصادر',
    allIndustries: 'جميع القطاعات',
    benchmarkBadge: 'نموذج تجريبي',
    benchmarkDesc: 'عرض بيانات توضيحية لـ "شريك تنفيذ SharePoint".',
    typeCustomQuery: 'اكتب أي طلب عمل أعلاه لتشغيل الاكتشاف المباشر →',

    highIntentOpp: 'فرصة عالية النية',
    intentScoreLabel: 'معدل النية',
    launchAiCall: 'بدء مكالمة الذكاء الاصطناعي',
    connectOnPlatform: 'تواصل عبر',
    leadEnrichedDetails: 'تفاصيل العميل المُثرية',
    discoveredOn: 'تم الاكتشاف في',
    contactName: 'الاسم',
    contactEmail: 'البريد الإلكتروني',
    contactPhone: 'الهاتف',
    companyLabel: 'الشركة',
    websiteLabel: 'الموقع الإلكتروني',
    jobTitleLabel: 'المسمى الوظيفي',
    industrySizeLabel: 'القطاع وحجم الشركة',
    originalPostUrlLabel: 'رابط المنشور الأصلي',
    verifiedBadge: 'موثق',
    notDisclosedBadge: 'غير معلن علناً',
    activeRequirementBadge: 'متطلب نشط',
    aiLogicTitle: 'منطق الذكاء الاصطناعي للاكتشاف والتأهيل',
    showLogicDetails: 'إظهار تفاصيل المنطق',
    hideLogicDetails: 'إخفاء تفاصيل المنطق',
    fitScoreLabel: 'معدل الملاءمة',
    semanticMatchTitle: 'التطابق الدلالي وتبرير نية الشراء',
    matchedTags: 'الوسوم المتطابقة',
    authorityCol: 'سلطة اتخاذ القرار',
    budgetCol: 'مؤشر الميزانية',
    urgencyCol: 'مدى الإلحاح والجدول الزمني',
    fitCol: 'ملاءمة المتطلب',
    recommendedPitchTitle: 'زاوية الاستشارة الصوتية المقترحة',

    voiceSimulatorTitle: 'محاكي المكالمات الصوتية بالذكاء الاصطناعي',
    outboundCallTo: 'مكالمة صادرة إلى',
    connectedStatus: 'متصل',
    ringingStatus: 'جارٍ الاتصال...',
    endCallBtn: 'إنهاء المكالمة',
    aiSalesAgentLabel: 'وكيل المبيعات الذكي (Ava)',
    typeSpokenWords: 'اكتب إجابة العميل أو اختر من الاقتراحات أعلاه...',
    callSummaryTitle: 'ملخص المكالمة',
    nextBestActionTitle: 'أفضل إجراء تالٍ',
    outcomesHandledTitle: 'النتائج المعالجة تلقائياً',
    interestedBadge: '✓ مهتم',
    meetingBookedBadge: '📅 تم حجز الاجتماع',
    voicemailBadge: 'تم ترك بريد صوتي',
    retryBadge: 'إعادة المحاولة مجدولة',
    multilingualTitle: 'مكالمات صوتية ذكية متعددة اللغات',
  },
};

export function getTranslation(language: string): TranslationDictionary {
  if (language in TRANSLATIONS) {
    return TRANSLATIONS[language as SupportedLanguage];
  }
  return TRANSLATIONS.English;
}

export function getLocaleForVoice(language: string): string {
  switch (language) {
    case 'Español':
      return 'es-ES';
    case 'हिन्दी':
      return 'hi-IN';
    case 'Français':
      return 'fr-FR';
    case 'Deutsch':
      return 'de-DE';
    case 'العربية':
      return 'ar-SA';
    case 'English':
    default:
      return 'en-US';
  }
}

export function getAiGreeting(language: string, firstName: string, company: string, requirementTopic: string): string {
  switch (language) {
    case 'Español':
      return `Hola ${firstName}, soy Ava de TechNova Solutions. Le llamo en referencia a ${requirementTopic}.`;
    case 'हिन्दी':
      return `नमस्ते ${firstName}, मैं TechNova Solutions से Ava बोल रही हूँ। मैं ${requirementTopic} के संबंध में संपर्क कर रही हूँ।`;
    case 'Français':
      return `Bonjour ${firstName}, je suis Ava de TechNova Solutions. Je vous appelle au sujet de ${requirementTopic}.`;
    case 'Deutsch':
      return `Hallo ${firstName}, ich bin Ava von TechNova Solutions. Ich rufe bezüglich ${requirementTopic} an.`;
    case 'العربية':
      return `مرحباً ${firstName}، أنا آفا من TechNova Solutions. أتصل بك بخصوص ${requirementTopic}.`;
    case 'English':
    default:
      return `Hello ${firstName}, I'm Ava from TechNova Solutions. I'm calling about ${requirementTopic}.`;
  }
}

export function getQuickReplies(language: string): { reply1: string; reply2: string } {
  switch (language) {
    case 'Español':
      return {
        reply1: 'Sí, necesitamos un socio certificado para esta implementación...',
        reply2: 'Próximo trimestre, unos 150 usuarios. ¿Podemos agendar una llamada demostrativa?',
      };
    case 'हिन्दी':
      return {
        reply1: 'हाँ, हमें इस कार्य के लिए एक अनुभवी तकनीकी पार्टनर की आवश्यकता है...',
        reply2: 'अगली तिमाही में लगभग 150 उपयोगकर्ता। क्या हम आपकी टीम के साथ कॉल तय कर सकते हैं?',
      };
    case 'Français':
      return {
        reply1: 'Oui, nous recherchons activement un partenaire pour ce projet...',
        reply2: 'Au prochain trimestre, environ 150 utilisateurs. Pouvons-nous planifier une démo ?',
      };
    case 'Deutsch':
      return {
        reply1: 'Ja, wir suchen derzeit einen erfahrenen Partner für dieses Projekt...',
        reply2: 'Nächstes Quartal, etwa 150 Benutzer. Können wir einen Termin mit Ihrem Team vereinbaren?',
      };
    case 'العربية':
      return {
        reply1: 'نعم، نحن بحاجة إلى شريك موثوق لتنفيذ هذا المشروع...',
        reply2: 'في الربع القادم، لحوالي 150 مستخدماً. هل يمكننا جدولة مكالمة مع فريقكم؟',
      };
    case 'English':
    default:
      return {
        reply1: 'Yes, we need a partner for this implementation...',
        reply2: 'Next quarter, around 150 users. Can we set up a call with your team?',
      };
  }
}
