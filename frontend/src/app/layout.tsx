import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/core/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Arc. - Gestão de Projetos',
  description: 'Plataforma de produtividade pessoal',
  icons: {
    icon: '/icon/arclogo.svg',
    shortcut: '/icon/arclogo.svg',
    apple: '/icon/arclogo.svg',
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
