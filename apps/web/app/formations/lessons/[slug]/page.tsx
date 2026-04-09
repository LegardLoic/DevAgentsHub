import { LessonWorkspace } from '@/src/components/features/courses/lesson-workspace';

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <LessonWorkspace slug={slug} />;
}
