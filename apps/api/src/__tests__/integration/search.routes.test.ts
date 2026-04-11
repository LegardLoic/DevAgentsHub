import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  tool: {
    findMany: vi.fn(),
  },
  article: {
    findMany: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
  },
  discussion: {
    findMany: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createApp } from '../../app/create-app';

describe('search routes', () => {
  beforeEach(() => {
    prismaMock.tool.findMany.mockReset();
    prismaMock.article.findMany.mockReset();
    prismaMock.course.findMany.mockReset();
    prismaMock.discussion.findMany.mockReset();
  });

  const mockSearchResults = () => {
    prismaMock.tool.findMany.mockResolvedValue([
      {
        id: 'tool_1',
        slug: 'prompt-generator',
        name: 'Prompt Generator',
        description: 'Build structured prompts for coding agents.',
        category: 'PROMPTING',
      },
    ]);
    prismaMock.article.findMany.mockResolvedValue([
      {
        id: 'article_1',
        slug: 'brief-coding-agents-clearly',
        title: 'How to Brief Coding Agents Clearly',
        excerpt: 'Use explicit scope and constraints.',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    ]);
    prismaMock.course.findMany.mockResolvedValue([
      {
        id: 'course_1',
        slug: 'ai-agents-for-developers',
        title: 'Getting Started with AI Agents for Development',
        description: 'A compact learning path for working with agents.',
        _count: {
          lessons: 3,
        },
      },
    ]);
    prismaMock.discussion.findMany.mockResolvedValue([
      {
        id: 'discussion_1',
        slug: 'how-to-review-agent-output',
        title: 'How to review agent output?',
        content: 'What is your review checklist before merging code produced by an agent?',
        createdAt: new Date('2026-04-02T00:00:00.000Z'),
        _count: {
          replies: 2,
        },
      },
    ]);
  };

  it('returns grouped cross-product search results', async () => {
    mockSearchResults();

    const response = await request(createApp()).get('/api/search?q=agent');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      query: 'agent',
      type: 'all',
      totalCount: 4,
      groups: [
        {
          type: 'tool',
          count: 1,
          items: [
            expect.objectContaining({
              title: 'Prompt Generator',
              href: '/tools/prompt-generator',
            }),
          ],
        },
        {
          type: 'guide',
          count: 1,
          items: [
            expect.objectContaining({
              title: 'How to Brief Coding Agents Clearly',
              href: '/guides/brief-coding-agents-clearly',
            }),
          ],
        },
        {
          type: 'course',
          count: 1,
          items: [
            expect.objectContaining({
              title: 'Getting Started with AI Agents for Development',
              href: '/formations/ai-agents-for-developers',
            }),
          ],
        },
        {
          type: 'discussion',
          count: 1,
          items: [
            expect.objectContaining({
              title: 'How to review agent output?',
              href: '/community/how-to-review-agent-output',
            }),
          ],
        },
      ],
    });
  });

  it('returns empty groups without querying for too-short queries', async () => {
    const response = await request(createApp()).get('/api/search?q=a');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      query: 'a',
      totalCount: 0,
      minimumQueryLength: 2,
    });
    expect(response.body.data.groups).toHaveLength(4);
    expect(response.body.data.groups.every((group: { count: number }) => group.count === 0)).toBe(
      true,
    );
    expect(prismaMock.tool.findMany).not.toHaveBeenCalled();
    expect(prismaMock.article.findMany).not.toHaveBeenCalled();
    expect(prismaMock.course.findMany).not.toHaveBeenCalled();
    expect(prismaMock.discussion.findMany).not.toHaveBeenCalled();
  });

  it('supports filtering by content type', async () => {
    prismaMock.tool.findMany.mockResolvedValue([
      {
        id: 'tool_2',
        slug: 'debug-helper',
        name: 'Debug Helper',
        description: 'Turn errors into a debugging plan.',
        category: 'DEBUGGING',
      },
    ]);

    const response = await request(createApp()).get('/api/search?q=debug&type=tools');

    expect(response.status).toBe(200);
    expect(response.body.data.type).toBe('tools');
    expect(response.body.data.groups).toHaveLength(1);
    expect(response.body.data.groups[0]).toMatchObject({
      type: 'tool',
      count: 1,
    });
    expect(prismaMock.tool.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.article.findMany).not.toHaveBeenCalled();
    expect(prismaMock.course.findMany).not.toHaveBeenCalled();
    expect(prismaMock.discussion.findMany).not.toHaveBeenCalled();
  });

  it('only searches public or published product surfaces', async () => {
    mockSearchResults();

    await request(createApp()).get('/api/search?q=agent');

    expect(prismaMock.tool.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
        }),
      }),
    );
    expect(prismaMock.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
        }),
      }),
    );
    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
        }),
      }),
    );
  });

  it('rejects invalid type filters', async () => {
    const response = await request(createApp()).get('/api/search?q=agent&type=admin');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
