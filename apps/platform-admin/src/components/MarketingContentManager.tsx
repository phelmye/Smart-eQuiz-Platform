import { useState } from 'react';
import {
  Save,
  Eye,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

interface MarketingContent {
  hero: {
    headline: string;
    subheadline: string;
  };
  socialProof: {
    activeUsers: string;
    churchesServed: string;
  };
  contactInfo: {
    email: string;
    phone: string;
  };
}

const defaultContent: MarketingContent = {
  hero: {
    headline: 'The Ultimate Bible Quiz Platform',
    subheadline: 'Empower your church community with engaging Bible quizzes'
  },
  socialProof: {
    activeUsers: '2,500+',
    churchesServed: '500+'
  },
  contactInfo: {
    email: 'support@smartequiz.com',
    phone: '+1 (555) 123-4567'
  }
};

export default function MarketingContentManager() {
  const [content, setContent] = useState<MarketingContent>(defaultContent);
  const [activeTab, setActiveTab] = useState('hero');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log('Saving marketing content:', content);
    localStorage.setItem('marketingContent', JSON.stringify(content));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Marketing Content Manager</h1>
            <p className="text-gray-600 mt-2">
              Manage all content displayed on the marketing website
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Marketing content saved successfully!
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex gap-4 px-6">
              {['hero', 'social', 'contact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hero Section</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Headline</label>
                  <input
                    type="text"
                    value={content.hero.headline}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, headline: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subheadline</label>
                  <textarea
                    value={content.hero.subheadline}
                    onChange={(e) => setContent({
                      ...content,
                      hero: { ...content.hero, subheadline: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Proof Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Active Users</label>
                    <input
                      type="text"
                      value={content.socialProof.activeUsers}
                      onChange={(e) => setContent({
                        ...content,
                        socialProof: { ...content.socialProof, activeUsers: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Churches Served</label>
                    <input
                      type="text"
                      value={content.socialProof.churchesServed}
                      onChange={(e) => setContent({
                        ...content,
                        socialProof: { ...content.socialProof, churchesServed: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={content.contactInfo.email}
                    onChange={(e) => setContent({
                      ...content,
                      contactInfo: { ...content.contactInfo, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={content.contactInfo.phone}
                    onChange={(e) => setContent({
                      ...content,
                      contactInfo: { ...content.contactInfo, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Marketing Site Sync
          </h3>
          <p className="text-sm text-blue-800">
            Changes made here will be synchronized to the marketing website via API.
            Full implementation connects to a CMS backend that the marketing site reads from.
          </p>
        </div>
      </div>
    </div>
  );
}
