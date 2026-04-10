import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { BookmarksList } from '@/src/components/features/dashboard/bookmarks-list';

export const metadata: Metadata = {
  title: `Bookmarks | Dashboard | ${siteConfig.name}`,
  description: 'Review bookmarked guides and courses from your DevAgentsHub dashboard.',
};

export default function DashboardBookmarksPage() {
  return <BookmarksList />;
}
