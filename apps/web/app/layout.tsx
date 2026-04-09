import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';

import { siteConfig } from '@devagentshub/config';

import './globals.css';

import { SiteFooter } from '@/src/components/layout/site-footer';
import { SiteHeader } from '@/src/components/layout/site-header';
import { AppProviders } from '@/src/components/providers/app-providers';

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${headingFont.variable} ${bodyFont.variable}`} lang="en">
      <body>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

