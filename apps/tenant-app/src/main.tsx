import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import Sentry first for error tracking
import './lib/sentry';

// Import debug utilities (exposes functions to window object)
import './lib/debugUtils';
import { logger } from './lib/logger';

// Vercel Speed Insights component (React entrypoint)
// Use the package's React entrypoint
// TODO: Install @vercel/speed-insights if deploying to Vercel
// import { SpeedInsights } from '@vercel/speed-insights/react';
import { ErrorBoundary } from './components/ErrorBoundary';

logger.debug('main.tsx executing');
logger.debug('About to render App');
createRoot(document.getElementById('root')!).render(
	<ErrorBoundary>
		{/* Render SpeedInsights (Next.js component works as a client-side React component) */}
		{/* <SpeedInsights /> */}
		<App />
	</ErrorBoundary>
);
logger.debug('App render called');
