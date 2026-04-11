import { Suspense } from 'react';
import type { Metadata } from 'next';

import { Badge, Section } from '@devagentshub/ui';

import { DebugHelperForm } from '@/src/components/features/tools/debug-helper-form';
import { ContextualLinkCards } from '@/src/components/layout/contextual-link-cards';
import { StatusPanel } from '@/src/components/layout/status-panel';
import { getToolContextualLinks } from '@/src/lib/contextual-links';
import { buildSeoMetadata } from '@/src/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Debug Helper for Developers',
  description:
    'Turn errors, stack context, and code snippets into practical debugging plans with likely causes, fixes, and regression checks.',
  path: '/tools/debug-helper',
  keywords: ['debug helper', 'AI debugging tool', 'developer debugging plan', 'code error analysis'],
});

export default function DebugHelperPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Debug Helper</Badge>
        <h1 className="headline text-5xl font-bold">Turn errors into a practical investigation plan</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Paste the failing context and get a concise structure for causes, fixes, and regression-proof checks.
        </p>
      </div>
      <Suspense
        fallback={
          <StatusPanel description="Preparing the debug helper form." title="Loading tool" tone="loading" />
        }
      >
        <DebugHelperForm />
      </Suspense>
      <ContextualLinkCards
        description="Use the debug helper as a practical step, then connect the diagnosis to workflow guidance or community feedback."
        eyebrow="Related pathways"
        links={getToolContextualLinks('debug-helper')}
        title="Turn debugging into a repeatable loop"
      />
    </Section>
  );
}
