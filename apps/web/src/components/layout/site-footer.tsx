import Link from 'next/link';

import { gitWorkflow, navigationItems, siteConfig } from '@devagentshub/config';
import { Section } from '@devagentshub/ui';

export const SiteFooter = () => (
  <footer className="border-t border-[var(--color-border)] bg-[rgba(255,250,242,0.72)]">
    <Section className="grid gap-10 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
      <div className="space-y-3">
        <p className="headline text-2xl font-bold">{siteConfig.name}</p>
        <p className="max-w-md text-sm leading-7 text-[var(--color-subtle)]">
          {siteConfig.description}
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          Navigate
        </p>
        <div className="space-y-2 text-sm">
          {navigationItems.map((item) => (
            <Link key={item.href} className="block hover:text-[var(--color-accent)]" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          Git Workflow
        </p>
        <div className="space-y-2 text-sm text-[var(--color-subtle)]">
          {gitWorkflow.map((branch) => (
            <p key={branch}>{branch}</p>
          ))}
        </div>
      </div>
    </Section>
  </footer>
);

