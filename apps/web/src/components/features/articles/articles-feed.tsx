'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, BookOpenText, Sparkles } from 'lucide-react';

import type { ArticlePreview } from '@devagentshub/types';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState } from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { ApiClientError, apiFetch, getApiClientErrorMessage } from '../../../lib/api';
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
    const isMissingContent = articlesQuery.error instanceof ApiClientError && articlesQuery.error.statusCode === 404;

    return (
      <StatusPanel
        description={
          isMissingContent
            ? 'The guides feed is not available yet.'
            : getApiClientErrorMessage(articlesQuery.error, 'The guides list could not be loaded from the API.')
        }
        title="Unable to load guides"
        tone="error"
      />
    );
  }

  const articles = articlesQuery.data;

  if (!articles?.length) {
    return (
      <EmptyState
        description="No guides are available yet. Publish seeded or upcoming editorial content to populate this section."
        icon={<BookOpenText className="h-6 w-6 text-[var(--color-accent)]" />}
        title="Nothing published"
      />
    );
  }

  const [featuredArticle, ...otherArticles] = articles;

  if (!featuredArticle) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.92))]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Featured guide</Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              Published {formatDate(featuredArticle.createdAt)}
            </span>
          </div>
          <CardTitle className="headline text-3xl md:text-4xl">{featuredArticle.title}</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            {featuredArticle.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-subtle)]">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
            Start with the most recent editorial entry before moving into the wider guide archive.
          </div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
            href={`/guides/${featuredArticle.slug}`}
          >
            Read featured guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {otherArticles.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {otherArticles.map((article) => (
            <Card key={article.id} className="h-full">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>Guide</Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    Published {formatDate(article.createdAt)}
                  </span>
                </div>
                <CardTitle>{article.title}</CardTitle>
                <CardDescription>{article.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--color-subtle)]">Editorial note</span>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
                  href={`/guides/${article.slug}`}
                >
                  Read guide
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="border-dashed bg-[var(--color-surface)]/80">
        <CardHeader>
          <Badge>Editorial rhythm</Badge>
          <CardTitle>Read, apply, and loop back with context</CardTitle>
          <CardDescription>
            The guides section stays intentionally compact: each article is meant to send you back into tools,
            lessons, or discussion instead of trapping you in passive reading.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
