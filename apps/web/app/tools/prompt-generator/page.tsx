import { Suspense } from 'react';
import type { Metadata } from 'next';

import { Badge, Section } from '@devagentshub/ui';

import { PromptGeneratorForm } from '@/src/components/features/tools/prompt-generator-form';
import { ContextualLinkCards } from '@/src/components/layout/contextual-link-cards';
import { StatusPanel } from '@/src/components/layout/status-panel';
import { getToolContextualLinks } from '@/src/lib/contextual-links';
import { buildSeoMetadata } from '@/src/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Prompt Generator for Developers',
  description:
    'Generate structured prompts for coding agents with project type, stack, goals, constraints, and reusable delivery context.',
  path: '/tools/prompt-generator',
  keywords: ['prompt generator for developers', 'coding agent prompts', 'AI prompt builder'],
});

export default function PromptGeneratorPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Prompt Generator</Badge>
        <h1 className="headline text-5xl font-bold">Write better briefs for coding agents</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Capture project type, stack, goal, and constraints in a format that encourages durable implementation.
        </p>
      </div>
      <Suspense
        fallback={
          <StatusPanel description="Preparing the prompt generator form." title="Loading tool" tone="loading" />
        }
      >
        <PromptGeneratorForm />
      </Suspense>
      <ContextualLinkCards
        description="Use prompt generation as the execution step, then read or discuss the surrounding workflow."
        eyebrow="Related pathways"
        links={getToolContextualLinks('prompt-generator')}
        title="Learn why this prompt structure matters"
      />
    </Section>
  );
}
