/**
 * API Documentation Component
 * 
 * Interactive API documentation with:
 * - Authentication guide
 * - Endpoint reference
 * - Code examples in multiple languages
 * - Rate limit information
 * - Webhook signature verification guide
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Copy,
  CheckCircle,
  Code,
  Key,
  Zap,
  Shield,
  ExternalLink
} from 'lucide-react';

export default function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
        onClick={() => copyCode(code, id)}
      >
        {copiedCode === id ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6" />
            API Documentation
          </CardTitle>
          <CardDescription>
            Complete guide to integrating with the Smart eQuiz API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Version 1.0</Badge>
              <Badge variant="outline">REST API</Badge>
              <Badge variant="success">HTTPS Only</Badge>
            </div>
            <Button variant="link" className="ml-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started with the API in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Create an API Key</h3>
            <p className="text-sm text-gray-600 mb-3">
              Navigate to the API Keys tab and create a new API key with the required scopes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Make Your First Request</h3>
            <p className="text-sm text-gray-600 mb-3">
              Include your API key in the Authorization header:
            </p>
            <Tabs defaultValue="curl">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock
                  id="curl-example"
                  language="bash"
                  code={`curl -X GET "https://api.smartequiz.com/v1/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                />
              </TabsContent>
              <TabsContent value="javascript">
                <CodeBlock
                  id="js-example"
                  language="javascript"
                  code={`const response = await fetch('https://api.smartequiz.com/v1/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}
                />
              </TabsContent>
              <TabsContent value="python">
                <CodeBlock
                  id="python-example"
                  language="python"
                  code={`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.smartequiz.com/v1/users',
    headers=headers
)

data = response.json()
print(data)`}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Handle the Response</h3>
            <p className="text-sm text-gray-600 mb-3">
              All responses are JSON with standard HTTP status codes
            </p>
            <CodeBlock
              id="response-example"
              language="json"
              code={`{
  "data": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "participant",
      "createdAt": "2025-01-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "perPage": 20
  }
}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">API Key Authentication</h3>
            <p className="text-sm text-gray-600 mb-3">
              Include your API key in the Authorization header using Bearer token format:
            </p>
            <CodeBlock
              id="auth-header"
              language="text"
              code="Authorization: Bearer api_sec_live_YOUR_KEY_HERE"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Security Best Practices</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Never expose API keys in client-side code</li>
                  <li>Store keys securely in environment variables</li>
                  <li>Rotate keys regularly</li>
                  <li>Use different keys for development and production</li>
                  <li>Revoke compromised keys immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Rate limits are enforced per API key. Check response headers for current usage:
          </p>
          
          <CodeBlock
            id="rate-limit-headers"
            language="text"
            code={`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1706097600000`}
          />

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Starter</CardDescription>
                <CardTitle className="text-xl">60/min</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                10K requests/day
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pro</CardDescription>
                <CardTitle className="text-xl">600/min</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                100K requests/day
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Enterprise</CardDescription>
                <CardTitle className="text-xl">6000/min</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                1M requests/day
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Handling Rate Limits</h3>
            <CodeBlock
              id="rate-limit-handling"
              language="javascript"
              code={`async function makeRequest(url) {
  const response = await fetch(url, {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.log(\`Rate limited. Retry after \${retryAfter} seconds\`);
    
    await new Promise(resolve => 
      setTimeout(resolve, parseInt(retryAfter) * 1000)
    );
    
    return makeRequest(url); // Retry
  }
  
  return response.json();
}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Webhook Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Webhook Signature Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Verify webhook authenticity by validating the HMAC signature:
          </p>

          <Tabs defaultValue="node">
            <TabsList>
              <TabsTrigger value="node">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="node">
              <CodeBlock
                id="webhook-verify-node"
                language="javascript"
                code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express.js example
app.post('/webhooks', express.json(), (req, res) => {
  const signature = req.headers['x-smartequiz-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook event
  console.log('Event:', req.body.type);
  res.status(200).send('OK');
});`}
              />
            </TabsContent>
            <TabsContent value="python">
              <CodeBlock
                id="webhook-verify-python"
                language="python"
                code={`import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = 'sha256=' + hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# Flask example
@app.route('/webhooks', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-SmartEquiz-Signature')
    secret = os.environ.get('WEBHOOK_SECRET')
    
    if not verify_webhook_signature(request.json, signature, secret):
        return 'Invalid signature', 401
    
    # Process webhook event
    print('Event:', request.json['type'])
    return 'OK', 200`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* API Endpoints Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            API Endpoints
          </CardTitle>
          <CardDescription>Common endpoints and their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Users */}
            <div>
              <h3 className="font-semibold mb-2">Users</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">GET</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/users</code>
                  <span className="text-gray-600">List all users</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">GET</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/users/:id</code>
                  <span className="text-gray-600">Get user details</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">POST</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/users</code>
                  <span className="text-gray-600">Create new user</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">PUT</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/users/:id</code>
                  <span className="text-gray-600">Update user</span>
                </div>
              </div>
            </div>

            {/* Tournaments */}
            <div>
              <h3 className="font-semibold mb-2">Tournaments</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">GET</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/tournaments</code>
                  <span className="text-gray-600">List tournaments</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">GET</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/tournaments/:id</code>
                  <span className="text-gray-600">Get tournament details</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">POST</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/tournaments</code>
                  <span className="text-gray-600">Create tournament</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">POST</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/tournaments/:id/start</code>
                  <span className="text-gray-600">Start tournament</span>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div>
              <h3 className="font-semibold mb-2">Questions</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">GET</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/questions</code>
                  <span className="text-gray-600">List questions</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-mono">POST</Badge>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">/v1/questions</code>
                  <span className="text-gray-600">Create question</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="link" className="mt-4">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Complete API Reference
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
