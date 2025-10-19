import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/core/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Projectly - Gestão de Projetos',
  description: 'Plataforma de produtividade pessoal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}