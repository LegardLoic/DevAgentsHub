import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminArticleEditor } from '@/src/components/features/admin/admin-article-editor';

export const metadata: Metadata = {
  title: `New Article | Admin | ${siteConfig.name}`,
  description: 'Create a new article in the DevAgentsHub admin area.',
};

export default function NewAdminArticlePage() {
  return <AdminArticleEditor />;
}
