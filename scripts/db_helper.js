const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Update lead cmuggx21h0000cgv9t02061ya (Yash Gohel) email to yashgohel241@gmail.com
  const updated = await prisma.lead.updateMany({
    where: {
      OR: [
        { id: 'cmuggx21h0000cgv9t02061ya' },
        { email: 'yash.gohel@gohelinfotech.com' },
        { phone: { contains: '9737362307' } }
      ]
    },
    data: {
      email: 'yashgohel241@gmail.com'
    }
  });
  console.log('Updated leads:', updated);

  const yashLead = await prisma.lead.findFirst({
    where: { phone: { contains: '9737362307' } }
  });
  console.log('Current Yash lead record:', yashLead);

  // Check CalendarEvent table
  try {
    const events = await prisma.$queryRawUnsafe('SELECT * FROM "CalendarEvent"');
    console.log('Current CalendarEvents count:', events.length);
  } catch (e) {
    console.log('CalendarEvent table error or empty:', e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
