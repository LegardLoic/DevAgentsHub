import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  lesson: {
    findUnique: vi.fn(),
  },
  lessonProgress: {
    upsert: vi.fn(),
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
  id: 'user_learning',
  email: 'learning@example.com',
  passwordHash: 'hashed-password',
  role: 'USER',
  profile: {
    id: 'profile_learning',
    userId: 'user_learning',
    displayName: 'Learning User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const authCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(authUserRecord.id)}`;

describe('course routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.course.findMany.mockReset();
    prismaMock.course.findFirst.mockReset();
    prismaMock.lesson.findUnique.mockReset();
    prismaMock.lessonProgress.upsert.mockReset();
  });

  it('lists published courses', async () => {
    prismaMock.course.findMany.mockResolvedValueOnce([
      {
        id: 'course_1',
        slug: 'fullstack-mvp-foundations',
        title: 'Fullstack MVP Foundations',
        description: 'Ship a production-minded MVP without skipping the foundations.',
        isPublished: true,
        _count: {
          lessons: 3,
        },
        ...baseDates,
      },
    ]);

    const response = await request(createApp()).get('/api/courses');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      expect.objectContaining({
        slug: 'fullstack-mvp-foundations',
        lessonsCount: 3,
      }),
    ]);
  });

  it('returns the course detail with ordered lessons', async () => {
    prismaMock.course.findFirst.mockResolvedValueOnce({
      id: 'course_1',
      slug: 'fullstack-mvp-foundations',
      title: 'Fullstack MVP Foundations',
      description: 'Ship a production-minded MVP without skipping the foundations.',
      isPublished: true,
      lessons: [
        {
          id: 'lesson_1',
          slug: 'model-the-domain',
          title: 'Model the domain',
          order: 1,
          excerpt: 'Map the product domain before coding.',
        },
        {
          id: 'lesson_2',
          slug: 'stabilize-deploy-flow',
          title: 'Stabilize the deploy flow',
          order: 2,
          excerpt: 'Connect CI and deployment without manual steps.',
        },
      ],
      ...baseDates,
    });

    const response = await request(createApp()).get('/api/courses/fullstack-mvp-foundations');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      slug: 'fullstack-mvp-foundations',
      lessonsCount: 2,
    });
    expect(response.body.data.lessons).toEqual([
      expect.objectContaining({ slug: 'model-the-domain', order: 1 }),
      expect.objectContaining({ slug: 'stabilize-deploy-flow', order: 2 }),
    ]);
  });

  it('returns a lesson detail', async () => {
    prismaMock.lesson.findUnique.mockResolvedValueOnce({
      id: 'lesson_1',
      slug: 'model-the-domain',
      title: 'Model the domain',
      order: 1,
      content: 'Use explicit models, shared types, and testable boundaries.',
      course: {
        id: 'course_1',
        slug: 'fullstack-mvp-foundations',
        title: 'Fullstack MVP Foundations',
        isPublished: true,
      },
      progress: undefined,
      ...baseDates,
    });

    const response = await request(createApp()).get('/api/courses/lessons/model-the-domain');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      slug: 'model-the-domain',
      course: {
        slug: 'fullstack-mvp-foundations',
      },
    });
    expect(response.body.data.progress).toBeNull();
  });

  it('updates lesson progress when authenticated', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.lesson.findUnique.mockResolvedValueOnce({
      id: 'lesson_1',
      slug: 'model-the-domain',
      title: 'Model the domain',
      excerpt: 'Map the product domain before coding.',
      content: 'Use explicit models, shared types, and testable boundaries.',
      order: 1,
      courseId: 'course_1',
      course: {
        id: 'course_1',
        slug: 'fullstack-mvp-foundations',
        title: 'Fullstack MVP Foundations',
        description: 'Ship a production-minded MVP without skipping the foundations.',
        isPublished: true,
        ...baseDates,
      },
      progress: [],
      ...baseDates,
    });
    prismaMock.lessonProgress.upsert.mockResolvedValueOnce({
      id: 'progress_1',
      userId: authUserRecord.id,
      lessonId: 'lesson_1',
      completed: true,
      completedAt: new Date('2026-02-04T00:00:00.000Z'),
      ...baseDates,
    });

    const response = await request(createApp())
      .post('/api/courses/lessons/lesson_1/progress')
      .set('Cookie', authCookie)
      .send({
        completed: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      lessonId: 'lesson_1',
      completed: true,
    });
    expect(prismaMock.lessonProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_lessonId: {
            lessonId: 'lesson_1',
            userId: authUserRecord.id,
          },
        },
      }),
    );
  });
});
