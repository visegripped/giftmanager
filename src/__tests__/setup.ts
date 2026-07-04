import '@testing-library/jest-dom';
import '@/src/utilities/agGridSetup';
import { vi } from 'vitest';
import React from 'react';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/1',
  useParams: () => ({ userid: '1' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

process.env.NEXT_PUBLIC_FB_APP_ID =
  process.env.NEXT_PUBLIC_FB_APP_ID || 'test-fb-app-id';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'test-google-client-id';
