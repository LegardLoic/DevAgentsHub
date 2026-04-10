import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { AdminCoursesList } from '@/src/components/features/admin/admin-courses-list';

export const metadata: Metadata = {
  title: `Admin Courses | ${siteConfig.name}`,
  description: 'List and manage learning content in the DevAgentsHub admin area.',
};

export default function AdminCoursesPage() {
  return <AdminCoursesList />;
}
