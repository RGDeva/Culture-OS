import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  title: 'NoCulture OS',
  description: 'Not a Label. A Launch System.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-black text-green-400 font-mono" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
