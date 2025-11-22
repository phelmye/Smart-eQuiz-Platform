import { useState } from 'react';
import { MediaLibrary } from './MediaLibrary';
import { Image as ImageIcon, X } from 'lucide-react';

type MediaAsset = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  category: string;
  altText?: string;
  uploadedBy: string;
  uploadedAt: string;
  tenantId?: string;
};

interface ImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  category?: string;
  label: string;
  description?: string;
}

export function ImagePicker({ value, onChange, category, label, description }: ImagePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (asset: MediaAsset) => {
    onChange(asset.url);
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange('');
  };

  if (showPicker) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }} onClick={() => setShowPicker(false)} />
        
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          maxWidth: '90vw',
          maxHeight: '85vh',
          width: '1200px',
          overflow: 'auto',
          zIndex: 9999,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Select Image</h2>
            <button
              onClick={() => setShowPicker(false)}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '0.375rem',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <MediaLibrary onSelect={handleSelect} category={category} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
        {label}
      </label>
      {description && (
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>{description}</p>
      )}
      
      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
        {value ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={value}
              alt="Selected"
              style={{
                width: '128px',
                height: '128px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                border: '2px solid #d1d5db',
              }}
            />
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '9999px',
                padding: '0.25rem',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Remove image"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        ) : (
          <div style={{
            width: '128px',
            height: '128px',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            border: '2px dashed #d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ImageIcon style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setShowPicker(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            {value ? 'Change Image' : 'Select Image'}
          </button>

          {value && (
            <button
              onClick={handleClear}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#dc2626',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {value && (
        <div style={{ marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', wordBreak: 'break-all' }}>
            Current URL: <span style={{ fontFamily: 'monospace' }}>{value}</span>
          </p>
        </div>
      )}
    </div>
  );
}
