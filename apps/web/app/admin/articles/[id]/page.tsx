import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminArticleEditor } from '@/src/components/features/admin/admin-article-editor';

export const metadata: Metadata = {
  title: `Edit Article | Admin | ${siteConfig.name}`,
  description: 'Update an article inside the DevAgentsHub admin area.',
};

export default async function AdminArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminArticleEditor articleId={id} />;
}
