import { Suspense } from 'react';

import { Badge, Section } from '@devagentshub/ui';

import { DebugHelperForm } from '@/src/components/features/tools/debug-helper-form';
import { StatusPanel } from '@/src/components/layout/status-panel';

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
    </Section>
  );
}
