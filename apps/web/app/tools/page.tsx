import Link from 'next/link';

import { toolCatalog } from '@devagentshub/config';
import {
  Badge,
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
