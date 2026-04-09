'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import type { ArticlePreview } from '@devagentshub/types';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { apiFetch } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';

export const ArticlesFeed = () => {
  const articlesQuery = useQuery({
    queryKey: queryKeys.articles,
    queryFn: () => apiFetch<ArticlePreview[]>('/api/articles'),
  });

  if (articlesQuery.isLoading) {
    return <StatusPanel description="Fetching published guides." title="Loading guides" tone="loading" />;
  }

  if (articlesQuery.isError) {
    return (
      <StatusPanel
        description="The guides list could not be loaded from the API."
        title="Unable to load guides"
        tone="error"
      />
    );
  }

  if (!articlesQuery.data?.length) {
    return <StatusPanel description="No guides are available yet." title="Nothing published" />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {articlesQuery.data.map((article) => (
        <Card key={article.id}>
          <CardHeader>
            <Badge>{formatDate(article.createdAt)}</Badge>
            <CardTitle>{article.title}</CardTitle>
            <CardDescription>{article.excerpt}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-semibold text-[var(--color-accent)]" href={`/guides/${article.slug}`}>
              Read guide
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
