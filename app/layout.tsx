import type { Metadata } from 'next';
import { Providers } from './providers';
import { AppShell } from '@/src/components/AppShell/AppShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GiftManager',
  description: 'Family gift list manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
