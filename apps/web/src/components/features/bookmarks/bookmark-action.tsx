'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

import type { BookmarkTargetType } from '@devagentshub/types';
import { Badge, Button } from '@devagentshub/ui';

import { useCurrentUser } from '../../../hooks/use-auth';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import {
  createBookmark,
  deleteBookmark,
  findBookmarkForTarget,
  listBookmarks,
} from '../../../lib/bookmarks';
import { queryKeys } from '../../../lib/query-keys';

interface BookmarkActionProps {
  loginNextPath: string;
  targetId: string;
  targetTitle: string;
  targetType: BookmarkTargetType;
}

export const BookmarkAction = ({
  loginNextPath,
  targetId,
  targetTitle,
  targetType,
}: BookmarkActionProps) => {
  const queryClient = useQueryClient();
  const userQuery = useCurrentUser();
  const [message, setMessage] = useState<string | null>(null);

  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks(userQuery.data?.id ?? 'anonymous'),
    queryFn: listBookmarks,
    enabled: Boolean(userQuery.data),
  });

  const currentBookmark = findBookmarkForTarget(bookmarksQuery.data ?? [], targetType, targetId);

  const createMutation = useMutation({
    mutationFn: () =>
      createBookmark({
        targetType,
        targetId,
      }),
    onSuccess: async () => {
      setMessage(`${targetTitle} has been added to your bookmarks.`);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks(userQuery.data?.id ?? 'anonymous'),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bookmarkId: string) => deleteBookmark(bookmarkId),
    onSuccess: async () => {
      setMessage(`${targetTitle} has been removed from your bookmarks.`);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks(userQuery.data?.id ?? 'anonymous'),
      });
    },
  });

  const mutationError = createMutation.error ?? deleteMutation.error;
  const isPending = createMutation.isPending || deleteMutation.isPending;

  if (userQuery.isLoading) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface)] p-4 text-sm text-[var(--color-subtle)]">
        Checking bookmark access...
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="rounded-2xl bg-[rgba(234,88,12,0.1)] p-4 text-sm text-[var(--color-warm)]">
        {getApiClientErrorMessage(userQuery.error, 'Bookmark status could not be checked.')}
      </div>
    );
  }

  if (!userQuery.data) {
    return (
      <div className="space-y-3 rounded-2xl bg-[var(--color-surface)] p-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-[var(--color-accent)]" />
          <Badge>Bookmark</Badge>
        </div>
        <p className="text-sm leading-6 text-[var(--color-subtle)]">
          Login to save this {targetType} in your dashboard.
        </p>
        <Button asChild size="sm">
          <Link href={`/login?next=${encodeURIComponent(loginNextPath)}`}>Login to bookmark</Link>
        </Button>
      </div>
    );
  }

  if (bookmarksQuery.isLoading) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface)] p-4 text-sm text-[var(--color-subtle)]">
        Loading bookmark state...
      </div>
    );
  }

  if (bookmarksQuery.isError) {
    const isUnauthorized = bookmarksQuery.error instanceof ApiClientError && bookmarksQuery.error.statusCode === 401;

    return (
      <div className="space-y-3 rounded-2xl bg-[rgba(234,88,12,0.1)] p-4 text-sm text-[var(--color-warm)]">
        <p>
          {isUnauthorized
            ? 'Your session expired. Login again to manage bookmarks.'
            : getApiClientErrorMessage(bookmarksQuery.error, 'Bookmark status could not be loaded.')}
        </p>
        {isUnauthorized ? (
          <Button asChild size="sm">
            <Link href={`/login?next=${encodeURIComponent(loginNextPath)}`}>Login again</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2">
        {currentBookmark ? (
          <BookmarkCheck className="h-4 w-4 text-[var(--color-accent)]" />
        ) : (
          <Bookmark className="h-4 w-4 text-[var(--color-accent)]" />
        )}
        <Badge>{currentBookmark ? 'Bookmarked' : 'Bookmark'}</Badge>
      </div>
      <p className="text-sm leading-6 text-[var(--color-subtle)]">
        {currentBookmark
          ? `This ${targetType} is saved in your dashboard.`
          : `Save this ${targetType} so you can revisit it from your dashboard.`}
      </p>
      <Button
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          if (currentBookmark) {
            deleteMutation.mutate(currentBookmark.id);
            return;
          }

          createMutation.mutate();
        }}
        size="sm"
        variant={currentBookmark ? 'secondary' : 'default'}
      >
        {isPending
          ? 'Saving...'
          : currentBookmark
            ? 'Remove bookmark'
            : 'Save bookmark'}
      </Button>
      {message ? (
        <p className="text-sm text-[var(--color-accent-strong)]">{message}</p>
      ) : null}
      {mutationError ? (
        <p className="text-sm text-[var(--color-warm)]">
          {getApiClientErrorMessage(mutationError, 'Bookmark action failed.')}
        </p>
      ) : null}
    </div>
  );
};
