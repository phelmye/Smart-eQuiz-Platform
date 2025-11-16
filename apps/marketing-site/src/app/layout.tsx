import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart eQuiz Platform',
  description: 'Multi-tenant quiz platform for churches and organizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
