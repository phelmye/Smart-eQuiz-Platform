import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Vercel Speed Insights component (React entrypoint)
import { SpeedInsights } from '@vercel/speed-insights';

console.log('🔍 main.tsx executing');
console.log('🔍 About to render App');
createRoot(document.getElementById('root')!).render(
	<>
		{/* Render SpeedInsights (Next.js component works as a client-side React component) */}
		<SpeedInsights />
		<App />
	</>
);
console.log('🔍 App render called');
