import type { Prisma } from '@prisma/client';

import type { BookmarkSummary, BookmarkTargetType } from '@devagentshub/types';

import { prisma } from '../lib/prisma';

const bookmarkInclude = {
  article: {
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
    },
  },
  course: {
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
    },
  },
} satisfies Prisma.BookmarkInclude;

type BookmarkRecord = Prisma.BookmarkGetPayload<{
  include: typeof bookmarkInclude;
}>;

export const serializeBookmark = (bookmark: BookmarkRecord): BookmarkSummary => {
  if (bookmark.article) {
    return {
      id: bookmark.id,
      targetType: 'article',
      targetId: bookmark.article.id,
      title: bookmark.article.title,
      slug: bookmark.article.slug,
      description: bookmark.article.excerpt,
      href: `/guides/${bookmark.article.slug}`,
      createdAt: bookmark.createdAt.toISOString(),
    };
  }

  if (bookmark.course) {
    return {
      id: bookmark.id,
      targetType: 'course',
      targetId: bookmark.course.id,
      title: bookmark.course.title,
      slug: bookmark.course.slug,
      description: bookmark.course.description,
      href: `/formations/${bookmark.course.slug}`,
      createdAt: bookmark.createdAt.toISOString(),
    };
  }

  throw new Error(`Bookmark ${bookmark.id} does not have a supported target.`);
};

export class BookmarkRepository {
  async listByUserId(userId: string): Promise<BookmarkSummary[]> {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
      },
      include: bookmarkInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookmarks.map(serializeBookmark);
  }

  async findByTargetForUser(
    userId: string,
    targetType: BookmarkTargetType,
    targetId: string,
  ): Promise<BookmarkSummary | null> {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        ...(targetType === 'article' ? { articleId: targetId } : { courseId: targetId }),
      },
      include: bookmarkInclude,
    });

    return bookmark ? serializeBookmark(bookmark) : null;
  }

  async createArticleBookmark(userId: string, articleId: string): Promise<BookmarkSummary> {
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        articleId,
      },
      include: bookmarkInclude,
    });

    return serializeBookmark(bookmark);
  }

  async createCourseBookmark(userId: string, courseId: string): Promise<BookmarkSummary> {
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        courseId,
      },
      include: bookmarkInclude,
    });

    return serializeBookmark(bookmark);
  }

  async deleteByIdForUser(userId: string, id: string): Promise<boolean> {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!bookmark) {
      return false;
    }

    await prisma.bookmark.delete({
      where: {
        id: bookmark.id,
      },
    });

    return true;
  }
}

export const bookmarkRepository = new BookmarkRepository();
