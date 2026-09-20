const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const staticMembers = [
  {
    name: 'Archit',
    email: 'archit@chaos2commit.ai',
    password: '1234',
    companyName: 'Chaos2Commit Enterprise',
    companySize: '51 - 200 employees',
    industry: 'AI & Sales Automation',
    role: 'ADMIN',
  },
  {
    name: 'Yash',
    email: 'yash@chaos2commit.ai',
    password: '1234',
    companyName: 'Chaos2Commit Enterprise',
    companySize: '51 - 200 employees',
    industry: 'AI & Sales Automation',
    role: 'ADMIN',
  },
  {
    name: 'Jayraj',
    email: 'jayraj@chaos2commit.ai',
    password: '1234',
    companyName: 'Chaos2Commit Enterprise',
    companySize: '51 - 200 employees',
    industry: 'AI & Sales Automation',
    role: 'MEMBER',
  },
  {
    name: 'kavya',
    email: 'kavya@chaos2commit.ai',
    password: '1234',
    companyName: 'Chaos2Commit Enterprise',
    companySize: '51 - 200 employees',
    industry: 'AI & Sales Automation',
    role: 'MEMBER',
  },
];

async function main() {
  console.log('Seeding static members into Neon PostgreSQL...');
  for (const member of staticMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        password: member.password,
        companyName: member.companyName,
        companySize: member.companySize,
        industry: member.industry,
        role: member.role,
      },
      create: member,
    });
    console.log(`✓ Seeded user: ${user.name} (${user.email}) with password ${user.password}`);
  }
  console.log('Static members seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding members:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
