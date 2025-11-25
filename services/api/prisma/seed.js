const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  console.log('Seeding initial plans, demo tenant, categories, questions, and tournament...');

  const [essential, growth, premium] = await Promise.all([
    prisma.plan.upsert({ where: { name: 'Essential' }, update: {}, create: { name: 'Essential', features: {} } }),
    prisma.plan.upsert({ where: { name: 'Growth' }, update: {}, create: { name: 'Growth', features: {} } }),
    prisma.plan.upsert({ where: { name: 'Premium' }, update: {}, create: { name: 'Premium', features: {} } }),
  ]);

  let tenant = await prisma.tenant.findFirst({ where: { name: 'Demo Church' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({ data: { name: 'Demo Church', planId: growth.id } });
  }

  const pw = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({ where: { email: 'admin@demo.local' }, update: {}, create: { email: 'admin@demo.local', passwordHash: pw, role: 'ORG_ADMIN' } });

  await prisma.userTenant.upsert({ where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } }, update: {}, create: { userId: user.id, tenantId: tenant.id, role: 'ORG_ADMIN' } });

  // Create categories
  const categoryNames = ['Old Testament', 'New Testament', 'Genesis', 'Exodus', 'Matthew', 'John', 'Revelation'];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    });
    categories.push(category);
  }

  // Create sample questions
  const questions = [
    { prompt: 'Who built the ark?', correctAnswer: 'Noah', wrongAnswers: ['Moses', 'Abraham', 'David'], difficulty: 'EASY', categoryName: 'Genesis' },
    { prompt: 'How many days did it rain during the flood?', correctAnswer: '40 days and 40 nights', wrongAnswers: ['7 days', '100 days', '30 days'], difficulty: 'MEDIUM', categoryName: 'Genesis' },
    { prompt: 'Who led the Israelites out of Egypt?', correctAnswer: 'Moses', wrongAnswers: ['Aaron', 'Joshua', 'Abraham'], difficulty: 'EASY', categoryName: 'Exodus' },
    { prompt: 'What is the first book of the New Testament?', correctAnswer: 'Matthew', wrongAnswers: ['Mark', 'Luke', 'John'], difficulty: 'EASY', categoryName: 'New Testament' },
    { prompt: 'In which book is the Sermon on the Mount recorded?', correctAnswer: 'Matthew', wrongAnswers: ['Mark', 'Luke', 'John'], difficulty: 'MEDIUM', categoryName: 'Matthew' },
    { prompt: 'Who wrote the Gospel of John?', correctAnswer: 'John the Apostle', wrongAnswers: ['John the Baptist', 'John Mark', 'John of Patmos'], difficulty: 'HARD', categoryName: 'John' },
    { prompt: 'How many seals are mentioned in the Book of Revelation?', correctAnswer: '7', wrongAnswers: ['4', '10', '12'], difficulty: 'HARD', categoryName: 'Revelation' },
  ];

  const createdQuestions = [];
  for (const q of questions) {
    const category = categories.find(c => c.name === q.categoryName);
    if (!category) continue;
    const question = await prisma.question.create({
      data: {
        tenantId: tenant.id,
        categoryId: category.id,
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        wrongAnswers: q.wrongAnswers,
        difficulty: q.difficulty,
        points: 10,
        timeLimit: 30,
        createdBy: user.id,
      },
    });
    createdQuestions.push(question);
  }

  // Create a sample tournament
  const tournament = await prisma.tournament.create({
    data: {
      tenantId: tenant.id,
      name: 'Demo Bible Quiz Tournament',
      description: 'A sample tournament to test the platform',
      entryFee: 0,
      prizePool: 100,
      maxParticipants: 20,
      status: 'SCHEDULED',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdBy: user.id,
    },
  });

  for (let i = 0; i < createdQuestions.length; i++) {
    await prisma.tournamentQuestion.create({
      data: { tournamentId: tournament.id, questionId: createdQuestions[i].id, orderIndex: i },
    });
  }

  // Create sample badges
  const badges = [
    { name: 'First Victory', description: 'Won your first tournament' },
    { name: 'Hot Streak', description: '5 correct answers in a row' },
    { name: 'Perfect Score', description: '100% accuracy in a tournament' },
    { name: 'Bible Scholar', description: 'Mastered all categories' },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { name: b.name }, update: {}, create: b });
  }

  console.log('Seed complete:');
  console.log('  Tenant:', tenant.name);
  console.log('  Admin:', user.email);
  console.log('  Categories:', categories.length);
  console.log('  Questions:', createdQuestions.length);
  console.log('  Tournament:', tournament.name);
  console.log('  Badges:', badges.length);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
