'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navigationItems, siteConfig } from '@devagentshub/config';
import { Button, cn } from '@devagentshub/ui';

import { useCurrentUser } from '../../hooks/use-auth';
import { LogoutButton } from '../features/auth/logout-button';

export const SiteHeader = () => {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(255,250,242,0.88)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link className="headline text-xl font-bold" href="/">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                className={cn(
                  'text-sm font-medium text-[var(--color-subtle)] transition hover:text-[var(--color-ink)]',
                  pathname === item.href && 'text-[var(--color-ink)]',
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <Button asChild className="hidden md:inline-flex" variant="ghost">
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : null}
              <Button asChild className="hidden md:inline-flex" variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {user.profile?.displayName ?? user.email}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                  {user.role}
                </p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild className="hidden md:inline-flex" variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
