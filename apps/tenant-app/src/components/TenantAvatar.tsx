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

export const TenantAvatar: React.FC<TenantAvatarProps> = ({ 
  tenant, 
  size = 'md',
  showName = false,
  className = ''
}) => {
  const config = sizeConfigs[size];
  const [imageError, setImageError] = useState(false);
  
  const getContainerClass = () => {
    if (!tenant.logoUrl || imageError) {
      return `${config.height} ${config.width}`;
    }
    
    const aspectRatio = (tenant as any).logoAspectRatio || 'auto';
    
    switch (aspectRatio) {
      case 'square':
        return `${config.height} ${config.width}`;
      case 'landscape':
        return `${config.height} w-auto ${config.maxWidth}`;
      case 'portrait':
        return `${config.width} h-auto max-h-[${config.height}]`;
      case 'auto':
      default:
        return `${config.height} w-auto ${config.maxWidth}`;
    }
  };
  
  const getImageClass = () => {
    const fitMode = (tenant as any).logoFitMode || 'contain';
    return fitMode === 'cover' ? 'object-cover' : 'object-contain';
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const generateGradient = (name: string, primaryColor?: string): string => {
    if (primaryColor) {
      return primaryColor;
    }
    
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
