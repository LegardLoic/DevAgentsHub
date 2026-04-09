'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import type { CreateDiscussionPayload, DiscussionDetail, DiscussionPreview } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Label,
  Textarea,
} from '@devagentshub/ui';
import { discussionSchema } from '@devagentshub/validation';
import { formatDate } from '@devagentshub/utils';

import { ApiClientError, apiFetch, getApiClientErrorMessage, postJson } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { StatusPanel } from '../../layout/status-panel';

export const CommunityBoard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const form = useForm<CreateDiscussionPayload>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const discussionsQuery = useQuery({
    queryKey: queryKeys.discussions,
    queryFn: () => apiFetch<DiscussionPreview[]>('/api/discussions'),
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateDiscussionPayload) =>
      postJson<DiscussionDetail, CreateDiscussionPayload>('/api/discussions', values),
    onSuccess: async (discussion) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.discussions });
      form.reset();
      router.push(`/community/${discussion.slug}`);
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {discussionsQuery.isLoading ? (
          <StatusPanel description="Fetching discussion threads." title="Loading discussions" tone="loading" />
        ) : discussionsQuery.isError ? (
          <StatusPanel
            description={getApiClientErrorMessage(discussionsQuery.error, 'The discussion list could not be loaded.')}
            title="Unable to load discussions"
            tone="error"
          />
        ) : !discussionsQuery.data?.length ? (
          <EmptyState
            description="No discussion has been published yet. Start the first thread once authenticated."
            title="No discussions yet"
          />
        ) : (
          discussionsQuery.data.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge>{discussion.repliesCount} replies</Badge>
                  <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {formatDate(discussion.createdAt)}
                  </span>
                </div>
                <CardTitle>{discussion.title}</CardTitle>
                <CardDescription>{discussion.content}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-subtle)]">
                  {discussion.author.profile?.displayName ?? discussion.author.email}
                </span>
                <Link className="text-sm font-semibold text-[var(--color-accent)]" href={`/community/${discussion.slug}`}>
                  Open thread
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start a discussion</CardTitle>
          <CardDescription>
            Posting requires authentication. Use this to test protected community endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <form className="space-y-5" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Textarea id="title" className="min-h-[120px]" {...form.register('title')} />
                {form.formState.errors.title ? (
                  <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.title.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" {...form.register('content')} />
                {form.formState.errors.content ? (
                  <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.content.message}</p>
                ) : null}
              </div>
              {createMutation.error instanceof ApiClientError ? (
                <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                  {createMutation.error.message}
                </p>
              ) : null}
              <Button className="w-full" disabled={createMutation.isPending} type="submit">
                {createMutation.isPending ? 'Publishing...' : 'Publish discussion'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <StatusPanel
                description="Login or register to create new community threads."
                title="Authentication required"
              />
              <Button asChild className="w-full">
                <Link href="/login">Login to post</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
