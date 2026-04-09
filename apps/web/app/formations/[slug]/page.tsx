import { CourseWorkspace } from '@/src/components/features/courses/course-workspace';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CourseWorkspace slug={slug} />;
}
