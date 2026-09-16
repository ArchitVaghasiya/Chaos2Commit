const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Organization Settings
  await prisma.organizationSetting.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      companyName: 'TechNova Solutions',
      website: 'https://technova.com',
      description: 'Enterprise Microsoft 365, SharePoint & Workflow Automation Specialist',
      productsCatalog: 'Microsoft 365 migration, SharePoint Online Intranet, Power Platform automation, Teams enterprise integration',
      targetKeywords: 'Microsoft 365, SharePoint, Workflow Automation, Intranet, Power Automate, Cloud Migration',
      voiceMinutesUsed: 12450,
      voiceMinutesLimit: 20000,
      aiPersonaName: 'Ava (Sales Executive)',
      aiLanguageDefault: 'en',
      isApprovedForAi: true
    }
  });

  // 2. Active Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Product Demo Outreach',
      status: 'RUNNING',
      targetIndustry: 'IT Services & Software',
      targetLocation: 'North America & Europe',
      progressPercent: 67,
      totalLeadsCount: 1874,
      callsMadeCount: 1256,
      conversationsCount: 632,
      interestedCount: 198,
      meetingsBooked: 45
    }
  });

  // 3. Discovered Leads (Matching reference image & video)
  const lead1 = await prisma.lead.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@technova.com',
      emailVerified: true,
      phone: '+1 (555) 123-4567',
      phoneVerified: true,
      linkedinProfile: 'https://linkedin.com/in/john-smith-cloud',
      companyName: 'TechNova Solutions',
      companyWebsite: 'www.technova.com',
      jobTitle: 'CTO',
      industry: 'IT Services',
      companySize: '51 – 200 employees',
      sourcePlatform: 'LinkedIn',
      originalPostUrl: 'https://www.linkedin.com/posts/john-smith-technova_sharepoint-m365-migration',
      originalPostSnippet: 'We are looking for a Microsoft 365 & SharePoint implementation partner to streamline our document management and workflow automation. Please DM if you can help! #Microsoft365 #SharePoint #Workflow #DigitalTransformation',
      intentScore: 94,
      budgetSignal: 'High',
      urgencyLevel: 'High',
      decisionMaker: true,
      activeRequirement: true,
      status: 'MEETING_BOOKED',
      campaignId: campaign.id
    }
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Priya Nair',
      email: 'priya.nair@cloudtech.io',
      emailVerified: true,
      phone: '+1 (555) 872-9012',
      phoneVerified: true,
      linkedinProfile: 'https://linkedin.com/in/priya-nair-crm',
      companyName: 'CloudTech Inc.',
      companyWebsite: 'www.cloudtech.io',
      jobTitle: 'VP of Engineering',
      industry: 'Software',
      companySize: '201 – 500 employees',
      sourcePlatform: 'X (Twitter)',
      originalPostUrl: 'https://x.com/priyanair_tech/status/17892182739182',
      originalPostSnippet: 'Evaluating modern CRM migration and workflow tools to consolidate our sales pipeline. Who is doing great work here?',
      intentScore: 87,
      budgetSignal: 'Approved',
      urgencyLevel: 'Medium',
      decisionMaker: true,
      activeRequirement: true,
      status: 'CONTACTED',
      campaignId: campaign.id
    }
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: 'Marc Weber',
      email: 'm.weber@datasystems.eu',
      emailVerified: true,
      phone: '+49 30 9182345',
      phoneVerified: true,
      linkedinProfile: 'https://linkedin.com/in/marc-weber-data',
      companyName: 'DataSystems GmbH',
      companyWebsite: 'www.datasystems.eu',
      jobTitle: 'Head of Data Infrastructure',
      industry: 'Consulting',
      companySize: '500+ employees',
      sourcePlatform: 'Company Websites',
      originalPostUrl: 'https://datasystems.eu/procurement/rfp-data-warehouse-2025',
      originalPostSnippet: 'Public RFP: Looking for certified data engineering partners for Snowflake and cloud data warehouse modernization.',
      intentScore: 78,
      budgetSignal: 'Enterprise',
      urgencyLevel: 'Medium',
      decisionMaker: false,
      activeRequirement: true,
      status: 'CALL_SCHEDULED',
      campaignId: campaign.id
    }
  });

  const lead4 = await prisma.lead.create({
    data: {
      name: 'Ana Lopez',
      email: 'ana.lopez@brightpath.com',
      emailVerified: true,
      phone: '+1 (555) 432-8765',
      phoneVerified: false,
      linkedinProfile: 'https://linkedin.com/in/ana-lopez-brightpath',
      companyName: 'Brightpath Health',
      companyWebsite: 'www.brightpath.com',
      jobTitle: 'Director of IT Systems',
      industry: 'Healthcare',
      companySize: '51 – 200 employees',
      sourcePlatform: 'Public Directories',
      originalPostUrl: 'https://directories.techprocure.org/notices/10293',
      originalPostSnippet: 'Seeking automation audit consultants for HIPAA-compliant clinical workflows.',
      intentScore: 64,
      budgetSignal: 'Medium',
      urgencyLevel: 'Low',
      decisionMaker: true,
      activeRequirement: true,
      status: 'DISCOVERED'
    }
  });

  // 4. Sample Call Log matching video slide 5
  await prisma.callLog.create({
    data: {
      leadId: lead1.id,
      campaignId: campaign.id,
      status: 'CONNECTED',
      outcome: 'MEETING_BOOKED',
      durationSeconds: 165,
      language: 'en',
      callSummary: 'Qualified: 150-user M365 & SharePoint rollout planned for next quarter. Budget approved, CTO is the primary decision maker.',
      nextBestAction: 'Send SharePoint case study, confirm Thursday 3 PM demo with solutions team.',
      transcriptJson: JSON.stringify([
        { speaker: 'agent', text: "Hello John, I'm calling about your Microsoft 365 requirement posted earlier this week.", timestamp: '00:03' },
        { speaker: 'prospect', text: "Yes – we need a partner for SharePoint and workflow automation.", timestamp: '00:10' },
        { speaker: 'agent', text: "Understood. What timeline and team size are you planning for?", timestamp: '00:18' },
        { speaker: 'prospect', text: "Next quarter, around 150 users. Can we set up a call?", timestamp: '00:26' },
        { speaker: 'agent', text: "Absolutely! I have booked Thursday at 3 PM with our solutions lead. A confirmation email and calendar invite has been sent.", timestamp: '00:35' },
        { speaker: 'prospect', text: "Great, thanks Ava. Looking forward to it.", timestamp: '00:42' }
      ]),
      meetingScheduledAt: new Date(Date.now() + 86400000 * 2)
    }
  });

  await prisma.callLog.create({
    data: {
      leadId: lead2.id,
      campaignId: campaign.id,
      status: 'VOICEMAIL',
      outcome: 'VOICEMAIL_LEFT',
      durationSeconds: 42,
      language: 'en',
      callSummary: 'Reached voicemail. Left custom 30-second introduction regarding CRM migration and modern automation workflows.',
      nextBestAction: 'Follow up via email with CRM benchmark sheet; automatic redial scheduled for tomorrow 10:00 AM.',
      transcriptJson: JSON.stringify([
        { speaker: 'agent', text: "Hi Priya, this is Ava from TechNova Solutions. Calling in reference to your inquiry on CRM pipeline migration. I will follow up with an email and reconnect with you tomorrow at 10 AM.", timestamp: '00:05' }
      ])
    }
  });

  console.log('Database seeded successfully with initial data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
