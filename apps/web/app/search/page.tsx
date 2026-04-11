import { Suspense } from 'react';
import type { Metadata } from 'next';

import { Badge, Section } from '@devagentshub/ui';

import { SearchExperience } from '@/src/components/features/search/search-experience';
import { StatusPanel } from '@/src/components/layout/status-panel';

export const metadata: Metadata = {
  title: 'Search | DevAgentsHub',
  description: 'Search across DevAgentsHub tools, guides, formations, and community discussions.',
};

export default function SearchPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Search</Badge>
        <h1 className="headline text-5xl font-bold">Find the right next surface fast</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Lightweight cross-product search for tools, guides, formations, and practical community
          threads.
        </p>
      </div>
      <Suspense
        fallback={
          <StatusPanel
            description="Preparing cross-product search."
            title="Loading search"
            tone="loading"
          />
        }
      >
        <SearchExperience />
      </Suspense>
    </Section>
  );
}
