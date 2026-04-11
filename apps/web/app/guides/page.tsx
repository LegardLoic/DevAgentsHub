import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpenText } from 'lucide-react';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Section } from '@devagentshub/ui';

import { ArticlesFeed } from '@/src/components/features/articles/articles-feed';
import { guidesPageMetadata } from '@/src/lib/guides';

export const metadata: Metadata = guidesPageMetadata;

const contentPaths = [
  {
    title: 'Prompting and agent briefs',
    description: 'Start here when the problem is unclear scope, weak prompts, or missing delivery constraints.',
    href: '/guides/brief-coding-agents-clearly',
    action: 'Read prompting guide',
  },
  {
    title: 'Architecture and project structure',
    description: 'Use this path when generated work needs cleaner folders, ownership, and implementation boundaries.',
    href: '/guides/structure-ai-dev-projects-cleanly',
    action: 'Read structure guide',
  },
  {
    title: 'Workflow and review loops',
    description: 'Use this path to connect AI-assisted implementation with testing, review, and reusable habits.',
    href: '/guides/use-ai-agents-in-dev-workflow',
    action: 'Read workflow guide',
  },
];

export default function GuidesPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Guides</Badge>
        <h1 className="headline text-5xl font-bold">Content for production-minded AI-assisted development</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Use guides to frame the problem before running tools, saving outputs, or asking the community.
        </p>
      </div>
      <Card className="border-dashed bg-[var(--color-surface)]/80">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpenText className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Before execution</Badge>
          </div>
          <CardTitle>Read one guide, then apply it immediately</CardTitle>
          <CardDescription>
            Guides are short by design: use them to clarify the next move, then jump into tools or formations
            while the context is still fresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tools">
              Apply with tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/formations">Continue with formations</Link>
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {contentPaths.map((path) => (
          <Card className="h-full" key={path.href}>
            <CardHeader>
              <Badge>Content path</Badge>
              <CardTitle>{path.title}</CardTitle>
              <CardDescription>{path.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href={path.href}>
                {path.action}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <ArticlesFeed />
    </Section>
  );
}
