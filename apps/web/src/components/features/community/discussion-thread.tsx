'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { CreateDiscussionReplyPayload, DiscussionDetail } from '@devagentshub/types';
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
  Section,
  Textarea,
} from '@devagentshub/ui';
import { discussionReplySchema } from '@devagentshub/validation';
import { formatDate } from '@devagentshub/utils';

import { ApiClientError, apiFetch, getApiClientErrorMessage, postJson } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { StatusPanel } from '../../layout/status-panel';

export const DiscussionThread = ({ slug }: { slug: string }) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const form = useForm<CreateDiscussionReplyPayload>({
    resolver: zodResolver(discussionReplySchema),
    defaultValues: {
      content: '',
    },
  });

  const discussionQuery = useQuery({
    queryKey: queryKeys.discussion(slug),
    queryFn: () => apiFetch<DiscussionDetail>(`/api/discussions/${slug}`),
  });

  const replyMutation = useMutation({
    mutationFn: (values: CreateDiscussionReplyPayload) =>
      postJson<DiscussionDetail['replies'][number], CreateDiscussionReplyPayload>(
        `/api/discussions/${discussionQuery.data?.id}/replies`,
        values,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.discussion(slug) });
      form.reset();
    },
  });

  if (discussionQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching discussion details." title="Loading thread" tone="loading" />
      </Section>
    );
  }

  if (discussionQuery.isError || !discussionQuery.data) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(discussionQuery.error, 'The thread could not be loaded.')}
          title="Thread unavailable"
          tone="error"
        />
      </Section>
    );
  }

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/community">
        <ArrowLeft className="h-4 w-4" />
        Back to community
      </Link>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Badge>{discussionQuery.data.repliesCount} replies</Badge>
            <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              {formatDate(discussionQuery.data.createdAt)}
            </span>
          </div>
          <CardTitle>{discussionQuery.data.title}</CardTitle>
          <CardDescription>{discussionQuery.data.content}</CardDescription>
          <p className="text-sm text-[var(--color-subtle)]">
            Started by {discussionQuery.data.author.profile?.displayName ?? discussionQuery.data.author.email}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {discussionQuery.data.replies.length ? (
            discussionQuery.data.replies.map((reply) => (
              <div key={reply.id} className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[var(--color-ink)]">
                    {reply.author.profile?.displayName ?? reply.author.email}
                  </p>
                  <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--color-subtle)]">{reply.content}</p>
              </div>
            ))
          ) : (
            <EmptyState
              description="This thread does not have any replies yet."
              title="No replies posted"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply to this thread</CardTitle>
          <CardDescription>
            Use this form to exercise the authenticated reply endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <form className="space-y-4" onSubmit={form.handleSubmit((values) => replyMutation.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="content">Reply</Label>
                <Textarea id="content" {...form.register('content')} />
                {form.formState.errors.content ? (
                  <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.content.message}</p>
                ) : null}
              </div>
              {replyMutation.error instanceof ApiClientError ? (
                <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                  {replyMutation.error.message}
                </p>
              ) : null}
              {replyMutation.status === 'success' ? (
                <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
                  Reply posted. The thread has been refreshed.
                </p>
              ) : null}
              <Button disabled={replyMutation.isPending} type="submit">
                {replyMutation.isPending ? 'Posting...' : 'Post reply'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <StatusPanel
                description="Login or register before posting a reply."
                title="Authentication required"
              />
              <Button asChild>
                <Link href="/login">Login to reply</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
};
