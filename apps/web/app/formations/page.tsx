import { Badge, Section } from '@devagentshub/ui';

import { CoursesFeed } from '@/src/components/features/courses/courses-feed';

export default function FormationsPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Formations</Badge>
        <h1 className="headline text-5xl font-bold">A compact learning path with saved progress</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          The learning slice starts with one real course and three lessons, then layers progress tracking on top.
        </p>
      </div>
      <CoursesFeed />
    </Section>
  );
}
