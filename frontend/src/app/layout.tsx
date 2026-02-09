import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/core/context/ThemeContext';
import { QueryProvider } from '@/core/providers/query-provider';

export const metadata: Metadata = {
  title: 'arc. - Gestão de Projetos',
  description: 'Plataforma de produtividade pessoal',
  icons: {
    icon: '/icon/arclogo.svg',
    shortcut: '/icon/arclogo.svg',
    apple: '/icon/arclogo.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F5F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E0E' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Arc.',
  },
  formatDetection: {
    telephone: false,
  },
};

import { SignalRProvider } from '@/core/context/SignalRContext';
import { CommandMenu } from '@/components/command-menu';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <QueryProvider>
            <SignalRProvider>
              <CommandMenu />
              {children}
            </SignalRProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
