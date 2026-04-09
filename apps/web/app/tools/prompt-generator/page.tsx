import { Badge, Section } from '@devagentshub/ui';

import { PromptGeneratorForm } from '@/src/components/features/tools/prompt-generator-form';

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
      <PromptGeneratorForm />
    </Section>
  );
}
