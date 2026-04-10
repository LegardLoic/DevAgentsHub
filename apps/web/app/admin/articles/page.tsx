import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminArticlesList } from '@/src/components/features/admin/admin-articles-list';

export const metadata: Metadata = {
  title: `Admin Articles | ${siteConfig.name}`,
  description: 'List and manage editorial content in the DevAgentsHub admin area.',
};

export default function AdminArticlesPage() {
  return <AdminArticlesList />;
}
