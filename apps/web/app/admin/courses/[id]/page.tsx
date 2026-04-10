import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminCourseEditor } from '@/src/components/features/admin/admin-course-editor';

export const metadata: Metadata = {
  title: `Edit Course | Admin | ${siteConfig.name}`,
  description: 'Update a course and its lessons inside the DevAgentsHub admin area.',
};

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminCourseEditor courseId={id} />;
}
