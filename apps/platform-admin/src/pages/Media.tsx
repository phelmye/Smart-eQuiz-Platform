import { useState } from 'react';
import { MediaLibrary } from '../components/MediaLibrary';

export default function Media() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage images for marketing content, testimonials, and other assets
          </p>
        </div>

        {selectedAsset && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Selected Asset</p>
                <p className="text-xs text-blue-700">{selectedAsset.originalName}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <MediaLibrary 
          onSelect={setSelectedAsset}
        />
      </div>
    </div>
  );
}
