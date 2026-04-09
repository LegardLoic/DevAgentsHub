'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devagentshub/ui';

import { guideNextSteps } from '../../../lib/guides';

export const GuideNextSteps = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Badge>Next step</Badge>
      <h2 className="headline text-3xl font-bold text-[var(--color-ink)]">Keep the momentum going</h2>
      <p className="max-w-3xl text-base leading-7 text-[var(--color-subtle)]">
        Once a guide gives you the framing, move directly into execution, learning, or discussion.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {guideNextSteps.map((item) => (
        <Card key={item.href} className="h-full">
          <CardHeader>
            <Badge>{item.eyebrow}</Badge>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
              href={item.href}
            >
              Open section
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
