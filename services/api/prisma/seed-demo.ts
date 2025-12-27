import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoTemplate() {
  console.log('🌱 Seeding demo template...');

  // Check if demo template already exists
  const existing = await prisma.demoTemplate.findFirst({
    where: { version: 'v1.0' },
  });

  if (existing) {
    console.log('✅ Demo template v1.0 already exists');
    return;
  }

  // Create demo template with sample data
  const demoTemplate = await prisma.demoTemplate.create({
    data: {
      version: 'v1.0',
      name: 'Basic Quiz Demo',
      description: 'Introduction to quiz creation and tournament management',
      isActive: true, // Make it active immediately
      templateData: {
        questions: [
          {
            id: 'demo-q1',
            text: 'What is the capital of France?',
            answers: [
              { id: 'a1', text: 'Paris', isCorrect: true },
              { id: 'a2', text: 'London', isCorrect: false },
              { id: 'a3', text: 'Berlin', isCorrect: false },
              { id: 'a4', text: 'Madrid', isCorrect: false },
            ],
            category: 'Geography',
            difficulty: 'EASY',
            points: 10,
          },
          {
            id: 'demo-q2',
            text: 'Who wrote "Romeo and Juliet"?',
            answers: [
              { id: 'a1', text: 'William Shakespeare', isCorrect: true },
              { id: 'a2', text: 'Charles Dickens', isCorrect: false },
              { id: 'a3', text: 'Jane Austen', isCorrect: false },
              { id: 'a4', text: 'Mark Twain', isCorrect: false },
            ],
            category: 'Literature',
            difficulty: 'EASY',
            points: 10,
          },
          {
            id: 'demo-q3',
            text: 'What is the largest planet in our solar system?',
            answers: [
              { id: 'a1', text: 'Jupiter', isCorrect: true },
              { id: 'a2', text: 'Saturn', isCorrect: false },
              { id: 'a3', text: 'Neptune', isCorrect: false },
              { id: 'a4', text: 'Earth', isCorrect: false },
            ],
            category: 'Science',
            difficulty: 'EASY',
            points: 10,
          },
          {
            id: 'demo-q4',
            text: 'In what year did World War II end?',
            answers: [
              { id: 'a1', text: '1945', isCorrect: true },
              { id: 'a2', text: '1944', isCorrect: false },
              { id: 'a3', text: '1946', isCorrect: false },
              { id: 'a4', text: '1943', isCorrect: false },
            ],
            category: 'History',
            difficulty: 'MEDIUM',
            points: 15,
          },
          {
            id: 'demo-q5',
            text: 'What is the chemical symbol for gold?',
            answers: [
              { id: 'a1', text: 'Au', isCorrect: true },
              { id: 'a2', text: 'Ag', isCorrect: false },
              { id: 'a3', text: 'Fe', isCorrect: false },
              { id: 'a4', text: 'Cu', isCorrect: false },
            ],
            category: 'Science',
            difficulty: 'MEDIUM',
            points: 15,
          },
        ],
        tournaments: [
          {
            id: 'demo-t1',
            name: 'Sample Quiz Tournament',
            description: 'A sample tournament to demonstrate tournament features',
            status: 'DRAFT',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            maxParticipants: 50,
            registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            format: 'KNOCKOUT',
            rounds: 3,
          },
        ],
        participants: [
          {
            id: 'demo-user-1',
            email: 'demo.user1@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'PARTICIPANT',
          },
          {
            id: 'demo-user-2',
            email: 'demo.user2@example.com',
            firstName: 'Test',
            lastName: 'Player',
            role: 'PARTICIPANT',
          },
        ],
        categories: [
          { id: 'cat-1', name: 'Geography', description: 'Questions about world geography' },
          { id: 'cat-2', name: 'Literature', description: 'Questions about books and authors' },
          { id: 'cat-3', name: 'Science', description: 'Questions about scientific concepts' },
          { id: 'cat-4', name: 'History', description: 'Questions about historical events' },
        ],
      },
    },
  });

  console.log(`✅ Created demo template: ${demoTemplate.name} (${demoTemplate.version})`);
  console.log(`   Status: ${demoTemplate.isActive ? 'ACTIVE' : 'INACTIVE'}`);
}

async function main() {
  try {
    await seedDemoTemplate();
    console.log('✅ Demo template seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding demo template:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
