/**
 * Sample Data Initialization for Advanced Enterprise Features
 * 
 * This script populates the system with example:
 * - Custom Question Categories
 * - Round Configuration Templates
 * - Sample Questions for validation testing
 */

import {
  createCustomCategory,
  createRoundTemplate,
  CustomQuestionCategory,
  RoundConfigTemplate,
  RoundQuestionConfig,
  Question,
  STORAGE_KEYS,
  storage
} from './mockData';

// Sample tenant ID (use your actual tenant ID)
const SAMPLE_TENANT_ID = 'tenant_1';
const SAMPLE_USER_ID = 'user_admin_1';

/**
 * Initialize Custom Categories
 */
export function initializeSampleCategories(tenantId: string = SAMPLE_TENANT_ID, userId: string = SAMPLE_USER_ID) {
  console.log('🎨 Initializing sample custom categories...');

  const categories = [
    {
      tenantId,
      name: 'Church History',
      description: 'Questions about the history of the Celestial Church of Christ and Christian church history',
      color: '#8B5CF6',
      icon: '📜',
      isActive: true,
      createdBy: userId
    },
    {
      tenantId,
      name: 'Modern Saints',
      description: 'Life and teachings of modern-day saints and spiritual leaders',
      color: '#F59E0B',
      icon: '🌟',
      isActive: true,
      createdBy: userId
    },
    {
      tenantId,
      name: 'Worship Practices',
      description: 'Questions about worship rituals, ceremonies, and spiritual practices',
      color: '#10B981',
      icon: '🙏',
      isActive: true,
      createdBy: userId
    },
    {
      tenantId,
      name: 'Biblical Geography',
      description: 'Locations, places, and geographical context from the Bible',
      color: '#3B82F6',
      icon: '🗺️',
      isActive: true,
      createdBy: userId
    },
    {
      tenantId,
      name: 'Church Leadership',
      description: 'Structure, roles, and responsibilities in church administration',
      color: '#EF4444',
      icon: '⛪',
      isActive: true,
      createdBy: userId
    }
  ];

  const created: CustomQuestionCategory[] = [];
  categories.forEach(cat => {
    const newCat = createCustomCategory(tenantId, cat);
    created.push(newCat);
    console.log(`  ✓ Created: ${newCat.name} (${newCat.icon})`);
  });

  return created;
}

/**
 * Initialize Round Configuration Templates
 */
