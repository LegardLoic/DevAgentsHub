import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  article: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createApp } from '../../app/create-app';

const baseDates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

describe('article routes', () => {
  beforeEach(() => {
    prismaMock.article.findMany.mockReset();
    prismaMock.article.findFirst.mockReset();
  });

  it('returns the published article list', async () => {
    prismaMock.article.findMany.mockResolvedValueOnce([
      {
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        title: 'How to Brief Coding Agents Clearly',
        excerpt: 'Strong briefs reduce rework when they stay specific and grounded in the current repo.',
        content: '# Brief coding agents clearly',
        ...baseDates,
      },
      {
        id: 'article_2',
        slug: 'structure-ai-dev-projects-cleanly',
        title: 'How to Structure AI-Assisted Projects Cleanly',
        excerpt: 'AI speed makes it tempting to collapse responsibilities too early.',
        content: '# Structure AI-assisted projects cleanly',
        ...baseDates,
      },
    ]);

    const response = await request(createApp()).get('/api/articles');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      slug: 'brief-coding-agents-clearly',
      title: 'How to Brief Coding Agents Clearly',
    });
    expect(prismaMock.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('returns an article detail by slug', async () => {
    prismaMock.article.findFirst.mockResolvedValueOnce({
      id: 'article_1',
      slug: 'brief-coding-agents-clearly',
      title: 'How to Brief Coding Agents Clearly',
      excerpt: 'Strong briefs reduce rework when they stay specific and grounded in the current repo.',
      content: '# Brief coding agents clearly\n\nUse the architecture as part of the prompt.',
      ...baseDates,
    });

    const response = await request(createApp()).get('/api/articles/brief-coding-agents-clearly');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      slug: 'brief-coding-agents-clearly',
      title: 'How to Brief Coding Agents Clearly',
    });
    expect(response.body.data.content).toContain('Use the architecture as part of the prompt.');
    expect(prismaMock.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'brief-coding-agents-clearly',
          isPublished: true,
        },
      }),
    );
  });

  it('returns a not found error for an unknown article slug', async () => {
    prismaMock.article.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp()).get('/api/articles/missing-guide');

    expect(response.status).toBe(404);
    expect(response.body.error).toMatchObject({
      code: 'ARTICLE_NOT_FOUND',
      message: 'The requested article could not be found.',
    });
  });
});
