import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

const STORAGE_KEY = 'platform_language';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'button' | 'compact';
  className?: string;
  onLanguageChange?: (languageCode: string) => void;
}

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  className = '',
  onLanguageChange 
}: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage && SUPPORTED_LANGUAGES.find(l => l.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.split('-')[0];
      const detectedLang = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
      if (detectedLang) {
        setCurrentLanguage(detectedLang.code);
      }
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem(STORAGE_KEY, languageCode);
    
    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }

    // TODO: Trigger i18n system to reload translations
    console.log(`Language changed to: ${languageCode}`);
    
    // For now, show a message (until full i18n is implemented)
    if (languageCode !== 'en') {
      alert(`Multi-language support coming soon!\n\nYour preference has been saved. The interface will display in ${SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name} once translation files are complete.`);
    }
  };

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  // Dropdown variant (default)
  if (variant === 'dropdown') {
    return (
      <div className={className}>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <SelectValue>
                {getCurrentLanguage().flag} {getCurrentLanguage().name}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  <span className="text-gray-500 text-sm">({lang.nativeName})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <div className={className}>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Globe className="h-4 w-4" />
              {getCurrentLanguage().flag} {getCurrentLanguage().name}
            </Button>
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Compact variant (flag only)
  return (
    <div className={className}>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[60px] px-2">
          <SelectValue>
            {getCurrentLanguage().flag}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Hook to get current language
 */
export function useCurrentLanguage(): string {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Listen for storage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setLanguage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return language;
}

/**
 * Utility to detect language from IP address (Enterprise feature)
 * This is a placeholder for future IP-based detection
 */
export async function detectLanguageFromIP(): Promise<string> {
  try {
    // TODO: Implement IP geolocation service
    // Example: ipapi.co, ip-api.com, or MaxMind GeoIP
    
    // For now, return browser language
    const browserLang = navigator.language.split('-')[0];
    const supported = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
    return supported?.code || 'en';
  } catch (error) {
    console.error('Failed to detect language from IP:', error);
    return 'en';
  }
}
