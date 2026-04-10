'use client';

import Link from 'next/link';

import { Button } from '@devagentshub/ui';

import { StatusPanel } from '../../layout/status-panel';

interface AdminAccessDeniedProps {
  description?: string;
  title?: string;
}

export const AdminAccessDenied = ({
  description = 'Your account is authenticated, but it does not have administrator access to this area.',
  title = 'Admin access required',
}: AdminAccessDeniedProps) => (
  <div className="space-y-4">
    <StatusPanel description={description} title={title} tone="error" />
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="secondary">
        <Link href="/dashboard">Open dashboard</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  </div>
);
