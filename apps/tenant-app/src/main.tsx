import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import Sentry first for error tracking
import './lib/sentry';

// Import debug utilities (exposes functions to window object)
import './lib/debugUtils';

// Vercel Speed Insights component (React entrypoint)
// Use the package's React entrypoint
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('🔍 main.tsx executing');
console.log('🔍 About to render App');
createRoot(document.getElementById('root')!).render(
	<ErrorBoundary>
		{/* Render SpeedInsights (Next.js component works as a client-side React component) */}
		<SpeedInsights />
		<App />
	</ErrorBoundary>
);
console.log('🔍 App render called');
