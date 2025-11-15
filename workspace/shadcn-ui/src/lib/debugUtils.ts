/**
 * Debug Utilities for Advanced Enterprise Features
 * 
 * Access these functions from the browser console:
 * - window.initSampleData()
 * - window.clearSampleData()
 * - window.listTemplates()
 * - window.listCategories()
 */

import {
  initializeAllSampleData,
  clearSampleData,
  initializeSampleCategories,
  initializeSampleTemplates,
  initializeSampleQuestions
} from './sampleData';

import {
  getCustomCategories,
  getRoundTemplates,
  validateQuestionPool,
  STORAGE_KEYS,
  storage
} from './mockData';

// Expose functions to window for console access
declare global {
  interface Window {
    initSampleData: () => void;
    clearSampleData: () => void;
    initCategories: () => void;
    initTemplates: () => void;
    initQuestions: () => void;
    listTemplates: () => void;
    listCategories: () => void;
    validatePool: (tenantId: string, rounds: any[]) => void;
    makeAdmin: () => void;
    showCurrentUser: () => void;
    showDebugInfo: () => void;
  }
}

// Initialize sample data
window.initSampleData = () => {
  try {
    const result = initializeAllSampleData();
    console.log('✅ Sample data initialized successfully!');
    console.table({
      'Custom Categories': result.categories.length,
      'Templates': result.templates.length,
      'Questions': result.questions.length
    });
    return result;
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

// Clear sample data
window.clearSampleData = () => {
  try {
    clearSampleData();
    console.log('✅ Sample data cleared');
  } catch (error) {
    console.error('❌ Error clearing sample data:', error);
  }
};

// Initialize only categories
window.initCategories = () => {
  try {
    const categories = initializeSampleCategories();
    console.log(`✅ ${categories.length} custom categories created`);
    console.table(categories.map(c => ({
      Name: c.name,
      Icon: c.icon,
      Color: c.color,
      Active: c.isActive
    })));
    return categories;
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
  }
};

// Initialize only templates
window.initTemplates = () => {
  try {
    const templates = initializeSampleTemplates();
    console.log(`✅ ${templates.length} templates created`);
    console.table(templates.map(t => ({
      Name: t.name,
      Type: t.templateType,
      Rounds: t.numberOfRounds,
      Public: t.isPublic
    })));
    return templates;
  } catch (error) {
    console.error('❌ Error initializing templates:', error);
  }
};

// Initialize only questions
window.initQuestions = () => {
  try {
    const questions = initializeSampleQuestions();
    console.log(`✅ ${questions.length} questions created`);
    
    // Count by category and difficulty
    const breakdown: Record<string, Record<string, number>> = {};
    questions.forEach(q => {
      if (!breakdown[q.category]) {
        breakdown[q.category] = { easy: 0, medium: 0, hard: 0 };
      }
      breakdown[q.category][q.difficulty]++;
    });
    
    console.table(breakdown);
    return questions;
  } catch (error) {
    console.error('❌ Error initializing questions:', error);
  }
};

// List all templates
window.listTemplates = () => {
  try {
    const templates = getRoundTemplates('tenant_1', true);
    console.log(`📚 Found ${templates.length} templates:`);
    console.table(templates.map(t => ({
      Name: t.name,
      Type: t.templateType,
      Rounds: t.numberOfRounds,
      'Usage Count': t.usageCount,
      Rating: t.rating?.toFixed(1) || 'N/A',
      Public: t.isPublic ? '✓' : '✗'
    })));
    return templates;
  } catch (error) {
    console.error('❌ Error listing templates:', error);
  }
};

// List all custom categories
window.listCategories = () => {
  try {
    const categories = getCustomCategories('tenant_1', false);
    console.log(`🎨 Found ${categories.length} custom categories:`);
    console.table(categories.map(c => ({
      Name: c.name,
      Icon: c.icon,
      Color: c.color,
      Active: c.isActive ? '✓' : '✗',
      Created: new Date(c.createdAt).toLocaleDateString()
    })));
    return categories;
  } catch (error) {
    console.error('❌ Error listing categories:', error);
  }
};

// Validate question pool
window.validatePool = (tenantId: string, rounds: any[]) => {
  try {
    const validation = validateQuestionPool(tenantId, rounds);
    
    console.log('\n📊 Question Pool Validation Results:\n');
    console.log(`Total Questions Needed: ${validation.totalQuestionsNeeded}`);
    console.log(`Total Questions Available: ${validation.totalQuestionsAvailable}`);
    console.log(`Valid: ${validation.isValid ? '✅' : '❌'}\n`);
    
    if (validation.errors.length > 0) {
      console.error('❌ Errors:');
      validation.errors.forEach(err => console.error(`  • ${err}`));
    }
    
    if (validation.warnings.length > 0) {
      console.warn('\n⚠️  Warnings:');
      validation.warnings.forEach(warn => console.warn(`  • ${warn}`));
    }
    
    console.log('\n📈 Category Breakdown:');
    console.table(validation.categoryBreakdown.map(cb => ({
      Category: cb.category,
      Needed: cb.needed,
      Available: cb.available,
      Sufficient: cb.sufficient ? '✓' : '✗',
      'Easy (N/A)': `${cb.difficulty.easy.needed}/${cb.difficulty.easy.available}`,
      'Medium (N/A)': `${cb.difficulty.medium.needed}/${cb.difficulty.medium.available}`,
      'Hard (N/A)': `${cb.difficulty.hard.needed}/${cb.difficulty.hard.available}`
    })));
    
    return validation;
  } catch (error) {
    console.error('❌ Error validating pool:', error);
  }
};

// Show debug information
window.showDebugInfo = () => {
  console.log('\n🔧 Smart eQuiz Platform - Debug Information\n');
  console.log('Available Commands:');
  console.log('  window.initSampleData()     - Initialize all sample data');
  console.log('  window.clearSampleData()    - Clear all sample data');
  console.log('  window.initCategories()     - Create sample categories only');
  console.log('  window.initTemplates()      - Create sample templates only');
  console.log('  window.initQuestions()      - Create sample questions only');
  console.log('  window.listTemplates()      - List all templates');
  console.log('  window.listCategories()     - List all custom categories');
  console.log('  window.validatePool()       - Validate question pool');
  console.log('  window.makeAdmin()          - Grant current user admin access');
  console.log('  window.showCurrentUser()    - Show logged in user details');
  console.log('  window.showDebugInfo()      - Show this help\n');
  
  // Show current data counts
  const templates = storage.get(STORAGE_KEYS.ROUND_CONFIG_TEMPLATES) || [];
  const categories = storage.get(STORAGE_KEYS.CUSTOM_CATEGORIES) || [];
  const questions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
  
  console.log('Current Data:');
  console.table({
    'Templates': templates.length,
    'Custom Categories': categories.length,
    'Questions': questions.length
  });
  
  console.log('\nExample Usage:');
  console.log('  window.initSampleData()');
  console.log('  window.listTemplates()');
  console.log('  window.listCategories()');
  console.log('  window.makeAdmin()');
  console.log('\n');
};

// Make current user an admin
window.makeAdmin = () => {
  try {
    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!currentUser) {
      console.error('❌ No user is currently logged in');
      return;
    }
    
    console.log('Current user role:', currentUser.role);
    
    // Update user role to super_admin
    currentUser.role = 'super_admin';
    storage.set(STORAGE_KEYS.CURRENT_USER, currentUser);
    
    console.log('✅ User role updated to super_admin');
    console.log('🔄 Refreshing page to apply changes...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  }
};

// Show current user
window.showCurrentUser = () => {
  try {
    const currentUser = storage.get(STORAGE_KEYS.CURRENT_USER);
    if (!currentUser) {
      console.log('❌ No user is currently logged in');
      return;
    }
    
    console.log('\n👤 Current User:');
    console.table({
      'ID': currentUser.id,
      'Name': currentUser.name,
      'Email': currentUser.email,
      'Role': currentUser.role,
      'Tenant ID': currentUser.tenantId,
      'Level': currentUser.level,
      'XP': currentUser.xp
    });
    
    console.log('\n💡 Tip: Run window.makeAdmin() to grant admin access');
    return currentUser;
  } catch (error) {
    console.error('❌ Error fetching current user:', error);
  }
};

// Show welcome message on load
console.log('\n🎯 Smart eQuiz Platform - Advanced Features Debug Tools');
console.log('Type window.showDebugInfo() for available commands\n');

export {};
