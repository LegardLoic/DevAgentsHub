import type { Metadata } from 'next';

import { LessonWorkspace } from '@/src/components/features/courses/lesson-workspace';
import { buildLessonMetadata } from '@/src/lib/formations';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  return buildLessonMetadata(slug);
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <LessonWorkspace slug={slug} />;
}
