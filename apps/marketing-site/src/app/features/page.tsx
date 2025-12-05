import { Metadata } from 'next';
import FeaturesContent from './FeaturesContent';

export const metadata: Metadata = {
  title: 'Features - Smart eQuiz Platform',
  description: 'Discover the powerful features that make Smart eQuiz the best platform for Bible quiz competitions.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category?: string;
  order: number;
  isActive: boolean;
}

// Sample fallback data (from existing design)
const sampleFeatures: Feature[] = [
  { id: '1', title: 'Bracket Builder', description: 'Automatically generate tournament brackets based on participants. Supports single elimination, double elimination, and round-robin formats.', icon: 'Trophy', category: 'Tournament Management', order: 1, isActive: true },
  { id: '2', title: 'Live Scoring', description: 'Track scores in real-time during matches. Participants and spectators can follow along with live updates and leaderboards.', icon: 'Zap', category: 'Tournament Management', order: 2, isActive: true },
  { id: '3', title: 'Schedule Management', description: 'Plan tournament schedules with conflict detection. Automated notifications keep everyone informed of upcoming matches.', icon: 'Calendar', category: 'Tournament Management', order: 3, isActive: true },
  { id: '4', title: 'Multi-Format Support', description: 'Host individual, team, or parish-based tournaments. Customize rules and scoring systems to match your needs.', icon: 'Users', category: 'Tournament Management', order: 4, isActive: true },
  { id: '5', title: 'AI Question Generator', description: 'Generate high-quality Bible quiz questions automatically using AI. Choose categories, difficulty levels, and review before publishing.', icon: 'Sparkles', category: 'Question Bank & AI Generation', order: 5, isActive: true },
  { id: '6', title: 'Custom Categories', description: 'Organize questions by books, themes, or difficulty. Create custom categories that match your curriculum.', icon: 'FolderTree', category: 'Question Bank & AI Generation', order: 6, isActive: true },
  { id: '7', title: 'Practice Mode', description: 'Participants can practice with unlimited questions. Track progress and identify areas for improvement.', icon: 'GraduationCap', category: 'Practice & Training', order: 7, isActive: true },
  { id: '8', title: 'Gamification', description: 'Earn XP, level up, and unlock badges. Leaderboards motivate participants to practice more.', icon: 'Award', category: 'Practice & Training', order: 8, isActive: true },
];

async function getFeatures(): Promise<Feature[]> {
  try {
    const res = await fetch(`${API_URL}/marketing-cms/features`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error('Failed to fetch features');
    }

    const features = await res.json();
    return features.filter((feature: Feature) => feature.isActive);
  } catch (error) {
    console.error('Error fetching features:', error);
    return sampleFeatures;
  }
}

export default async function FeaturesPage() {
  const features = await getFeatures();

  return <FeaturesContent features={features} />;
}
