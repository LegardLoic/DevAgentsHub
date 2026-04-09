import { Badge, Section } from '@devagentshub/ui';

import { ArticlesFeed } from '@/src/components/features/articles/articles-feed';

export default function GuidesPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Guides</Badge>
        <h1 className="headline text-5xl font-bold">Content for production-minded AI-assisted development</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          The MVP ships with seeded guides so the content layer is functional from the first local run.
        </p>
      </div>
      <ArticlesFeed />
    </Section>
  );
}
