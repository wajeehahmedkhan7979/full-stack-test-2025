import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '../providers/auth-provider';
import { QueryProvider } from '../providers/query-provider';
import { ThemeProvider } from '../providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatGPT Clone',
  description: 'A simplified ChatGPT-like application built with Next.js and NestJS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
