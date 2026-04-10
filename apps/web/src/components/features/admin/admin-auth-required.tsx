'use client';

import Link from 'next/link';

import { Button } from '@devagentshub/ui';

import { StatusPanel } from '../../layout/status-panel';

interface AdminAuthRequiredProps {
  description?: string;
  nextPath?: string;
}

export const AdminAuthRequired = ({
  description = 'Login with an administrator account to manage articles, courses, and lessons.',
  nextPath = '/admin',
}: AdminAuthRequiredProps) => (
  <div className="space-y-4">
    <StatusPanel description={description} title="Authentication required" />
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
