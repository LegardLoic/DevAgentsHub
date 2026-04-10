import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { DashboardOverview } from '@/src/components/features/dashboard/dashboard-overview';

export const metadata: Metadata = {
  title: `Dashboard | ${siteConfig.name}`,
  description: 'Review your saved tool history and jump back into DevAgentsHub workflows.',
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
