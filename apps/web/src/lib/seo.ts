import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

interface SeoMetadataInput {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

const withSiteName = (title: string) =>
  title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;

export const buildSeoMetadata = ({
  title,
  description,
  path,
  type = 'website',
  keywords,
}: SeoMetadataInput): Metadata => {
  const fullTitle = withSiteName(title);

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      type,
      url: path,
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
    },
  };
};
