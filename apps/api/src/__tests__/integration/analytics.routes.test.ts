import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  toolRun: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  tool: {
    findMany: vi.fn(),
  },
  template: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  productEvent: {
    count: vi.fn(),
    groupBy: vi.fn(),
    create: vi.fn(),
  },
  bookmark: {
    count: vi.fn(),
  },
  article: {
    findMany: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
  },
  discussion: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  discussionReply: {
    count: vi.fn(),
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
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

const adminUserRecord = {
  id: 'user_admin',
  email: 'admin@devagentshub.local',
  passwordHash: 'hashed-password',
  role: 'ADMIN',
  profile: {
    id: 'profile_admin',
    userId: 'user_admin',
    displayName: 'Admin User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const standardUserRecord = {
  id: 'user_member',
  email: 'member@example.com',
  passwordHash: 'hashed-password',
  role: 'USER',
  profile: {
    id: 'profile_member',
    userId: 'user_member',
    displayName: 'Member User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const adminCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(adminUserRecord.id)}`;
const memberCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(standardUserRecord.id)}`;

describe('admin analytics routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.toolRun.count.mockReset();
    prismaMock.toolRun.findMany.mockReset();
    prismaMock.tool.findMany.mockReset();
    prismaMock.template.count.mockReset();
    prismaMock.template.findMany.mockReset();
    prismaMock.productEvent.count.mockReset();
    prismaMock.productEvent.groupBy.mockReset();
    prismaMock.productEvent.create.mockReset();
    prismaMock.bookmark.count.mockReset();
    prismaMock.article.findMany.mockReset();
    prismaMock.course.findMany.mockReset();
    prismaMock.discussion.count.mockReset();
    prismaMock.discussion.findMany.mockReset();
    prismaMock.discussionReply.count.mockReset();
  });

  const mockOverviewData = () => {
    prismaMock.toolRun.count.mockResolvedValue(6);
    prismaMock.tool.findMany.mockResolvedValue([
      {
        slug: 'prompt-generator',
        name: 'Prompt Generator',
        category: 'PROMPTING',
        _count: {
          runs: 4,
        },
      },
      {
        slug: 'debug-helper',
        name: 'Debug Helper',
        category: 'DEBUGGING',
        _count: {
          runs: 2,
        },
      },
    ]);
    prismaMock.toolRun.findMany.mockResolvedValue([
      {
        id: 'run_1',
        createdAt: new Date('2026-04-10T08:00:00.000Z'),
        tool: {
          slug: 'prompt-generator',
          name: 'Prompt Generator',
        },
      },
    ]);
    prismaMock.template.count.mockResolvedValue(3);
    prismaMock.template.findMany.mockResolvedValue([
      {
        id: 'template_1',
        name: 'Launch brief',
        toolSlug: 'prompt-generator',
        createdAt: new Date('2026-04-10T09:00:00.000Z'),
      },
    ]);
    prismaMock.productEvent.count.mockImplementation(({ where }) => {
      if (where?.eventType === 'template_duplicated') {
        return Promise.resolve(1);
      }

      if (where?.eventType === 'article_viewed') {
        return Promise.resolve(8);
      }

      if (where?.eventType === 'course_viewed') {
        return Promise.resolve(5);
      }

      return Promise.resolve(0);
    });
    prismaMock.bookmark.count.mockImplementation(({ where } = {}) => {
      if (where?.articleId) {
        return Promise.resolve(4);
      }

      if (where?.courseId) {
        return Promise.resolve(2);
      }

      return Promise.resolve(6);
    });
    prismaMock.productEvent.groupBy.mockImplementation(({ where }) => {
      if (where?.eventType === 'article_viewed') {
        return Promise.resolve([
          {
            entityId: 'article_1',
            _count: {
              _all: 8,
            },
          },
        ]);
      }

      return Promise.resolve([
        {
          entityId: 'course_1',
          _count: {
            _all: 5,
          },
        },
      ]);
    });
    prismaMock.article.findMany.mockResolvedValue([
      {
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        title: 'Brief Coding Agents Clearly',
        excerpt: 'Use explicit scope and constraints.',
      },
    ]);
    prismaMock.course.findMany.mockResolvedValue([
      {
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'AI Agents for Developers',
        description: 'A compact course for using coding agents well.',
      },
    ]);
    prismaMock.discussion.count.mockResolvedValue(2);
    prismaMock.discussionReply.count.mockResolvedValue(7);
    prismaMock.discussion.findMany.mockResolvedValue([
      {
        id: 'discussion_1',
        slug: 'how-to-review-agent-output',
        title: 'How to review agent output?',
        createdAt: new Date('2026-04-10T10:00:00.000Z'),
        _count: {
          replies: 3,
        },
      },
    ]);
  };

  it('allows an admin to read the analytics overview', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    mockOverviewData();

    const response = await request(createApp())
      .get('/api/admin/analytics/overview')
      .set('Cookie', adminCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      tools: {
        totalRuns: 6,
        runsByTool: expect.arrayContaining([
          expect.objectContaining({
            key: 'prompt-generator',
            value: 4,
          }),
        ]),
      },
      templates: {
        totalTemplates: 3,
        duplicatedTemplates: 1,
      },
      bookmarks: {
        totalBookmarks: 6,
      },
      content: {
        articleViews: 8,
        courseViews: 5,
        topArticles: expect.arrayContaining([
          expect.objectContaining({
            label: 'Brief Coding Agents Clearly',
            value: 8,
          }),
        ]),
      },
      community: {
        totalDiscussions: 2,
        totalReplies: 7,
      },
    });
  });

  it('rejects non-admin analytics access', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(standardUserRecord);

    const response = await request(createApp())
      .get('/api/admin/analytics/overview')
      .set('Cookie', memberCookie);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(prismaMock.toolRun.count).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated analytics access', async () => {
    const response = await request(createApp()).get('/api/admin/analytics/overview');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(prismaMock.toolRun.count).not.toHaveBeenCalled();
  });
});
