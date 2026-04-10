'use client';

import Link from 'next/link';

import { Button } from '@devagentshub/ui';

import { StatusPanel } from '../../layout/status-panel';

interface DashboardAuthRequiredProps {
  description?: string;
  nextPath?: string;
  title?: string;
}

export const DashboardAuthRequired = ({
  description = 'Login to access your dashboard and saved tool runs.',
  nextPath = '/dashboard',
  title = 'Authentication required',
}: DashboardAuthRequiredProps) => (
  <div className="space-y-4">
    <StatusPanel description={description} title={title} />
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Login</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Create account</Link>
      </Button>
    </div>
  </div>
);
