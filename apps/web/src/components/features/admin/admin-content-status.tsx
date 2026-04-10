'use client';

import Link from 'next/link';
import { ExternalLink, EyeOff } from 'lucide-react';

import { Badge, Button } from '@devagentshub/ui';

interface PublicationBadgeProps {
  isPublished: boolean;
}

export const PublicationBadge = ({ isPublished }: PublicationBadgeProps) => (
  <Badge
    className={
      isPublished
        ? 'bg-[rgba(15,118,110,0.12)] text-[var(--color-accent-strong)]'
        : 'bg-[rgba(234,88,12,0.12)] text-[var(--color-warm)]'
    }
  >
    {isPublished ? 'Published' : 'Draft'}
  </Badge>
);

interface PublicPreviewShortcutProps {
  href: string;
  isPublished: boolean;
  label: string;
  type: 'article' | 'course' | 'lesson';
}

export const PublicPreviewShortcut = ({
  href,
  isPublished,
  label,
  type,
}: PublicPreviewShortcutProps) => {
  if (isPublished) {
    return (
      <div className="space-y-2 rounded-2xl bg-[rgba(15,118,110,0.08)] p-4">
        <div className="flex items-center justify-between gap-3">
          <PublicationBadge isPublished />
          <Button asChild size="sm" variant="secondary">
            <Link href={href}>
              {label}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-sm leading-6 text-[var(--color-accent-strong)]">
          This {type} is published and available on the public site.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl bg-[rgba(234,88,12,0.08)] p-4">
      <div className="flex items-center gap-2">
        <PublicationBadge isPublished={false} />
        <EyeOff className="h-4 w-4 text-[var(--color-warm)]" />
      </div>
      <p className="text-sm leading-6 text-[var(--color-warm)]">
        Public preview is unavailable while this {type} is still a draft. Publish and save it first.
      </p>
    </div>
  );
};
