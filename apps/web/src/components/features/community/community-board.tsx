'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessageSquare, PenLine } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type {
  CreateDiscussionPayload,
  DiscussionDetail,
  DiscussionPreview,
} from '@devagentshub/types';
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
  Label,
  Textarea,
} from '@devagentshub/ui';
import { discussionSchema } from '@devagentshub/validation';
import { excerpt, formatDate } from '@devagentshub/utils';

import { ApiClientError, apiFetch, getApiClientErrorMessage, postJson } from '../../../lib/api';
import { communityContextualLinks } from '../../../lib/contextual-links';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';

const getAuthorName = (discussion: DiscussionPreview): string =>
  discussion.author.profile?.displayName ?? discussion.author.email;

const getReplyLabel = (count: number): string => `${count} ${count === 1 ? 'reply' : 'replies'}`;

export const CommunityBoard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userQuery = useCurrentUser();
  const user = userQuery.data;
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

  const discussions = [...(discussionsQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card className="bg-[var(--color-surface)]/70 shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Newest first</Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                {discussions.length} active {discussions.length === 1 ? 'thread' : 'threads'}
              </span>
            </div>
            <CardTitle>Implementation questions, tradeoffs, and feedback loops</CardTitle>
            <CardDescription>
              Best suited for practical questions: tool outputs to review, guide takeaways to
              compare, and implementation decisions that need another angle.
            </CardDescription>
          </CardHeader>
        </Card>

        {discussionsQuery.isLoading ? (
          <StatusPanel
            description="Fetching discussion threads."
            title="Loading discussions"
            tone="loading"
          />
        ) : discussionsQuery.isError ? (
          <StatusPanel
            description={getApiClientErrorMessage(
              discussionsQuery.error,
              'The discussion list could not be loaded.',
            )}
            title="Unable to load discussions"
            tone="error"
          />
        ) : !discussions.length ? (
          <div className="space-y-4">
            <EmptyState
              description="Start with a concrete implementation question, a tool result you want challenged, or a lesson takeaway you want to compare."
              icon={<MessageSquare className="h-6 w-6 text-[var(--color-accent)]" />}
              title="No discussions yet"
            />
            <Button asChild variant="secondary">
              <Link href="/tools">Open a tool first</Link>
            </Button>
          </div>
        ) : (
          discussions.map((discussion) => (
            <Card className="transition hover:-translate-y-0.5 hover:shadow-xl" key={discussion.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{getReplyLabel(discussion.repliesCount)}</Badge>
                    <Badge>Thread</Badge>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {formatDate(discussion.createdAt)}
                  </span>
                </div>
                <CardTitle className="text-2xl">{discussion.title}</CardTitle>
                <CardDescription className="text-base leading-7">
                  {excerpt(discussion.content, 220)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    Started by
                  </span>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {getAuthorName(discussion)}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/community/${discussion.slug}`}>
                    Open thread
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <PenLine className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Ask clearly</Badge>
          </div>
          <CardTitle>Start a discussion</CardTitle>
          <CardDescription>
            Share the concrete context: what you tried, what is unclear, and what kind of feedback
            would help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userQuery.isLoading ? (
            <StatusPanel
              description="Checking your authenticated session before enabling posting."
              title="Preparing discussion form"
              tone="loading"
            />
          ) : user ? (
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="How would you structure a reviewable agent workflow?"
                  {...form.register('title')}
                />
                {form.formState.errors.title ? (
                  <p className="text-sm text-[var(--color-warm)]">
                    {form.formState.errors.title.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Describe the implementation context, the tradeoff, and what feedback you need."
                  {...form.register('content')}
                />
                {form.formState.errors.content ? (
                  <p className="text-sm text-[var(--color-warm)]">
                    {form.formState.errors.content.message}
                  </p>
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
                description="Login to create threads and keep discussions tied to your profile."
                title="Authentication required"
              />
              <Button asChild className="w-full">
                <Link href="/login?next=/community">Login to post</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-start-2">
        <ContextualLinkCards
          description="Use community when a guide, tool output, or lesson needs feedback from another developer perspective."
          eyebrow="Community loops"
          layout="stack"
          links={communityContextualLinks}
          title="Bring stronger context into the board"
        />
      </div>
    </div>
  );
};
