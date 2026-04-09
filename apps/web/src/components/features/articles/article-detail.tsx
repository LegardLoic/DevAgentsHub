'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import type { ArticleDetail as ArticleDetailType } from '@devagentshub/types';
import { Badge, Card, CardContent, CardHeader, CardTitle, Section } from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { apiFetch } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { MarkdownView } from '../../layout/markdown-view';
import { StatusPanel } from '../../layout/status-panel';

export const ArticleDetail = ({ slug }: { slug: string }) => {
  const articleQuery = useQuery({
    queryKey: queryKeys.article(slug),
    queryFn: () => apiFetch<ArticleDetailType>(`/api/articles/${slug}`),
  });

  if (articleQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching the article from the API." title="Loading guide" tone="loading" />
      </Section>
    );
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <Section>
        <StatusPanel
          description="The requested article could not be loaded."
          title="Guide unavailable"
          tone="error"
        />
      </Section>
    );
  }

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/guides">
        <ArrowLeft className="h-4 w-4" />
        Back to guides
      </Link>
      <Card>
        <CardHeader>
          <Badge>{formatDate(articleQuery.data.createdAt)}</Badge>
          <CardTitle className="headline text-4xl">{articleQuery.data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownView content={articleQuery.data.content} />
        </CardContent>
      </Card>
    </Section>
  );
};
