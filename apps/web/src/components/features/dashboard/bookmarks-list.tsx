'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpenText,
  GraduationCap,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import type { BookmarkSummary, BookmarkTargetType } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { useCurrentUser } from '../../../hooks/use-auth';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { deleteBookmark, listBookmarks } from '../../../lib/bookmarks';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { DashboardAuthRequired } from './dashboard-auth-required';

type BookmarkFilter = 'all' | BookmarkTargetType;

const getTargetLabel = (targetType: BookmarkTargetType) =>
  targetType === 'article' ? 'Guide' : 'Course';

const getTargetIcon = (targetType: BookmarkTargetType) =>
  targetType === 'article' ? (
    <BookOpenText className="h-4 w-4 text-[var(--color-accent)]" />
  ) : (
    <GraduationCap className="h-4 w-4 text-[var(--color-accent)]" />
  );

const BookmarkCard = ({
  bookmark,
  isRemoving,
  onRemove,
}: {
  bookmark: BookmarkSummary;
  isRemoving: boolean;
  onRemove: () => void;
}) => (
  <Card>
    <CardHeader>
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{getTargetLabel(bookmark.targetType)}</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          Saved {formatDate(bookmark.createdAt)}
        </span>
      </div>
      <CardTitle>{bookmark.title}</CardTitle>
      <CardDescription>{bookmark.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-[var(--color-subtle)]">
        {getTargetIcon(bookmark.targetType)}
        <span>{bookmark.slug}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link href={bookmark.href}>
            Open content
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button disabled={isRemoving} onClick={onRemove} size="sm" variant="secondary">
          <Trash2 className="mr-2 h-4 w-4" />
          {isRemoving ? 'Removing...' : 'Remove'}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const BookmarksList = () => {
  const queryClient = useQueryClient();
  const userQuery = useCurrentUser();
  const [filter, setFilter] = useState<BookmarkFilter>('all');
  const [removedMessage, setRemovedMessage] = useState<string | null>(null);

  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks(userQuery.data?.id ?? 'anonymous'),
    queryFn: listBookmarks,
    enabled: Boolean(userQuery.data),
  });

  const removeMutation = useMutation({
    mutationFn: deleteBookmark,
    onSuccess: async () => {
      setRemovedMessage('Bookmark removed successfully.');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks(userQuery.data?.id ?? 'anonymous'),
      });
    },
  });

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Checking your authenticated session." title="Loading bookmarks" tone="loading" />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(userQuery.error, 'The bookmarks area could not be loaded.')}
          title="Dashboard unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!userQuery.data) {
    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <DashboardAuthRequired
          description="Login to revisit bookmarked guides and courses from one dashboard page."
          nextPath="/dashboard/bookmarks"
        />
      </Section>
    );
  }

  if (bookmarksQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching your bookmarked content." title="Loading bookmarks" tone="loading" />
      </Section>
    );
  }

  if (bookmarksQuery.isError) {
    const isUnauthorized = bookmarksQuery.error instanceof ApiClientError && bookmarksQuery.error.statusCode === 401;

    return (
      <Section>
        {isUnauthorized ? (
          <DashboardAuthRequired
            description="Your session expired. Login again to access your bookmarks."
            nextPath="/dashboard/bookmarks"
          />
        ) : (
          <StatusPanel
            description={getApiClientErrorMessage(bookmarksQuery.error, 'Your bookmarks could not be loaded.')}
            title="Bookmarks unavailable"
            tone="error"
          />
        )}
      </Section>
    );
  }

  const bookmarks = bookmarksQuery.data ?? [];
  const filteredBookmarks =
    filter === 'all' ? bookmarks : bookmarks.filter((bookmark) => bookmark.targetType === filter);

  if (!bookmarks.length) {
    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <EmptyState
          description="Bookmarks keep useful guides and courses one click away. Save content when it helps a decision, then revisit it from the dashboard before applying it with tools."
          icon={<Bookmark className="h-6 w-6 text-[var(--color-accent)]" />}
          title="No bookmarks yet"
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/guides">Browse guides</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/formations">Browse courses</Link>
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="space-y-3">
        <Badge>Bookmarks</Badge>
        <h1 className="headline text-5xl font-bold">Your saved guides and courses</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Keep intentional references close, then jump back into the article or course when you need it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Quick filter</Badge>
          </div>
          <CardTitle>Filter saved content</CardTitle>
          <CardDescription>
            Separate editorial guides from learning paths when the dashboard starts filling up.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setFilter('all')} size="sm" variant={filter === 'all' ? 'default' : 'secondary'}>
            All bookmarks
          </Button>
          <Button onClick={() => setFilter('article')} size="sm" variant={filter === 'article' ? 'default' : 'secondary'}>
            Guides
          </Button>
          <Button onClick={() => setFilter('course')} size="sm" variant={filter === 'course' ? 'default' : 'secondary'}>
            Courses
          </Button>
        </CardContent>
      </Card>

      {removedMessage ? (
        <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
          {removedMessage}
        </p>
      ) : null}
      {removeMutation.error ? (
        <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
          {getApiClientErrorMessage(removeMutation.error, 'The bookmark could not be removed.')}
        </p>
      ) : null}

      {filteredBookmarks.length ? (
        <div className="grid gap-6">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              isRemoving={removeMutation.isPending && removeMutation.variables === bookmark.id}
              onRemove={() => {
                setRemovedMessage(null);
                removeMutation.mutate(bookmark.id);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="No bookmarks match this filter. Switch back to all bookmarks or choose another content type."
          title="Nothing in this filter"
        />
      )}
    </Section>
  );
};
