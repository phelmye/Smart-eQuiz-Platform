// User roles
export type UserRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'question_manager' 
  | 'account_officer' 
  | 'participant' 
  | 'inspector' 
  | 'practice_user';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  parishId?: string;
  xp: number;
  level: number;
  badges: string[];
  walletBalance: number;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  practiceAccessStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  practiceAccessAppliedAt?: string;
  practiceAccessApprovedAt?: string;
  practiceAccessApprovedBy?: string;
  qualificationStatus?: 'not_qualified' | 'in_training' | 'qualified' | 'approved_participant';
  qualificationApprovedAt?: string;
  qualificationApprovedBy?: string;
  hasExtendedProfile?: boolean;
  profileCompletionPercentage?: number;
}

// Storage helper
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Fail silently
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Fail silently
    }
  }
};

export const STORAGE_KEYS = {
  CURRENT_USER: 'equiz_current_user',
  MARKETING_CONFIG: 'equiz_marketing_config',
  AFFILIATE_CONFIG: 'equiz_affiliate_config',
};
