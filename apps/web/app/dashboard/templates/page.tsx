import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { TemplatesList } from '@/src/components/features/dashboard/templates-list';

export const metadata: Metadata = {
  title: `Templates | Dashboard | ${siteConfig.name}`,
  description: 'Review reusable tool templates and relaunch DevAgentsHub tools with prefilled input.',
};

export default function DashboardTemplatesPage() {
  return <TemplatesList />;
}
