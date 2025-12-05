import { useState, useEffect, useRef } from 'react';

export type MediaAsset = {
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
  uploadedByEmail: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

interface MediaLibraryProps {
  onSelect?: (asset: MediaAsset) => void;
  category?: string;
  multiSelect?: boolean;
}

export function MediaLibrary({ onSelect, category, multiSelect = false }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(category || 'all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'all',
    'avatar',
    'feature-icon',
    'hero-background',
    'blog-image',
    'testimonial-avatar',
    'case-study-image',
    'pricing-icon',
    'general',
  ];

  useEffect(() => {
    fetchAssets();
  }, [page, filterCategory, searchTerm]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filterCategory && filterCategory !== 'all') {
        params.append('category', filterCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/media?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      setAssets(data.assets);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', filterCategory === 'all' ? 'general' : filterCategory);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      await fetchAssets();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload some files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      await fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  const toggleSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      if (multiSelect) {
        newSelection.add(assetId);
      } else {
        newSelection.clear();
        newSelection.add(assetId);
      }
    }
    setSelectedAssets(newSelection);
  };

  const handleSelect = () => {
    if (onSelect && selectedAssets.size > 0) {
      const selected = assets.find(a => selectedAssets.has(a.id));
      if (selected) {
        onSelect(selected);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Media Library
        </h2>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
            }}
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('-', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
            }}
          >
            {uploading ? 'Uploading...' : '+ Upload'}
          </button>

          {onSelect && selectedAssets.size > 0 && (
            <button
              onClick={handleSelect}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Select ({selectedAssets.size})
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading media assets...
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => toggleSelection(asset.id)}
              style={{
                position: 'relative',
                border: selectedAssets.has(asset.id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white',
              }}
            >
              {/* Image */}
              <div
                style={{
                  aspectRatio: '1',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={asset.thumbnailUrl || asset.url}
                  alt={asset.altText || asset.originalName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: '0.75rem' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={asset.originalName}
                >
                  {asset.originalName}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{formatFileSize(asset.size)}</span>
                  {asset.width && asset.height && (
                    <span>
                      {asset.width}×{asset.height}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {asset.category}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(asset.id);
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '0')}
              >
                Delete
              </button>

              {/* Selection Indicator */}
              {selectedAssets.has(asset.id) && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    left: '0.5rem',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && assets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No media assets found</div>
          <div style={{ fontSize: '0.875rem' }}>
            {searchTerm || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first image to get started'}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 20 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: page === 1 ? '#f3f4f6' : 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 20)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: page >= Math.ceil(total / 20) ? '#f3f4f6' : 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
