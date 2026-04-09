import { DiscussionThread } from '@/src/components/features/community/discussion-thread';

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <DiscussionThread slug={slug} />;
}
