import type { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

export const Section = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <section className={cn('mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16', className)} {...props} />
);

