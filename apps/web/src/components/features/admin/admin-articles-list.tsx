'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenText, PlusCircle, Search, SlidersHorizontal } from 'lucide-react';

import type { AdminArticleSummary } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { fetchAdminArticles } from '../../../lib/admin-content';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';
import { PublicationBadge } from './admin-content-status';
import { AdminGate } from './admin-gate';

type PublicationFilter = 'all' | 'published' | 'draft';

const ArticleCards = ({ articles }: { articles: AdminArticleSummary[] }) => (
  <div className="grid gap-6">
    {articles.map((article) => (
      <Card key={article.id}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <PublicationBadge isPublished={article.isPublished} />
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
            ) : (
              <span className="rounded-full bg-[rgba(234,88,12,0.08)] px-3 py-2 text-xs font-semibold text-[var(--color-warm)]">
                Public guide hidden while draft
              </span>
            )}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>('all');

  const articlesQuery = useQuery({
    queryKey: queryKeys.adminArticles,
    queryFn: fetchAdminArticles,
  });

  const articles = articlesQuery.data ?? [];
  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !normalizedSearch ||
        article.title.toLowerCase().includes(normalizedSearch) ||
        article.slug.toLowerCase().includes(normalizedSearch);
      const matchesPublication =
        publicationFilter === 'all' ||
        (publicationFilter === 'published' && article.isPublished) ||
        (publicationFilter === 'draft' && !article.isPublished);

      return matchesSearch && matchesPublication;
    });
  }, [articles, publicationFilter, searchTerm]);

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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent)]" />
              <Badge>Filters</Badge>
            </div>
            <CardTitle>Find articles faster</CardTitle>
            <CardDescription>
              Search by title or slug and narrow the editorial inventory by publication state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" />
              <Input
                className="pl-11"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title or slug..."
                value={searchTerm}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setPublicationFilter('all')}
                size="sm"
                variant={publicationFilter === 'all' ? 'default' : 'secondary'}
              >
                All
              </Button>
              <Button
                onClick={() => setPublicationFilter('published')}
                size="sm"
                variant={publicationFilter === 'published' ? 'default' : 'secondary'}
              >
                Published
              </Button>
              <Button
                onClick={() => setPublicationFilter('draft')}
                size="sm"
                variant={publicationFilter === 'draft' ? 'default' : 'secondary'}
              >
                Drafts
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {articles.length ? (
        filteredArticles.length ? (
          <ArticleCards articles={filteredArticles} />
        ) : (
          <EmptyState
            description="No articles match the current search and publication filters."
            title="No matching articles"
          />
        )
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
