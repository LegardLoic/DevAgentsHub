import { Suspense } from 'react';
import type { Metadata } from 'next';

import { Badge, Section } from '@devagentshub/ui';

import { ProjectStructureForm } from '@/src/components/features/tools/project-structure-form';
import { ContextualLinkCards } from '@/src/components/layout/contextual-link-cards';
import { StatusPanel } from '@/src/components/layout/status-panel';
import { getToolContextualLinks } from '@/src/lib/contextual-links';
import { buildSeoMetadata } from '@/src/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Project Structure Generator for AI-Assisted Development',
  description:
    'Generate clean project trees for Next.js, Express, monorepos, and documentation-heavy projects with maintainable architecture boundaries.',
  path: '/tools/project-structure-generator',
  keywords: ['project structure generator', 'AI-assisted architecture', 'monorepo structure', 'Next.js project tree'],
});

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
      <ContextualLinkCards
        description="Connect generated architecture to the guides and learning paths that explain the tradeoffs."
        eyebrow="Related pathways"
        links={getToolContextualLinks('project-structure-generator')}
        title="Structure the project, then validate the workflow"
      />
    </Section>
  );
}
