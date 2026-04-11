import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

import { toolCatalog } from '@devagentshub/config';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Section,
} from '@devagentshub/ui';

export default function ToolsPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Tools</Badge>
        <h1 className="headline text-5xl font-bold">Actionable tools backed by the API</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Each tool persists runs server-side, validates input with Zod, and uses the same shared types as
          the frontend.
        </p>
      </div>

      <Card className="border-dashed bg-[var(--color-surface)]/80">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Start here</Badge>
          </div>
          <CardTitle>Not sure what to do first?</CardTitle>
          <CardDescription>
            Run the prompt generator first. It gives you a concrete result, creates your first saved run,
            and gives you something reusable for templates later.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tools/prompt-generator">
              Run prompt generator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/guides">Read a guide first</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {toolCatalog.map((tool) => (
          <Card key={tool.slug}>
            <CardHeader>
              <Badge>{tool.category}</Badge>
              <CardTitle>{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="text-sm font-semibold text-[var(--color-accent)]" href={`/tools/${tool.slug}`}>
                Open tool
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
