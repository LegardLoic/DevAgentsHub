import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminOverview } from '@/src/components/features/admin/admin-overview';

export const metadata: Metadata = {
  title: `Admin | ${siteConfig.name}`,
  description: 'Manage articles, courses, and lessons with the minimal DevAgentsHub admin slice.',
};

export default function AdminPage() {
  return <AdminOverview />;
}
