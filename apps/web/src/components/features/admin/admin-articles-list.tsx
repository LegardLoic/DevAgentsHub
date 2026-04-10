'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpenText, PlusCircle } from 'lucide-react';

import type { AdminArticleSummary } from '@devagentshub/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Section } from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { fetchAdminArticles } from '../../../lib/admin-content';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';
import { AdminGate } from './admin-gate';

const ArticleCards = ({ articles }: { articles: AdminArticleSummary[] }) => (
  <div className="grid gap-6">
    {articles.map((article) => (
      <Card key={article.id}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{article.isPublished ? 'Published' : 'Draft'}</Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              Updated {formatDate(article.updatedAt)}
            </span>
          </div>
          <CardTitle>{article.title}</CardTitle>
          <CardDescription>{article.excerpt}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-subtle)]">{article.slug}</div>
          <div className="flex flex-wrap gap-3">
            {article.isPublished ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/guides/${article.slug}`}>Open public guide</Link>
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href={`/admin/articles/${article.id}`}>
                Edit article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const AdminArticlesList = () => (
  <AdminGate nextPath="/admin/articles">
    {() => <AdminArticlesListContent />}
  </AdminGate>
);

const AdminArticlesListContent = () => {
  const articlesQuery = useQuery({
    queryKey: queryKeys.adminArticles,
    queryFn: fetchAdminArticles,
  });

  if (articlesQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching admin article inventory." title="Loading articles" tone="loading" />
      </Section>
    );
  }

  if (articlesQuery.isError) {
    if (articlesQuery.error instanceof ApiClientError && articlesQuery.error.statusCode === 401) {
      return (
        <Section>
          <AdminAuthRequired nextPath="/admin/articles" />
        </Section>
      );
    }

    if (articlesQuery.error instanceof ApiClientError && articlesQuery.error.statusCode === 403) {
      return (
        <Section>
          <AdminAccessDenied />
        </Section>
      );
    }

    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(articlesQuery.error, 'The admin article list could not be loaded.')}
          title="Articles unavailable"
          tone="error"
        />
      </Section>
    );
  }

  const articles = articlesQuery.data ?? [];

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/admin">
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge>Article management</Badge>
          <h1 className="headline text-5xl font-bold">Admin article inventory</h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
            Review the editorial catalog, publish drafts, and keep the guides section operational.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New article
          </Link>
        </Button>
      </div>

      {articles.length ? (
        <ArticleCards articles={articles} />
      ) : (
        <EmptyState
          description="Create the first admin-managed article to extend the seeded editorial slice."
          icon={<BookOpenText className="h-6 w-6 text-[var(--color-accent)]" />}
          title="No admin articles yet"
        />
      )}
    </Section>
  );
};
