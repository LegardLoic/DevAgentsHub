import { Badge, Section } from '@devagentshub/ui';

import { CommunityBoard } from '@/src/components/features/community/community-board';

export default function CommunityPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Community</Badge>
        <h1 className="headline text-5xl font-bold">Practical developer discussions</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Ask implementation questions, compare tool outputs, and turn guides or lessons into
          concrete engineering decisions.
        </p>
      </div>
      <CommunityBoard />
    </Section>
  );
}