export function initializeSampleTemplates(tenantId: string = SAMPLE_TENANT_ID, userId: string = SAMPLE_USER_ID) {
  console.log('📚 Initializing sample templates...');

  const templates = [
    // Beginner Template
    {
      tenantId,
      name: 'Quick Start - 3 Rounds',
      description: 'Perfect for beginners. Short rounds with basic Bible knowledge questions.',
      templateType: 'beginner' as const,
      isPublic: true,
      numberOfRounds: 3,
      roundConfigs: [
        {
          totalQuestions: 10,
          timeLimitMinutes: 10,
          categoryDistribution: [
            { category: 'general_bible' as const, questionCount: 10, difficulty: 'easy' as const }
          ],
          questionDeliveryMode: 'mixed' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 12,
          timeLimitMinutes: 12,
          categoryDistribution: [
            { category: 'general_bible' as const, questionCount: 7, difficulty: 'easy' as const },
            { category: 'ccc_hymns' as const, questionCount: 5, difficulty: 'easy' as const }
          ],
          questionDeliveryMode: 'mixed' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 15,
          timeLimitMinutes: 15,
          categoryDistribution: [
            { category: 'general_bible' as const, questionCount: 10, difficulty: 'medium' as const },
            { category: 'ccc_hymns' as const, questionCount: 5, difficulty: 'medium' as const }
          ],
          questionDeliveryMode: 'mixed' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        }
      ],
      createdBy: userId
    },

    // Intermediate Template
    {
      tenantId,
      name: 'Progressive Challenge - 4 Rounds',
      description: 'Difficulty increases with each round. Balanced category distribution.',
      templateType: 'intermediate' as const,
      isPublic: true,
      numberOfRounds: 4,
      roundConfigs: [
        {
          totalQuestions: 15,
          timeLimitMinutes: 15,
          categoryDistribution: [
            { category: 'general_bible' as const, questionCount: 8, difficulty: 'easy' as const },
            { category: 'specific_study' as const, questionCount: 7, difficulty: 'easy' as const }
          ],
          questionDeliveryMode: 'mixed' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 20,
          timeLimitMinutes: 20,
          categoryDistribution: [
            { category: 'general_bible' as const, questionCount: 7, difficulty: 'medium' as const },
            { category: 'doctrine' as const, questionCount: 7, difficulty: 'medium' as const },
            { category: 'ccc_hymns' as const, questionCount: 6, difficulty: 'medium' as const }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 25,
          timeLimitMinutes: 25,
          categoryDistribution: [
            { category: 'doctrine' as const, questionCount: 10, difficulty: 'medium' as const, weight: 1.5 },
            { category: 'tenets' as const, questionCount: 10, difficulty: 'medium' as const, weight: 1.5 },
            { category: 'specific_study' as const, questionCount: 5, difficulty: 'hard' as const }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 30,
          timeLimitMinutes: 30,
          categoryDistribution: [
            { category: 'doctrine' as const, questionCount: 15, difficulty: 'hard' as const, weight: 2.0 },
            { category: 'tenets' as const, questionCount: 15, difficulty: 'hard' as const, weight: 2.0 }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        }
      ],
      createdBy: userId
    },

    // Advanced Template
    {
      tenantId,
      name: 'Expert Challenge - 5 Rounds',
      description: 'High difficulty with weighted scoring. For serious Bible scholars.',
      templateType: 'advanced' as const,
      isPublic: true,
      numberOfRounds: 5,
      roundConfigs: [
        {
          totalQuestions: 20,
          timeLimitMinutes: 20,
          categoryDistribution: [
            { category: 'general_bible' as const, questionCount: 10, difficulty: 'medium' as const },
            { category: 'specific_study' as const, questionCount: 10, difficulty: 'medium' as const }
          ],
          questionDeliveryMode: 'mixed' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 25,
          timeLimitMinutes: 25,
          categoryDistribution: [
            { category: 'doctrine' as const, questionCount: 15, difficulty: 'medium' as const, weight: 1.5 },
            { category: 'tenets' as const, questionCount: 10, difficulty: 'medium' as const, weight: 1.5 }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 30,
          timeLimitMinutes: 30,
          categoryDistribution: [
            { category: 'doctrine' as const, questionCount: 20, difficulty: 'hard' as const, weight: 2.0 },
            { category: 'specific_study' as const, questionCount: 10, difficulty: 'hard' as const, weight: 1.5 }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 35,
          timeLimitMinutes: 35,
          categoryDistribution: [
            { category: 'doctrine' as const, questionCount: 20, difficulty: 'hard' as const, weight: 2.5 },
            { category: 'tenets' as const, questionCount: 15, difficulty: 'hard' as const, weight: 2.5 }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 40,
          timeLimitMinutes: 40,
          categoryDistribution: [
            { category: 'doctrine' as const, questionCount: 20, difficulty: 'hard' as const, weight: 3.0 },
            { category: 'tenets' as const, questionCount: 20, difficulty: 'hard' as const, weight: 3.0 }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        }
      ],
      createdBy: userId
    },

    // Hymns Focused Template
    {
      tenantId,
      name: 'Hymns & Worship Special',
      description: 'Focused on CCC hymns and worship practices. Staged delivery for learning.',
      templateType: 'custom' as const,
      isPublic: true,
      numberOfRounds: 3,
      roundConfigs: [
        {
          totalQuestions: 15,
          timeLimitMinutes: 15,
          categoryDistribution: [
            { category: 'ccc_hymns' as const, questionCount: 15, difficulty: 'easy' as const }
          ],
          questionDeliveryMode: 'mixed' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 20,
          timeLimitMinutes: 20,
          categoryDistribution: [
            { category: 'ccc_hymns' as const, questionCount: 15, difficulty: 'medium' as const, weight: 1.5 },
            { category: 'general_bible' as const, questionCount: 5, difficulty: 'medium' as const }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        },
        {
          totalQuestions: 25,
          timeLimitMinutes: 25,
          categoryDistribution: [
            { category: 'ccc_hymns' as const, questionCount: 20, difficulty: 'hard' as const, weight: 2.0 },
            { category: 'doctrine' as const, questionCount: 5, difficulty: 'hard' as const }
          ],
          questionDeliveryMode: 'staged_by_category' as const,
          excludePreviousRoundQuestions: true,
          allowQuestionReuse: false,
          randomizeQuestionOrder: true,
          randomizeOptionOrder: true
        }
      ],
      createdBy: userId
    }
  ];

  const created: RoundConfigTemplate[] = [];
  templates.forEach(tpl => {
    const newTemplate = createRoundTemplate(tenantId, tpl);
    created.push(newTemplate);
    console.log(`  ✓ Created: ${newTemplate.name} (${newTemplate.templateType})`);
  });

  return created;
}

/**
 * Add sample questions for validation testing
 */
export function initializeSampleQuestions(tenantId: string = SAMPLE_TENANT_ID, userId: string = SAMPLE_USER_ID) {
  console.log('📝 Adding sample questions for validation...');

  const createQuestion = (category: string, text: string, difficulty: 'easy' | 'medium' | 'hard'): Omit<Question, 'id'> => ({
    tenantId,
    category,
    text,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: 'Sample explanation',
    difficulty,
    source: 'manual' as const
  });

  const questions: Omit<Question, 'id'>[] = [
    // General Bible - Easy
    ...Array.from({ length: 30 }, (_, i) => 
      createQuestion('General Bible Knowledge', `Sample General Bible question ${i + 1}`, 'easy')
    ),

    // General Bible - Medium
    ...Array.from({ length: 30 }, (_, i) => 
      createQuestion('General Bible Knowledge', `Sample General Bible question ${i + 31}`, 'medium')
    ),

    // General Bible - Hard
    ...Array.from({ length: 30 }, (_, i) => 
      createQuestion('General Bible Knowledge', `Sample General Bible question ${i + 61}`, 'hard')
    ),

    // CCC Hymns - All difficulties
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('CCC Hymns & Worship', `Sample CCC Hymns question ${i + 1}`, 'easy')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('CCC Hymns & Worship', `Sample CCC Hymns question ${i + 21}`, 'medium')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('CCC Hymns & Worship', `Sample CCC Hymns question ${i + 41}`, 'hard')
    ),

    // Doctrine - All difficulties
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Doctrine', `Sample Doctrine question ${i + 1}`, 'easy')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Doctrine', `Sample Doctrine question ${i + 21}`, 'medium')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Doctrine', `Sample Doctrine question ${i + 41}`, 'hard')
    ),

    // Tenets - All difficulties
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Tenets', `Sample Tenets question ${i + 1}`, 'easy')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Tenets', `Sample Tenets question ${i + 21}`, 'medium')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Tenets', `Sample Tenets question ${i + 41}`, 'hard')
    ),

    // Specific Study - All difficulties
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Specific Bible Study', `Sample Specific Study question ${i + 1}`, 'easy')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Specific Bible Study', `Sample Specific Study question ${i + 21}`, 'medium')
    ),
    ...Array.from({ length: 20 }, (_, i) => 
      createQuestion('Specific Bible Study', `Sample Specific Study question ${i + 41}`, 'hard')
    )
  ];

  // Add questions to storage
  const existingQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
  const questionsWithIds: Question[] = questions.map((q, i) => ({
    ...q,
    id: `sample_q_${Date.now()}_${i}`
  }));

  storage.set(STORAGE_KEYS.QUESTIONS, [...existingQuestions, ...questionsWithIds]);
  console.log(`  ✓ Added ${questionsWithIds.length} sample questions`);

  return questionsWithIds;
}

/**
 * Initialize all sample data
 */
export function initializeAllSampleData(tenantId: string = SAMPLE_TENANT_ID, userId: string = SAMPLE_USER_ID) {
  console.log('\n🚀 Initializing all sample data...\n');

  const categories = initializeSampleCategories(tenantId, userId);
  const templates = initializeSampleTemplates(tenantId, userId);
  const questions = initializeSampleQuestions(tenantId, userId);

  console.log('\n✅ Sample data initialization complete!');
  console.log(`   📦 ${categories.length} custom categories`);
  console.log(`   📚 ${templates.length} round templates`);
  console.log(`   📝 ${questions.length} sample questions\n`);

  return {
    categories,
    templates,
    questions
  };
}

/**
 * Clear all sample data (use with caution!)
 */
export function clearSampleData() {
  console.log('🗑️  Clearing sample data...');
  
  storage.set(STORAGE_KEYS.CUSTOM_CATEGORIES, []);
  storage.set(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES, []);
  
  console.log('✅ Sample data cleared');
}
