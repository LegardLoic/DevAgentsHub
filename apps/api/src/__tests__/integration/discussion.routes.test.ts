import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  discussion: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  discussionReply: {
    create: vi.fn(),
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
  id: 'user_community',
  email: 'community@example.com',
  passwordHash: 'hashed-password',
  role: 'USER',
  profile: {
    id: 'profile_community',
    userId: 'user_community',
    displayName: 'Community Author',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const authCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(authUserRecord.id)}`;

describe('discussion routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.discussion.findMany.mockReset();
    prismaMock.discussion.findUnique.mockReset();
    prismaMock.discussion.create.mockReset();
    prismaMock.discussionReply.create.mockReset();
  });

  it('lists discussion previews', async () => {
    prismaMock.discussion.findMany.mockResolvedValueOnce([
      {
        id: 'discussion_1',
        slug: 'render-deploy-flow',
        title: 'Render deploy flow',
        content: 'How do you keep CI, preview checks, and production deploys aligned?',
        user: authUserRecord,
        _count: {
          replies: 2,
        },
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      },
    ]);

    const response = await request(createApp()).get('/api/discussions');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      slug: 'render-deploy-flow',
      repliesCount: 2,
      author: {
        email: 'community@example.com',
      },
    });
  });

  it('creates a discussion when authenticated', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.discussion.findUnique.mockResolvedValueOnce(null);
    prismaMock.discussion.create.mockResolvedValueOnce({
      id: 'discussion_2',
      slug: 'testing-course-progress-endpoints',
      title: 'Testing course progress endpoints',
      content: 'How should we cover course progress endpoints without turning the suite into a full database integration test?',
      user: authUserRecord,
      replies: [],
      createdAt: new Date('2026-02-02T00:00:00.000Z'),
    });

    const response = await request(createApp())
      .post('/api/discussions')
      .set('Cookie', authCookie)
      .send({
        title: 'Testing course progress endpoints',
        content:
          'How should we cover course progress endpoints without turning the suite into a full database integration test?',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      slug: 'testing-course-progress-endpoints',
      repliesCount: 0,
      author: {
        id: authUserRecord.id,
      },
    });
    expect(prismaMock.discussion.create).toHaveBeenCalledTimes(1);
  });

  it('creates a reply when authenticated', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.discussion.findUnique.mockResolvedValueOnce({
      id: 'discussion_1',
      userId: authUserRecord.id,
      slug: 'render-deploy-flow',
      title: 'Render deploy flow',
      content: 'How do you keep CI, preview checks, and production deploys aligned?',
      ...baseDates,
    });
    prismaMock.discussionReply.create.mockResolvedValueOnce({
      id: 'reply_1',
      content: 'We mock Prisma in integration tests and keep one real smoke path against the seeded database.',
      user: authUserRecord,
      createdAt: new Date('2026-02-03T00:00:00.000Z'),
    });

    const response = await request(createApp())
      .post('/api/discussions/discussion_1/replies')
      .set('Cookie', authCookie)
      .send({
        content: 'We mock Prisma in integration tests and keep one real smoke path against the seeded database.',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'reply_1',
      author: {
        email: authUserRecord.email,
      },
    });
    expect(prismaMock.discussionReply.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discussionId: 'discussion_1',
          userId: authUserRecord.id,
        }),
      }),
    );
  });
});
