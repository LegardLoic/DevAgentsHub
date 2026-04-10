'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import type { AdminArticlePayload } from '@devagentshub/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Section, Textarea } from '@devagentshub/ui';
import { slugify } from '@devagentshub/utils';
import { adminArticleSchema } from '@devagentshub/validation';

import { createAdminArticle, fetchAdminArticle, updateAdminArticle } from '../../../lib/admin-content';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';
import { AdminGate } from './admin-gate';

const defaultValues: AdminArticlePayload = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  isPublished: false,
};

interface AdminArticleEditorProps {
  articleId?: string;
}

export const AdminArticleEditor = ({ articleId }: AdminArticleEditorProps) => (
  <AdminGate nextPath={articleId ? `/admin/articles/${articleId}` : '/admin/articles/new'}>
    {() => <AdminArticleEditorContent articleId={articleId} />}
  </AdminGate>
);

const AdminArticleEditorContent = ({ articleId }: AdminArticleEditorProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(articleId));
  const form = useForm<AdminArticlePayload>({
    resolver: zodResolver(adminArticleSchema),
    defaultValues,
  });
  const titleValue = form.watch('title');

  const articleQuery = useQuery({
    queryKey: queryKeys.adminArticle(articleId ?? 'new'),
    queryFn: () => fetchAdminArticle(articleId as string),
    enabled: Boolean(articleId),
  });

  useEffect(() => {
    if (!articleId || !articleQuery.data) {
      return;
    }

    form.reset({
      title: articleQuery.data.title,
      slug: articleQuery.data.slug,
      excerpt: articleQuery.data.excerpt,
      content: articleQuery.data.content,
      isPublished: articleQuery.data.isPublished,
    });
    setSlugManuallyEdited(true);
  }, [articleId, articleQuery.data, form]);

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    form.setValue('slug', slugify(titleValue), {
      shouldDirty: Boolean(titleValue),
      shouldValidate: false,
    });
  }, [form, slugManuallyEdited, titleValue]);

  const mutation = useMutation({
    mutationFn: (values: AdminArticlePayload) =>
      articleId ? updateAdminArticle(articleId, values) : createAdminArticle(values),
    onSuccess: async (article) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminArticles }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminArticle(article.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.articles }),
        queryClient.invalidateQueries({ queryKey: queryKeys.article(article.slug) }),
      ]);

      form.reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        isPublished: article.isPublished,
      });
      setSlugManuallyEdited(true);

      if (!articleId) {
        router.push(`/admin/articles/${article.id}`);
        router.refresh();
      }
    },
  });

  if (articleId && articleQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching article details for editing." title="Loading article" tone="loading" />
      </Section>
    );
  }

  if (articleId && articleQuery.isError) {
    if (articleQuery.error instanceof ApiClientError && articleQuery.error.statusCode === 401) {
      return (
        <Section>
          <AdminAuthRequired nextPath={`/admin/articles/${articleId}`} />
        </Section>
      );
    }

    if (articleQuery.error instanceof ApiClientError && articleQuery.error.statusCode === 403) {
      return (
        <Section>
          <AdminAccessDenied />
        </Section>
      );
    }

    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(articleQuery.error, 'The article could not be loaded for editing.')}
          title="Article unavailable"
          tone="error"
        />
      </Section>
    );
  }

  const article = articleQuery.data;

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/admin/articles">
        <ArrowLeft className="h-4 w-4" />
        Back to articles
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge>{articleId ? 'Edit article' : 'New article'}</Badge>
          <h1 className="headline text-5xl font-bold">
            {articleId ? 'Update editorial content' : 'Create a new guide'}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
            Keep the content slice practical. Plain markdown is enough for the current MVP.
          </p>
        </div>
        {article?.isPublished ? (
          <Button asChild variant="secondary">
            <Link href={`/guides/${article.slug}`}>
              Open public guide
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{articleId ? 'Article settings' : 'Article draft'}</CardTitle>
          <CardDescription>
            Title, slug, excerpt, markdown content, and publication status are all managed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register('title')} />
              {form.formState.errors.title ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slug">Slug</Label>
                <button
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                  onClick={() => {
                    form.setValue('slug', slugify(form.getValues('title')), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setSlugManuallyEdited(false);
                  }}
                  type="button"
                >
                  Auto-fill from title
                </button>
              </div>
              <Input
                id="slug"
                {...form.register('slug')}
                onChange={(event) => {
                  setSlugManuallyEdited(true);
                  form.register('slug').onChange(event);
                }}
              />
              {form.formState.errors.slug ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" {...form.register('excerpt')} />
              {form.formState.errors.excerpt ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.excerpt.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea className="min-h-[320px]" id="content" {...form.register('content')} />
              {form.formState.errors.content ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.content.message}</p>
              ) : null}
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--color-ink)]">Published</span>
              <input type="checkbox" {...form.register('isPublished')} />
            </label>

            {mutation.error instanceof ApiClientError ? (
              <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                {mutation.error.message}
              </p>
            ) : null}

            {mutation.isSuccess && articleId ? (
              <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
                Article saved successfully.
              </p>
            ) : null}

            <Button className="w-full" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? 'Saving...' : articleId ? 'Save article' : 'Create article'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Section>
  );
};
