import { ArticleDetail } from '@/src/components/features/articles/article-detail';

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ArticleDetail slug={slug} />;
}
