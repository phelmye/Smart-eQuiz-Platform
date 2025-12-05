import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getMarketingConfig } from '@/lib/marketingConfig';

export const metadata: Metadata = {
  title: 'Smart eQuiz Platform',
  description: 'Multi-tenant quiz platform for churches and organizations',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getMarketingConfig();

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header config={config} />
        <main className="flex-1">{children}</main>
        <Footer config={config} />
      </body>
    </html>
  );
}
