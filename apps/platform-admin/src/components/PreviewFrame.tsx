import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react';

interface PreviewFrameProps {
  content: any;
  previewUrl?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceDimensions: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: '100%', height: '800px' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

const deviceIcons: Record<DeviceType, React.ComponentType<any>> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  content,
  // previewUrl = 'http://localhost:3001', // Marketing site URL (unused)
}) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate preview HTML from content
  const generatePreviewHTML = (): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marketing Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8f9fa;
    }
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
      background-image: url('${content.hero?.backgroundImage || ''}');
      background-size: cover;
      background-position: center;
      background-blend-mode: overlay;
    }
    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.95;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background: white;
      color: #667eea;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }
    .btn-secondary:hover {
      background: white;
      color: #667eea;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 20px;
    }
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 3rem;
      color: #1a202c;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      text-align: center;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    .feature-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: block;
      object-fit: contain;
    }
    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #2d3748;
    }
    .feature-card p {
      color: #718096;
      line-height: 1.6;
    }
    .testimonials {
      background: #f7fafc;
      padding: 60px 20px;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    .testimonial-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .testimonial-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .testimonial-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }
    .testimonial-info h4 {
      font-size: 1.1rem;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }
    .testimonial-info p {
      font-size: 0.875rem;
      color: #718096;
    }
    .testimonial-rating {
      color: #f59e0b;
      margin-bottom: 1rem;
    }
    .testimonial-content {
      color: #4a5568;
      line-height: 1.6;
      font-style: italic;
    }
    .social-proof {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    .stat-card {
      padding: 1.5rem;
    }
    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      display: block;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    .contact {
      background: white;
      padding: 60px 20px;
    }
    .contact-info {
      text-align: center;
      margin-top: 2rem;
    }
    .contact-item {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #4a5568;
    }
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      .hero p {
        font-size: 1rem;
      }
      .section-title {
        font-size: 2rem;
      }
      .features-grid,
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <h1>${content.hero?.headline || 'Welcome to Smart eQuiz'}</h1>
    <p>${content.hero?.subheadline || 'Transform your Bible study experience'}</p>
    <div class="hero-buttons">
      <a href="#" class="btn btn-primary">${content.hero?.primaryCTA || 'Get Started Free'}</a>
      <a href="#" class="btn btn-secondary">${content.hero?.secondaryCTA || 'Watch Demo'}</a>
    </div>
  </section>

  <!-- Features Section -->
  ${content.features && content.features.length > 0 ? `
  <section class="container">
    <h2 class="section-title">Powerful Features</h2>
    <div class="features-grid">
      ${content.features.map((feature: any) => `
        <div class="feature-card">
          ${feature.icon ? `<img src="${feature.icon}" alt="${feature.title}" class="feature-icon" />` : ''}
          <h3>${feature.title || 'Feature'}</h3>
          <p>${feature.description || 'Feature description'}</p>
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Testimonials Section -->
  ${content.testimonials && content.testimonials.length > 0 ? `
  <section class="testimonials">
    <div class="container">
      <h2 class="section-title">What Our Users Say</h2>
      <div class="testimonials-grid">
        ${content.testimonials.map((testimonial: any) => `
          <div class="testimonial-card">
            <div class="testimonial-header">
              ${testimonial.avatar ? `<img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar" />` : ''}
              <div class="testimonial-info">
                <h4>${testimonial.name || 'Anonymous'}</h4>
                <p>${testimonial.role || ''} ${testimonial.organization ? `at ${testimonial.organization}` : ''}</p>
              </div>
            </div>
            <div class="testimonial-rating">
              ${'⭐'.repeat(testimonial.rating || 5)}
            </div>
            <p class="testimonial-content">"${testimonial.content || 'Great platform!'}"</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Social Proof Section -->
  ${content.socialProof ? `
  <section class="social-proof">
    <h2 class="section-title">Trusted by Communities Worldwide</h2>
    <div class="container">
      <div class="stats-grid">
        ${content.socialProof.activeUsers ? `
          <div class="stat-card">
            <span class="stat-number">${content.socialProof.activeUsers}</span>
            <span class="stat-label">Active Users</span>
          </div>
        ` : ''}
        ${content.socialProof.churchesServed ? `
          <div class="stat-card">
            <span class="stat-number">${content.socialProof.churchesServed}</span>
            <span class="stat-label">Churches Served</span>
          </div>
        ` : ''}
        ${content.socialProof.quizzesHosted ? `
          <div class="stat-card">
            <span class="stat-number">${content.socialProof.quizzesHosted}</span>
            <span class="stat-label">Quizzes Hosted</span>
          </div>
        ` : ''}
        ${content.socialProof.customerRating ? `
          <div class="stat-card">
            <span class="stat-number">${content.socialProof.customerRating}</span>
            <span class="stat-label">Customer Rating</span>
          </div>
        ` : ''}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Contact Section -->
  ${content.contactInfo ? `
  <section class="contact">
    <div class="container">
      <h2 class="section-title">Get In Touch</h2>
      <div class="contact-info">
        ${content.contactInfo.email ? `<div class="contact-item">📧 ${content.contactInfo.email}</div>` : ''}
        ${content.contactInfo.phone ? `<div class="contact-item">📞 ${content.contactInfo.phone}</div>` : ''}
        ${content.contactInfo.address ? `<div class="contact-item">📍 ${content.contactInfo.address}</div>` : ''}
        ${content.contactInfo.supportHours ? `<div class="contact-item">🕒 ${content.contactInfo.supportHours}</div>` : ''}
      </div>
    </div>
  </section>
  ` : ''}
</body>
</html>
    `;
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset loading state when device changes
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  }, [device]);

  return (
    <Card className="flex flex-col h-full">
      {/* Device Selector Toolbar */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(Object.keys(deviceDimensions) as DeviceType[]).map((deviceType) => {
            const Icon = deviceIcons[deviceType];
            return (
              <Button
                key={deviceType}
                variant={device === deviceType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice(deviceType)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-start justify-center">
        <div
          className="bg-white shadow-lg transition-all duration-300 mx-auto"
          style={{
            width: deviceDimensions[device].width,
            maxWidth: '100%',
            height: deviceDimensions[device].height,
            position: 'relative',
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            srcDoc={generatePreviewHTML()}
            title="Marketing Preview"
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </Card>
  );
};
