import React, { useState } from 'react';
import { Tenant } from '@/lib/mockData';

interface TenantAvatarProps {
  tenant: Tenant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const sizeConfigs = {
  xs: { 
    height: 'h-6', 
    width: 'w-6', 
    maxWidth: 'max-w-[48px]', 
    text: 'text-xs',
    rounded: 'rounded'
  },
  sm: { 
    height: 'h-8', 
    width: 'w-8', 
    maxWidth: 'max-w-[64px]', 
    text: 'text-sm',
    rounded: 'rounded-md'
  },
  md: { 
    height: 'h-10', 
    width: 'w-10', 
    maxWidth: 'max-w-[80px]', 
    text: 'text-base',
    rounded: 'rounded-lg'
  },
  lg: { 
    height: 'h-16', 
    width: 'w-16', 
    maxWidth: 'max-w-[128px]', 
    text: 'text-2xl',
    rounded: 'rounded-lg'
  },
  xl: { 
    height: 'h-24', 
    width: 'w-24', 
    maxWidth: 'max-w-[192px]', 
    text: 'text-4xl',
    rounded: 'rounded-xl'
  }
};

/**
 * TenantAvatar Component
 * 
 * Displays tenant logo with intelligent aspect ratio handling:
 * - Square logos: Fixed square container
 * - Landscape logos: Fixed height, auto width (great for wordmarks)
 * - Portrait logos: Fixed width, auto height (great for emblems)
 * - Fallback: Letter initials with tenant primary color
 * 
 * Features:
 * - Auto-detection of logo aspect ratio
 * - Manual override support (tenant.logoAspectRatio)
 * - Graceful fallback on image load errors
 * - Consistent sizing across application
 * - Responsive and accessible
 */
export const TenantAvatar: React.FC<TenantAvatarProps> = ({ 
  tenant, 
  size = 'md',
  showName = false,
  className = ''
}) => {
  const config = sizeConfigs[size];
  const [imageError, setImageError] = useState(false);
  
  /**
   * Determine container class based on logo aspect ratio
   * Supports: auto, square, landscape, portrait
   */
  const getContainerClass = () => {
    if (!tenant.logoUrl || imageError) {
      // Fallback: always square for letter initials
      return `${config.height} ${config.width}`;
    }
    
    const aspectRatio = tenant.logoAspectRatio || 'auto';
    
    switch (aspectRatio) {
      case 'square':
        // Perfect square container
        return `${config.height} ${config.width}`;
      
      case 'landscape':
        // Fixed height, auto width with max constraint
        // Great for wide wordmark logos
        return `${config.height} w-auto ${config.maxWidth}`;
      
      case 'portrait':
        // Fixed width, auto height with max constraint
        // Great for tall emblem logos
        return `${config.width} h-auto max-h-[${config.height}]`;
      
      case 'auto':
      default:
        // Let image aspect ratio determine, but constrain to height
        return `${config.height} w-auto ${config.maxWidth}`;
    }
  };
  
  /**
   * Determine how image should fit within container
   * - contain: Show full logo (recommended, may have whitespace)
   * - cover: Fill container (may crop logo)
   */
  const getImageClass = () => {
    const fitMode = tenant.logoFitMode || 'contain';
    return fitMode === 'cover' ? 'object-cover' : 'object-contain';
  };

  /**
   * Generate initials from tenant name
   * - Two words: First letter of each word
   * - One word: First two letters
   */
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Generate gradient background based on tenant name hash
   * Provides unique, consistent colors for each tenant
   */
  const generateGradient = (name: string, primaryColor?: string): string => {
    if (primaryColor) {
      // Use tenant's primary color if available
      return primaryColor;
    }
    
    // Generate gradient from name hash for visual variety
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {tenant.logoUrl && !imageError ? (
        <div className={`${getContainerClass()} flex items-center justify-center flex-shrink-0`}>
          <img 
            src={tenant.logoUrl} 
            alt={`${tenant.name} logo`}
            className={`${config.height} w-auto max-w-full ${getImageClass()} ${config.rounded}`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        // Fallback: Letter initials with gradient or primary color
        <div 
          className={`${config.height} ${config.width} ${config.rounded} flex items-center justify-center text-white font-bold ${config.text} flex-shrink-0`}
          style={{ backgroundColor: generateGradient(tenant.name, tenant.primaryColor) }}
          role="img"
          aria-label={`${tenant.name} logo`}
        >
          {getInitials(tenant.name)}
        </div>
      )}
      
      {showName && (
        <span className="font-semibold text-gray-900 truncate">{tenant.name}</span>
      )}
    </div>
  );
};

export default TenantAvatar;
