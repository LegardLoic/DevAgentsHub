import type { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-[var(--color-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]',
      className,
    )}
    {...props}
  />
);

