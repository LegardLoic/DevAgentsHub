import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { SavedRunDetail } from '@/src/components/features/dashboard/saved-run-detail';

export const metadata: Metadata = {
  title: `Saved Run | Dashboard | ${siteConfig.name}`,
  description: 'Review a saved DevAgentsHub tool run and reuse its original input.',
};

export default async function SavedRunDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = await params;

  return <SavedRunDetail id={resolvedParams.id} />;
}
