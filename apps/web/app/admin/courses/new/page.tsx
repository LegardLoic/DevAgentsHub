import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminCourseEditor } from '@/src/components/features/admin/admin-course-editor';

export const metadata: Metadata = {
  title: `New Course | Admin | ${siteConfig.name}`,
  description: 'Create a new course in the DevAgentsHub admin area.',
};

export default function NewAdminCoursePage() {
  return <AdminCourseEditor />;
}
