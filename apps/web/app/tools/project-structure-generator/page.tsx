import { Suspense } from 'react';

import { Badge, Section } from '@devagentshub/ui';

import { ProjectStructureForm } from '@/src/components/features/tools/project-structure-form';
import { StatusPanel } from '@/src/components/layout/status-panel';

export default function ProjectStructureGeneratorPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Project Structure Generator</Badge>
        <h1 className="headline text-5xl font-bold">Generate a cleaner starting architecture</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Use typed inputs to shape a starting tree for frontend apps, APIs, monorepos, or documentation-heavy
          projects.
        </p>
      </div>
      <Suspense
        fallback={
          <StatusPanel description="Preparing the project structure generator." title="Loading tool" tone="loading" />
        }
      >
        <ProjectStructureForm />
      </Suspense>
    </Section>
  );
}
