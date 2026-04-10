import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { SavedRunsList } from '@/src/components/features/dashboard/saved-runs-list';

export const metadata: Metadata = {
  title: `Saved Runs | Dashboard | ${siteConfig.name}`,
  description: 'Inspect saved tool runs, reopen previous results, and reuse your inputs.',
};

export default function SavedRunsPage() {
  return <SavedRunsList />;
}
