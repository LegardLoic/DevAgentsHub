import type { Metadata } from 'next';

import { CourseWorkspace } from '@/src/components/features/courses/course-workspace';
import { buildCourseMetadata } from '@/src/lib/formations';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  return buildCourseMetadata(slug);
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CourseWorkspace slug={slug} />;
}
