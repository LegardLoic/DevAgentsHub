import type {
  BookmarkSummary,
  BookmarkTargetType,
  CreateBookmarkPayload,
  DeleteBookmarkResponse,
} from '@devagentshub/types';

import { apiFetch, deleteJson, postJson } from './api';

export const listBookmarks = () => apiFetch<BookmarkSummary[]>('/api/me/bookmarks');

export const createBookmark = (payload: CreateBookmarkPayload) =>
  postJson<BookmarkSummary, CreateBookmarkPayload>('/api/me/bookmarks', payload);

export const deleteBookmark = (id: string) =>
  deleteJson<DeleteBookmarkResponse>(`/api/me/bookmarks/${id}`);

export const findBookmarkForTarget = (
  bookmarks: BookmarkSummary[],
  targetType: BookmarkTargetType,
  targetId: string,
) =>
  bookmarks.find((bookmark) => bookmark.targetType === targetType && bookmark.targetId === targetId) ??
  null;
