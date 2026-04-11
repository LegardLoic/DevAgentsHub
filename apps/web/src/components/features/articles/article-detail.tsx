'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

import type { ArticleDetail as ArticleDetailType } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { ApiClientError, apiFetch, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { BookmarkAction } from '../bookmarks/bookmark-action';
import { MarkdownView } from '../../layout/markdown-view';
import { StatusPanel } from '../../layout/status-panel';
import { GuideNextSteps } from './guide-next-steps';

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
    const isNotFound = articleQuery.error instanceof ApiClientError && articleQuery.error.statusCode === 404;

    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/guides">
          <ArrowLeft className="h-4 w-4" />
          Back to guides
        </Link>
        {isNotFound ? (
          <Card className="border-dashed bg-[var(--color-surface)]/80">
            <CardHeader>
              <Badge>Missing article</Badge>
              <CardTitle>Guide not found</CardTitle>
              <CardDescription>
                The requested guide does not exist anymore or has not been published yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/guides">Browse published guides</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/tools">Go to tools</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <StatusPanel
            description={getApiClientErrorMessage(articleQuery.error, 'The requested article could not be loaded.')}
            title="Guide unavailable"
            tone="error"
          />
        )}
      </Section>
    );
  }

  return (
    <Section className="space-y-8">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/guides">
        <ArrowLeft className="h-4 w-4" />
        Back to guides
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Published {formatDate(articleQuery.data.createdAt)}</Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                Editorial guide
              </span>
            </div>
            <CardTitle className="headline text-4xl md:text-5xl">{articleQuery.data.title}</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              {articleQuery.data.excerpt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <MarkdownView content={articleQuery.data.content} />
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <Badge>Reading context</Badge>
            <CardTitle>Why this guide exists</CardTitle>
            <CardDescription>
              DevAgentsHub treats articles as short editorial bridges between context, execution, and feedback loops.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-[var(--color-subtle)]">
            <div className="flex items-start gap-3">
              <Compass className="mt-1 h-4 w-4 text-[var(--color-accent)]" />
              <p>Read for framing, then leave the article quickly to execute the next step in the product.</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                Updated
              </p>
              <p className="mt-2 text-[var(--color-ink)]">{formatDate(articleQuery.data.updatedAt)}</p>
            </div>
            <BookmarkAction
              loginNextPath={`/guides/${articleQuery.data.slug}`}
              targetId={articleQuery.data.id}
              targetTitle={articleQuery.data.title}
              targetType="article"
            />
          </CardContent>
        </Card>
      </div>

      <GuideNextSteps currentSlug={articleQuery.data.slug} />
    </Section>
  );
};
