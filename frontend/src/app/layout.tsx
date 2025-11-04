import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/core/context/ThemeContext';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      {/* ✅ Adicionamos suppressHydrationWarning no body */}
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
