import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  article: {
    findFirst: vi.fn(),
  },
  course: {
    findFirst: vi.fn(),
  },
  bookmark: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createApp } from '../../app/create-app';
import { AUTH_COOKIE_NAME } from '../../constants/auth';
import { signAuthToken } from '../../utils/jwt';

const baseDates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const authUserRecord = {
  id: 'user_bookmarks',
  email: 'bookmarks@example.com',
  passwordHash: 'hashed-password',
  role: 'USER',
  profile: {
    id: 'profile_bookmarks',
    userId: 'user_bookmarks',
    displayName: 'Bookmark User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const authCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(authUserRecord.id)}`;

const articleRecord = {
  id: 'article_1',
  slug: 'brief-coding-agents-clearly',
  title: 'How to Brief Coding Agents Clearly',
  excerpt: 'Strong briefs reduce rework when they stay specific and grounded in the current repo.',
  content: '# Brief coding agents clearly',
  ...baseDates,
};

const courseRecord = {
  id: 'course_1',
  slug: 'fullstack-mvp-foundations',
  title: 'Fullstack MVP Foundations',
  description: 'Ship a production-minded MVP without skipping the foundations.',
  isPublished: true,
  _count: {
    lessons: 3,
  },
  ...baseDates,
};

const articleBookmarkRecord = {
  id: 'bookmark_article_1',
  userId: authUserRecord.id,
  articleId: articleRecord.id,
  courseId: null,
  article: {
    id: articleRecord.id,
    slug: articleRecord.slug,
    title: articleRecord.title,
    excerpt: articleRecord.excerpt,
  },
  course: null,
  createdAt: new Date('2026-03-10T09:00:00.000Z'),
};

const courseBookmarkRecord = {
  id: 'bookmark_course_1',
  userId: authUserRecord.id,
  articleId: null,
  courseId: courseRecord.id,
  article: null,
  course: {
    id: courseRecord.id,
    slug: courseRecord.slug,
    title: courseRecord.title,
    description: courseRecord.description,
  },
  createdAt: new Date('2026-03-11T09:00:00.000Z'),
};

describe('bookmark routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.article.findFirst.mockReset();
    prismaMock.course.findFirst.mockReset();
    prismaMock.bookmark.findMany.mockReset();
    prismaMock.bookmark.findFirst.mockReset();
    prismaMock.bookmark.create.mockReset();
    prismaMock.bookmark.delete.mockReset();
  });

  it('lists the authenticated user bookmarks', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.bookmark.findMany.mockResolvedValueOnce([
      courseBookmarkRecord,
      articleBookmarkRecord,
    ]);

    const response = await request(createApp()).get('/api/me/bookmarks').set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      expect.objectContaining({
        id: 'bookmark_course_1',
        targetType: 'course',
        href: '/formations/fullstack-mvp-foundations',
      }),
      expect.objectContaining({
        id: 'bookmark_article_1',
        targetType: 'article',
        href: '/guides/brief-coding-agents-clearly',
      }),
    ]);
    expect(prismaMock.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: authUserRecord.id,
        },
      }),
    );
  });

  it('rejects unauthenticated access to bookmarks', async () => {
    const response = await request(createApp()).get('/api/me/bookmarks');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(prismaMock.bookmark.findMany).not.toHaveBeenCalled();
  });

  it('creates an article bookmark for the authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.article.findFirst.mockResolvedValueOnce(articleRecord);
    prismaMock.bookmark.findFirst.mockResolvedValueOnce(null);
    prismaMock.bookmark.create.mockResolvedValueOnce(articleBookmarkRecord);

    const response = await request(createApp())
      .post('/api/me/bookmarks')
      .set('Cookie', authCookie)
      .send({
        targetType: 'article',
        targetId: articleRecord.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'bookmark_article_1',
      targetType: 'article',
      targetId: articleRecord.id,
      title: articleRecord.title,
    });
    expect(prismaMock.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: articleRecord.id,
          isPublished: true,
        },
      }),
    );
    expect(prismaMock.bookmark.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: authUserRecord.id,
          articleId: articleRecord.id,
        },
      }),
    );
  });

  it('creates a course bookmark for the authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.course.findFirst.mockResolvedValueOnce(courseRecord);
    prismaMock.bookmark.findFirst.mockResolvedValueOnce(null);
    prismaMock.bookmark.create.mockResolvedValueOnce(courseBookmarkRecord);

    const response = await request(createApp())
      .post('/api/me/bookmarks')
      .set('Cookie', authCookie)
      .send({
        targetType: 'course',
        targetId: courseRecord.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'bookmark_course_1',
      targetType: 'course',
      targetId: courseRecord.id,
      title: courseRecord.title,
    });
    expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: courseRecord.id,
          isPublished: true,
        },
      }),
    );
    expect(prismaMock.bookmark.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: authUserRecord.id,
          courseId: courseRecord.id,
        },
      }),
    );
  });

  it('handles duplicate bookmark creation cleanly', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.article.findFirst.mockResolvedValueOnce(articleRecord);
    prismaMock.bookmark.findFirst.mockResolvedValueOnce(articleBookmarkRecord);

    const response = await request(createApp())
      .post('/api/me/bookmarks')
      .set('Cookie', authCookie)
      .send({
        targetType: 'article',
        targetId: articleRecord.id,
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('BOOKMARK_ALREADY_EXISTS');
    expect(prismaMock.bookmark.create).not.toHaveBeenCalled();
  });

  it('deletes a bookmark owned by the authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.bookmark.findFirst.mockResolvedValueOnce({
      id: articleBookmarkRecord.id,
    });
    prismaMock.bookmark.delete.mockResolvedValueOnce(articleBookmarkRecord);

    const response = await request(createApp())
      .delete('/api/me/bookmarks/bookmark_article_1')
      .set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      success: true,
    });
    expect(prismaMock.bookmark.delete).toHaveBeenCalledWith({
      where: {
        id: articleBookmarkRecord.id,
      },
    });
  });

  it('does not delete another user bookmark', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.bookmark.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp())
      .delete('/api/me/bookmarks/bookmark_other_user')
      .set('Cookie', authCookie);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('BOOKMARK_NOT_FOUND');
    expect(prismaMock.bookmark.delete).not.toHaveBeenCalled();
  });

  it('returns not found when deleting a missing bookmark', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.bookmark.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp())
      .delete('/api/me/bookmarks/bookmark_missing')
      .set('Cookie', authCookie);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('BOOKMARK_NOT_FOUND');
  });

  it('rejects invalid create payloads', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);

    const response = await request(createApp())
      .post('/api/me/bookmarks')
      .set('Cookie', authCookie)
      .send({
        targetType: 'article',
        targetId: articleRecord.id,
        courseId: courseRecord.id,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(prismaMock.article.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.bookmark.create).not.toHaveBeenCalled();
  });
});
