'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, PenLine } from 'lucide-react';
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
import { communityContextualLinks } from '../../../lib/contextual-links';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';

const getAuthorName = (author: DiscussionDetail['author']): string =>
  author.profile?.displayName ?? author.email;

const getReplyLabel = (count: number): string => `${count} ${count === 1 ? 'reply' : 'replies'}`;

export const DiscussionThread = ({ slug }: { slug: string }) => {
  const queryClient = useQueryClient();
  const userQuery = useCurrentUser();
  const user = userQuery.data;
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
    mutationFn: ({
      discussionId,
      values,
    }: {
      discussionId: string;
      values: CreateDiscussionReplyPayload;
    }) =>
      postJson<DiscussionDetail['replies'][number], CreateDiscussionReplyPayload>(
        `/api/discussions/${discussionId}/replies`,
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
        <StatusPanel
          description="Fetching discussion details."
          title="Loading thread"
          tone="loading"
        />
      </Section>
    );
  }

  if (discussionQuery.isError || !discussionQuery.data) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(
            discussionQuery.error,
            'The thread could not be loaded.',
          )}
          title="Thread unavailable"
          tone="error"
        />
      </Section>
    );
  }

  const discussion = discussionQuery.data;

  return (
    <Section className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
        href="/community"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to community
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Original post</Badge>
                  <Badge>{getReplyLabel(discussion.repliesCount)}</Badge>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                  {formatDate(discussion.createdAt)}
                </span>
              </div>
              <CardTitle className="text-3xl">{discussion.title}</CardTitle>
              <CardDescription className="text-base leading-7">
                Started by {getAuthorName(discussion.author)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-3xl bg-[var(--color-surface)] p-5 text-base leading-8 text-[var(--color-ink)]">
                {discussion.content}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Replies</Badge>
              </div>
              <CardTitle>Thread responses</CardTitle>
              <CardDescription>
                Compare implementation angles, clarify assumptions, and keep replies actionable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {discussion.replies.length ? (
                discussion.replies.map((reply, index) => (
                  <div
                    className="rounded-3xl border border-[var(--color-border)] bg-white p-5"
                    key={reply.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--color-ink)]">
                          {getAuthorName(reply.author)}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                          Reply #{index + 1}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-subtle)]">
                      {reply.content}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  description="Add the first useful angle: a constraint to check, a concrete next step, or a tradeoff the author should consider."
                  icon={<MessageSquare className="h-6 w-6 text-[var(--color-accent)]" />}
                  title="No replies posted"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <PenLine className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Contribute</Badge>
              </div>
              <CardTitle>Reply to this thread</CardTitle>
              <CardDescription>
                Keep replies practical: call out assumptions, suggest a next step, or share a
                relevant tool/course angle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userQuery.isLoading ? (
                <StatusPanel
                  description="Checking your authenticated session before enabling replies."
                  title="Preparing reply form"
                  tone="loading"
                />
              ) : user ? (
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit((values) =>
                    replyMutation.mutate({
                      discussionId: discussion.id,
                      values,
                    }),
                  )}
                >
                  <div className="space-y-2">
                    <Label htmlFor="content">Reply</Label>
                    <Textarea
                      id="content"
                      placeholder="Share a concrete implementation angle, question, or next step."
                      {...form.register('content')}
                    />
                    {form.formState.errors.content ? (
                      <p className="text-sm text-[var(--color-warm)]">
                        {form.formState.errors.content.message}
                      </p>
                    ) : null}
                  </div>
                  {replyMutation.error instanceof ApiClientError ? (
                    <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                      {replyMutation.error.message}
                    </p>
                  ) : null}
                  {replyMutation.status === 'success' ? (
                    <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
                      Reply posted. The thread has been refreshed with the latest responses.
                    </p>
                  ) : null}
                  <Button disabled={replyMutation.isPending} type="submit">
                    {replyMutation.isPending ? 'Posting...' : 'Post reply'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <StatusPanel
                    description="Login to add a reply and keep your contribution tied to your profile."
                    title="Authentication required"
                  />
                  <Button asChild>
                    <Link href={`/login?next=/community/${slug}`}>Login to reply</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <Badge>Best suited for</Badge>
              <CardTitle>Practical implementation feedback</CardTitle>
              <CardDescription>
                This thread is strongest when replies stay concrete: constraints, tradeoffs,
                examples, and next actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-[var(--color-subtle)]">
              <p>- Ask what assumption should be tested next.</p>
              <p>- Bring a tool result that needs review.</p>
              <p>- Connect the answer back to a guide or lesson.</p>
            </CardContent>
          </Card>

          <ContextualLinkCards
            description="Move between learning, tools, and discussion without turning the board into a standalone forum."
            eyebrow="Next moves"
            layout="stack"
            links={communityContextualLinks}
            title="Use the thread in context"
          />
        </div>
      </div>
    </Section>
  );
};
