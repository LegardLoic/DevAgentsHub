import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

import { TemplateDetail } from '@/src/components/features/dashboard/template-detail';

export const metadata: Metadata = {
  title: `Template Detail | Dashboard | ${siteConfig.name}`,
  description: 'Inspect a saved template, rename it, and relaunch the matching DevAgentsHub tool.',
};

interface DashboardTemplateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardTemplateDetailPage({
  params,
}: DashboardTemplateDetailPageProps) {
  const { id } = await params;

  return <TemplateDetail id={id} />;
}
