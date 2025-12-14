import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './intelligence.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoCulture OS - Intelligence Center',
  description: 'AI-powered analytics for your music career',
};

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen`}>
      {children}
    </div>
  );
}
