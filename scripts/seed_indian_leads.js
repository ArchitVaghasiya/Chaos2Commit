const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INDIAN_LEADS = [
  {
    name: 'Yash Gohel',
    email: 'yash.gohel@gujaratenterprises.in',
    emailVerified: true,
    phone: '+919737362307',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/yash-gohel-tech',
    companyName: 'Gujarat Enterprise Cloud Solutions',
    companyWebsite: 'https://gujaratenterprises.in',
    jobTitle: 'Chief Technology Officer (CTO)',
    industry: 'Enterprise Software & Cloud Systems',
    companySize: '100 - 250 employees',
    sourcePlatform: 'LinkedIn Executive Search',
    originalPostUrl: 'https://linkedin.com/posts/yash-gohel-cloud-migration-2026',
    originalPostSnippet: 'Urgent Requirement: We are transitioning 200 users to Microsoft 365 and SharePoint online. Looking for an enterprise partner to automate document workflows and Power Platform integrations.',
    intentScore: 99,
    budgetSignal: 'High ($40k - $75k allocated)',
    urgencyLevel: 'Immediate (This Month)',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    location: 'Ahmedabad, Gujarat, India',
    country: 'India',
    timezone: 'Asia/Kolkata',
    preferredLanguage: 'Gujarati',
    workflowType: 'LEADS_AND_CALLING',
  },
  {
    name: 'Kavy Chauhan',
    email: 'kavy.chauhan@chauhaninfotech.com',
    emailVerified: true,
    phone: '+919726838581',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/kavy-chauhan-infra',
    companyName: 'Chauhan Infotech Labs',
    companyWebsite: 'https://chauhaninfotech.com',
    jobTitle: 'VP of Engineering & Infrastructure',
    industry: 'Cloud Infrastructure & AI SaaS',
    companySize: '50 - 150 employees',
    sourcePlatform: 'LinkedIn',
    originalPostUrl: 'https://linkedin.com/posts/kavy-chauhan-modernization',
    originalPostSnippet: 'Evaluating AI voice automation agents and SharePoint intranet architecture to modernize internal ops. Open to vendor demonstrations next week.',
    intentScore: 98,
    budgetSignal: 'High ($25k - $50k)',
    urgencyLevel: 'High',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    location: 'Surat / Gandhinagar, Gujarat, India',
    country: 'India',
    timezone: 'Asia/Kolkata',
    preferredLanguage: 'Gujarati',
    workflowType: 'LEADS_AND_CALLING',
  },
  {
    name: 'Jayrajsinh Bhatti',
    email: 'jayraj.bhatti@bhattiglobal.co.in',
    emailVerified: true,
    phone: '+919023227455',
    phoneVerified: true,
    linkedinProfile: 'https://linkedin.com/in/jayrajsinh-bhatti-ops',
    companyName: 'Bhatti Global Logistics & IT',
    companyWebsite: 'https://bhattiglobal.co.in',
    jobTitle: 'Managing Director & Operations Head',
    industry: 'Logistics & Supply Chain Tech',
    companySize: '200 - 500 employees',
    sourcePlatform: 'Enterprise Directory',
    originalPostUrl: 'https://bhattiglobal.co.in/procurement/rfp-2026',
    originalPostSnippet: 'Modernizing internal communication infrastructure across 4 regional hubs. Seeking Microsoft 365 migration experts and 24/7 autonomous voice outreach solutions.',
    intentScore: 97,
    budgetSignal: 'High ($50k - $100k)',
    urgencyLevel: 'High',
    decisionMaker: true,
    activeRequirement: true,
    status: 'READY_TO_ENGAGE',
    location: 'Vadodara, Gujarat, India',
    country: 'India',
    timezone: 'Asia/Kolkata',
    preferredLanguage: 'Gujarati',
    workflowType: 'LEADS_AND_CALLING',
  },
];

async function seed() {
  console.log('Seeding 3 Indian Leads for Live Calls...');

  for (const leadData of INDIAN_LEADS) {
    // Check if lead already exists by phone or name
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: leadData.phone },
          { name: leadData.name },
        ],
      },
    });

    if (existing) {
      const updated = await prisma.lead.update({
        where: { id: existing.id },
        data: leadData,
      });
      console.log(`Updated existing lead: ${updated.name} (${updated.phone}) - ID: ${updated.id}`);
    } else {
      const created = await prisma.lead.create({
        data: leadData,
      });
      console.log(`Created new lead: ${created.name} (${created.phone}) - ID: ${created.id}`);
    }
  }

  const allCount = await prisma.lead.count();
  console.log(`Total Leads in Database now: ${allCount}`);
}

seed()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
