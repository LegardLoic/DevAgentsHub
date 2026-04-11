import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  article: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  lesson: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

describe('admin content routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.article.findMany.mockReset();
    prismaMock.article.findUnique.mockReset();
    prismaMock.article.create.mockReset();
    prismaMock.article.update.mockReset();
    prismaMock.course.findMany.mockReset();
    prismaMock.course.findUnique.mockReset();
    prismaMock.course.create.mockReset();
    prismaMock.course.update.mockReset();
    prismaMock.lesson.findUnique.mockReset();
    prismaMock.lesson.create.mockReset();
    prismaMock.lesson.update.mockReset();
  });

  it('allows an admin to list articles', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.article.findMany.mockResolvedValueOnce([
      {
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        title: 'How to Brief Coding Agents Clearly',
        excerpt: 'Strong briefs reduce rework when they stay specific and grounded in the current repo.',
        metaDescription: 'SEO description for briefing coding agents clearly.',
        content: '# Brief coding agents clearly',
        isPublished: true,
        ...baseDates,
      },
    ]);

    const response = await request(createApp()).get('/api/admin/articles').set('Cookie', adminCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      expect.objectContaining({
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        isPublished: true,
      }),
    ]);
  });

  it('allows an admin to create an article', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.article.findUnique.mockResolvedValueOnce(null);
    prismaMock.article.create.mockResolvedValueOnce({
      id: 'article_2',
      slug: 'writing-better-mvp-flows',
      title: 'Writing Better MVP Flows',
      excerpt: 'A pragmatic guide to keeping MVP flows coherent across product slices.',
      metaDescription: 'Keep MVP product flows coherent across tools, content, learning, and community.',
      content: '# Writing Better MVP Flows',
      isPublished: false,
      ...baseDates,
    });

    const response = await request(createApp())
      .post('/api/admin/articles')
      .set('Cookie', adminCookie)
      .send({
        title: 'Writing Better MVP Flows',
        slug: 'writing-better-mvp-flows',
        excerpt: 'A pragmatic guide to keeping MVP flows coherent across product slices.',
        metaDescription: 'Keep MVP product flows coherent across tools, content, learning, and community.',
        content:
          '# Writing Better MVP Flows\n\nKeep the product slices cohesive and release them in bounded increments.',
        isPublished: false,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'article_2',
      slug: 'writing-better-mvp-flows',
      metaDescription: 'Keep MVP product flows coherent across tools, content, learning, and community.',
      isPublished: false,
    });
    expect(prismaMock.article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'writing-better-mvp-flows',
          metaDescription: 'Keep MVP product flows coherent across tools, content, learning, and community.',
        }),
      }),
    );
  });

  it('allows an admin to update an article', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.article.findUnique
      .mockResolvedValueOnce({
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        title: 'How to Brief Coding Agents Clearly',
        excerpt: 'Strong briefs reduce rework when they stay specific and grounded in the current repo.',
        metaDescription: 'SEO description for briefing coding agents clearly.',
        content: '# Brief coding agents clearly',
        isPublished: true,
        ...baseDates,
      })
      .mockResolvedValueOnce({
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        title: 'How to Brief Coding Agents Clearly',
        excerpt: 'Strong briefs reduce rework when they stay specific and grounded in the current repo.',
        metaDescription: 'SEO description for briefing coding agents clearly.',
        content: '# Brief coding agents clearly',
        isPublished: true,
        ...baseDates,
      });
    prismaMock.article.update.mockResolvedValueOnce({
      id: 'article_1',
      slug: 'brief-coding-agents-clearly',
      title: 'How to Brief Coding Agents Clearly',
      excerpt: 'Updated editorial positioning for the guide.',
      metaDescription: null,
      content: '# Brief coding agents clearly',
      isPublished: false,
      ...baseDates,
    });

    const response = await request(createApp())
      .patch('/api/admin/articles/article_1')
      .set('Cookie', adminCookie)
      .send({
        title: 'How to Brief Coding Agents Clearly',
        slug: 'brief-coding-agents-clearly',
        excerpt: 'Updated editorial positioning for the guide.',
        metaDescription: '',
        content:
          '# Brief coding agents clearly\n\nMake the current architecture part of the prompt and review loop.',
        isPublished: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 'article_1',
      metaDescription: null,
      isPublished: false,
    });
  });

  it('rejects non-admin article access', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(standardUserRecord);

    const response = await request(createApp()).get('/api/admin/articles').set('Cookie', memberCookie);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(prismaMock.article.findMany).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated article access', async () => {
    const response = await request(createApp()).get('/api/admin/articles');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows an admin to list courses', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.course.findMany.mockResolvedValueOnce([
      {
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'Getting Started with AI Agents for Development',
        description: 'A compact learning path on briefing agents well and reviewing results critically.',
        isPublished: true,
        _count: {
          lessons: 3,
        },
        ...baseDates,
      },
    ]);

    const response = await request(createApp()).get('/api/admin/courses').set('Cookie', adminCookie);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      id: 'course_1',
      lessonsCount: 3,
    });
  });

  it('allows an admin to create a course', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.course.findUnique.mockResolvedValueOnce(null);
    prismaMock.course.create.mockResolvedValueOnce({
      id: 'course_2',
      slug: 'editorial-ops-for-dev-platforms',
      title: 'Editorial Ops for Dev Platforms',
      description: 'Build a clean loop between content, tooling, and learning.',
      isPublished: false,
      lessons: [],
      ...baseDates,
    });

    const response = await request(createApp())
      .post('/api/admin/courses')
      .set('Cookie', adminCookie)
      .send({
        title: 'Editorial Ops for Dev Platforms',
        slug: 'editorial-ops-for-dev-platforms',
        description: 'Build a clean loop between content, tooling, and learning.',
        isPublished: false,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'course_2',
      slug: 'editorial-ops-for-dev-platforms',
    });
  });

  it('allows an admin to update a course', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.course.findUnique
      .mockResolvedValueOnce({
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'Getting Started with AI Agents for Development',
        description: 'A compact learning path on briefing agents well and reviewing results critically.',
        isPublished: true,
        lessons: [],
        ...baseDates,
      })
      .mockResolvedValueOnce({
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'Getting Started with AI Agents for Development',
        description: 'A compact learning path on briefing agents well and reviewing results critically.',
        isPublished: true,
        _count: {
          lessons: 3,
        },
        ...baseDates,
      });
    prismaMock.course.update.mockResolvedValueOnce({
      id: 'course_1',
      slug: 'ai-agents-for-developers',
      title: 'Getting Started with AI Agents for Development',
      description: 'Updated admin description for the learning path.',
      isPublished: false,
      lessons: [],
      ...baseDates,
    });

    const response = await request(createApp())
      .patch('/api/admin/courses/course_1')
      .set('Cookie', adminCookie)
      .send({
        title: 'Getting Started with AI Agents for Development',
        slug: 'ai-agents-for-developers',
        description: 'Updated admin description for the learning path.',
        isPublished: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 'course_1',
      isPublished: false,
    });
  });

  it('rejects non-admin course access', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(standardUserRecord);

    const response = await request(createApp()).get('/api/admin/courses').set('Cookie', memberCookie);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects unauthenticated course access', async () => {
    const response = await request(createApp()).get('/api/admin/courses');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows an admin to create a lesson for a course', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.course.findUnique.mockResolvedValueOnce({
      id: 'course_1',
      slug: 'ai-agents-for-developers',
      title: 'Getting Started with AI Agents for Development',
      description: 'A compact learning path on briefing agents well and reviewing results critically.',
      isPublished: true,
      lessons: [],
      ...baseDates,
    });
    prismaMock.lesson.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    prismaMock.lesson.create.mockResolvedValueOnce({
      id: 'lesson_4',
      courseId: 'course_1',
      slug: 'publish-content-with-confidence',
      title: 'Publish content with confidence',
      excerpt: 'Add a review loop before shipping guides and lessons.',
      content: 'Keep the content loop bounded, typed, and easy to publish.',
      order: 4,
      course: {
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'Getting Started with AI Agents for Development',
      },
      ...baseDates,
    });

    const response = await request(createApp())
      .post('/api/admin/courses/course_1/lessons')
      .set('Cookie', adminCookie)
      .send({
        title: 'Publish content with confidence',
        slug: 'publish-content-with-confidence',
        excerpt: 'Add a review loop before shipping guides and lessons.',
        content:
          'Keep the content loop bounded, typed, and easy to publish. Document the publication bar explicitly.',
        order: 4,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'lesson_4',
      course: {
        id: 'course_1',
      },
    });
  });

  it('allows an admin to update a lesson', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(adminUserRecord);
    prismaMock.lesson.findUnique
      .mockResolvedValueOnce({
        id: 'lesson_2',
        courseId: 'course_1',
        slug: 'structure-agent-workflows',
        title: 'Structure agent workflows',
        excerpt: 'Use bounded prompts and review loops.',
        order: 2,
        content: 'Original lesson content',
        ...baseDates,
      })
      .mockResolvedValueOnce({
        id: 'lesson_2',
        courseId: 'course_1',
        slug: 'structure-agent-workflows',
        title: 'Structure agent workflows',
        excerpt: 'Use bounded prompts and review loops.',
        order: 2,
        content: 'Original lesson content',
        ...baseDates,
      })
      .mockResolvedValueOnce({
        id: 'lesson_2',
        courseId: 'course_1',
        slug: 'structure-agent-workflows',
        title: 'Structure agent workflows',
        excerpt: 'Use bounded prompts and review loops.',
        order: 2,
        content: 'Original lesson content',
        ...baseDates,
      });
    prismaMock.lesson.update.mockResolvedValueOnce({
      id: 'lesson_2',
      courseId: 'course_1',
      slug: 'structure-agent-workflows',
      title: 'Structure agent workflows',
      excerpt: 'Updated excerpt for admin editing.',
      content: 'Updated lesson content that keeps the workflow explicit and reviewable.',
      order: 2,
      course: {
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'Getting Started with AI Agents for Development',
      },
      ...baseDates,
    });

    const response = await request(createApp())
      .patch('/api/admin/lessons/lesson_2')
      .set('Cookie', adminCookie)
      .send({
        title: 'Structure agent workflows',
        slug: 'structure-agent-workflows',
        excerpt: 'Updated excerpt for admin editing.',
        content: 'Updated lesson content that keeps the workflow explicit and reviewable.',
        order: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 'lesson_2',
      excerpt: 'Updated excerpt for admin editing.',
    });
  });

  it('rejects non-admin lesson access', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(standardUserRecord);

    const response = await request(createApp())
      .post('/api/admin/courses/course_1/lessons')
      .set('Cookie', memberCookie)
      .send({
        title: 'Publish content with confidence',
        slug: 'publish-content-with-confidence',
        excerpt: 'Add a review loop before shipping guides and lessons.',
        content:
          'Keep the content loop bounded, typed, and easy to publish. Document the publication bar explicitly.',
        order: 4,
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects unauthenticated lesson access', async () => {
    const response = await request(createApp())
      .patch('/api/admin/lessons/lesson_2')
      .send({
        title: 'Structure agent workflows',
        slug: 'structure-agent-workflows',
        excerpt: 'Updated excerpt for admin editing.',
        content: 'Updated lesson content that keeps the workflow explicit and reviewable.',
        order: 2,
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
