import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devagentshub/ui';

import type { ContextualLink } from '../../lib/contextual-links';

interface ContextualLinkCardsProps {
  eyebrow: string;
  title: string;
  description: string;
  links: ContextualLink[];
  layout?: 'grid' | 'stack';
}

export const ContextualLinkCards = ({
  eyebrow,
  title,
  description,
  links,
  layout = 'grid',
}: ContextualLinkCardsProps) => {
  if (!links.length) {
    return null;
  }

  const titleClass =
    layout === 'stack'
      ? 'text-2xl font-semibold text-[var(--color-ink)]'
      : 'headline text-3xl font-bold text-[var(--color-ink)]';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Badge>{eyebrow}</Badge>
        <h2 className={titleClass}>{title}</h2>
        <p className="max-w-3xl text-base leading-7 text-[var(--color-subtle)]">{description}</p>
      </div>

      <div className={layout === 'stack' ? 'grid gap-3' : 'grid gap-4 md:grid-cols-3'}>
        {links.map((item) => (
          <Card
            className={layout === 'stack' ? 'bg-[var(--color-surface)]/80 shadow-none' : 'h-full'}
            key={`${item.href}-${item.title}`}
          >
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
                {item.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
