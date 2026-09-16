import { analyzeLeadIntentWithGemini } from './gemini';

export interface DiscoveredLeadRaw {
  name: string;
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  email: string;
  phone: string;
  linkedinProfile: string;
  sourcePlatform: 'LinkedIn' | 'X (Twitter)' | 'Company Websites' | 'Directories' | 'Freelance Platforms' | 'CRM Integrations';
  originalPostUrl: string;
  originalPostSnippet: string;
}

export const SEED_LEADS_CATALOG: DiscoveredLeadRaw[] = [
  {
    name: 'John Smith',
    jobTitle: 'CTO',
    companyName: 'TechNova Solutions',
    companyWebsite: 'www.technova.com',
    industry: 'IT Services',
    companySize: '51 – 200 employees',
    email: 'john.smith@technova.com',
    phone: '+1 (555) 123-4567',
    linkedinProfile: 'https://linkedin.com/in/john-smith-cloud',
    sourcePlatform: 'LinkedIn',
    originalPostUrl: 'https://www.linkedin.com/posts/john-smith-technova_sharepoint-m365-migration',
    originalPostSnippet: 'We are looking for a Microsoft 365 & SharePoint implementation partner to streamline our document management and workflow automation. Please DM if you can help! #Microsoft365 #SharePoint #Workflow #DigitalTransformation'
  },
  {
    name: 'Priya Nair',
    jobTitle: 'VP of Engineering',
    companyName: 'CloudTech Inc.',
    companyWebsite: 'www.cloudtech.io',
    industry: 'Software',
    companySize: '201 – 500 employees',
    email: 'priya.nair@cloudtech.io',
    phone: '+1 (555) 872-9012',
    linkedinProfile: 'https://linkedin.com/in/priya-nair-crm',
    sourcePlatform: 'X (Twitter)',
    originalPostUrl: 'https://x.com/priyanair_tech/status/17892182739182',
    originalPostSnippet: 'Evaluating modern CRM migration and workflow tools to consolidate our sales pipeline. Who is doing great work here?'
  },
  {
    name: 'Marc Weber',
    jobTitle: 'Head of Data Infrastructure',
    companyName: 'DataSystems GmbH',
    companyWebsite: 'www.datasystems.eu',
    industry: 'Consulting',
    companySize: '500+ employees',
    email: 'm.weber@datasystems.eu',
    phone: '+49 30 9182345',
    linkedinProfile: 'https://linkedin.com/in/marc-weber-data',
    sourcePlatform: 'Company Websites',
    originalPostUrl: 'https://datasystems.eu/procurement/rfp-data-warehouse-2025',
    originalPostSnippet: 'Public RFP: Looking for certified data engineering partners for Snowflake and cloud data warehouse modernization.'
  },
  {
    name: 'Ana Lopez',
    jobTitle: 'Director of IT Systems',
    companyName: 'Brightpath Health',
    companyWebsite: 'www.brightpath.com',
    industry: 'Healthcare',
    companySize: '51 – 200 employees',
    email: 'ana.lopez@brightpath.com',
    phone: '+1 (555) 432-8765',
    linkedinProfile: 'https://linkedin.com/in/ana-lopez-brightpath',
    sourcePlatform: 'Directories',
    originalPostUrl: 'https://directories.techprocure.org/notices/10293',
    originalPostSnippet: 'Seeking automation audit consultants for HIPAA-compliant clinical workflows.'
  },
  {
    name: 'David Chen',
    jobTitle: 'Chief Information Officer',
    companyName: 'Apex Financial Technologies',
    companyWebsite: 'www.apexfintech.com',
    industry: 'Finance',
    companySize: '1,000+ employees',
    email: 'd.chen@apexfintech.com',
    phone: '+1 (555) 674-8890',
    linkedinProfile: 'https://linkedin.com/in/david-chen-cio',
    sourcePlatform: 'LinkedIn',
    originalPostUrl: 'https://www.linkedin.com/posts/david-chen-apex_cloud-security-fintech',
    originalPostSnippet: 'Actively scouting partners for enterprise-wide zero trust cloud security architecture implementation across our multi-region AWS footprint.'
  },
  {
    name: 'Elena Rostova',
    jobTitle: 'Head of Digital Transformation',
    companyName: 'Vanguard Logistics Global',
    companyWebsite: 'www.vanguardlogistics.com',
    industry: 'Logistics',
    companySize: '500+ employees',
    email: 'e.rostova@vanguardlogistics.com',
    phone: '+44 20 7946 0912',
    linkedinProfile: 'https://linkedin.com/in/elena-rostova-logistics',
    sourcePlatform: 'Freelance Platforms',
    originalPostUrl: 'https://www.upwork.com/jobs/~01e982183918bf',
    originalPostSnippet: 'Enterprise RFP: Need specialized systems integration team to automate supply chain telematics data into our centralized PowerBI and SharePoint portals.'
  },
  {
    name: 'Robert Thorne',
    jobTitle: 'VP Technology Operations',
    companyName: 'OmniRetail Group',
    companyWebsite: 'www.omniretail.com',
    industry: 'Retail',
    companySize: '1,000+ employees',
    email: 'r.thorne@omniretail.com',
    phone: '+1 (555) 901-2345',
    linkedinProfile: 'https://linkedin.com/in/robert-thorne-omni',
    sourcePlatform: 'CRM Integrations',
    originalPostUrl: 'https://crm.omniretail.com/partner-inquiries/req-8912',
    originalPostSnippet: 'Urgent: Looking to replace legacy middleware with an AI-driven automated pipeline to sync ERP and CRM records in real-time.'
  }
];

export async function discoverLeads(query: string, platform = 'All Sources') {
  // Filter by query and platform
  const lowerQuery = query.toLowerCase().trim();
  let results = SEED_LEADS_CATALOG.filter((lead) => {
    const matchesQuery =
      !lowerQuery ||
      lead.name.toLowerCase().includes(lowerQuery) ||
      lead.companyName.toLowerCase().includes(lowerQuery) ||
      lead.jobTitle.toLowerCase().includes(lowerQuery) ||
      lead.originalPostSnippet.toLowerCase().includes(lowerQuery) ||
      lead.industry.toLowerCase().includes(lowerQuery);

    const matchesPlatform =
      platform === 'All Sources' || lead.sourcePlatform.toLowerCase() === platform.toLowerCase();

    return matchesQuery && matchesPlatform;
  });

  if (results.length === 0) {
    results = SEED_LEADS_CATALOG;
  }

  // Attempt Gemini enrichment if API key exists
  const enrichedResults = await Promise.all(
    results.map(async (lead) => {
      const geminiAnalysis = await analyzeLeadIntentWithGemini(
        lead.originalPostSnippet,
        'Enterprise Microsoft 365, Cloud Migration, SharePoint, Workflow Automation'
      );

      return {
        ...lead,
        intentScore: geminiAnalysis?.intentScore ?? (lead.name === 'John Smith' ? 94 : lead.name === 'Priya Nair' ? 87 : lead.name === 'Marc Weber' ? 78 : 65),
        budgetSignal: geminiAnalysis?.budgetSignal ?? (lead.name === 'John Smith' ? 'High' : 'Approved'),
        urgencyLevel: geminiAnalysis?.urgencyLevel ?? 'High',
        decisionMaker: geminiAnalysis?.decisionMaker ?? true,
        activeRequirement: geminiAnalysis?.activeRequirement ?? true,
      };
    })
  );

  return enrichedResults;
}
