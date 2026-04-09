import type { Metadata } from 'next';

import { ArticleDetail } from '@/src/components/features/articles/article-detail';
import { buildGuideMetadata } from '@/src/lib/guides';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  return buildGuideMetadata(slug);
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ArticleDetail slug={slug} />;
}
