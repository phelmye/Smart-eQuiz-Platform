import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  views: number;
  helpful: number;
}

interface HelpCenterProps {
  onBack?: () => void;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Smart eQuiz',
    category: 'Getting Started',
    description: 'Learn the basics of creating and managing quizzes',
    content: 'Complete guide to getting started...',
    views: 1234,
    helpful: 98
  },
  {
    id: '2',
    title: 'Creating Your First Tournament',
    category: 'Tournaments',
    description: 'Step-by-step guide to setting up tournaments',
    content: 'Tournament creation guide...',
    views: 856,
    helpful: 92
  },
  {
    id: '3',
    title: 'Managing Question Banks',
    category: 'Questions',
    description: 'How to organize and categorize your questions',
    content: 'Question bank management guide...',
    views: 723,
    helpful: 95
  },
  {
    id: '4',
    title: 'Understanding Analytics',
    category: 'Analytics',
    description: 'Make sense of your performance data',
    content: 'Analytics guide...',
    views: 645,
    helpful: 89
  },
  {
    id: '5',
    title: 'Subscription Plans Explained',
    category: 'Billing',
    description: 'Compare features across different plans',
    content: 'Plan comparison guide...',
    views: 892,
    helpful: 94
  },
  {
    id: '6',
    title: 'User Roles and Permissions',
    category: 'User Management',
    description: 'Configure access control for your team',
    content: 'Roles and permissions guide...',
    views: 567,
    helpful: 91
  }
];

const VIDEO_TUTORIALS = [
  { id: '1', title: 'Platform Overview', duration: '5:32', views: 2345 },
  { id: '2', title: 'Creating Questions', duration: '8:15', views: 1876 },
  { id: '3', title: 'Running Tournaments', duration: '12:40', views: 1543 },
  { id: '4', title: 'Analytics Deep Dive', duration: '15:20', views: 987 }
];

export const HelpCenter: React.FC<HelpCenterProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const filteredArticles = HELP_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(HELP_ARTICLES.map(a => a.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">How can we help you?</h1>
        <p className="text-gray-600 mb-6">Search our knowledge base or browse categories</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 py-4 border rounded-lg text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('articles')}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Documentation</h3>
            <p className="text-sm text-gray-600">Detailed guides and references</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          // TODO: Implement video tutorials feature
          console.log('Navigate to video tutorials');
        }}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Learn with step-by-step videos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          // TODO: Implement live chat feature
          console.log('Open live chat');
        }}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600">Chat with our support team</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('faq')}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-1">FAQs</h3>
            <p className="text-sm text-gray-600">Common questions answered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Categories */}
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const articleCount = HELP_ARTICLES.filter(a => a.category === category).length;
              return (
                <Card key={category} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCategory(category)}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{category}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                    </p>
                    <Button variant="link" className="p-0" onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); }}>
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle>
                {searchQuery ? `Search Results (${filteredArticles.length})` : 'Popular Articles'}
              </CardTitle>
              <CardDescription>
                {searchQuery ? 'Articles matching your search' : 'Most viewed help articles'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <h4 className="font-semibold">{article.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span>{article.views} views</span>
                            <span>{article.helpful}% found helpful</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Watch and learn at your own pace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {VIDEO_TUTORIALS.map((video) => (
                  <div
                    key={video.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{video.title}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{video.duration}</span>
                        <span>{video.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get help from our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Typically responds within 24 hours
                    </p>
                    <a href="mailto:support@smartequiz.com" className="text-sm text-blue-600 hover:underline">
                      support@smartequiz.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Live Chat</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Available Mon-Fri, 9am-5pm EST
                    </p>
                    <Button size="sm">Start Chat</Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone Support</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Enterprise plans only
                    </p>
                    <a href="tel:+1234567890" className="text-sm text-blue-600 hover:underline">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit a Ticket</CardTitle>
                <CardDescription>We'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows={6}
                      placeholder="Describe your issue in detail..."
                    />
                  </div>
                  <Button className="w-full">Submit Ticket</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpCenter;
